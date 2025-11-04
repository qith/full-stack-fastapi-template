from typing import List, Optional
from uuid import UUID
from datetime import datetime
from sqlmodel import Session, select, func
from fastapi import HTTPException

from app.models_pm import ProductDict, ProjectProduct
from app.schemas_pm import ProductDictCreate, ProductDictUpdate


class ProductDictService:
    def __init__(self, db: Session):
        self.db = db

    def create_product_dict(self, product_dict_in: ProductDictCreate) -> ProductDict:
        """创建产品字典"""
        # 检查产品名称是否已存在
        existing = self.db.exec(
            select(ProductDict).where(ProductDict.name == product_dict_in.name)
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="产品名称已存在")
        
        product_dict = ProductDict(**product_dict_in.dict())
        self.db.add(product_dict)
        self.db.commit()
        self.db.refresh(product_dict)
        return product_dict

    def get_product_dicts(self, skip: int = 0, limit: int = 100) -> List[ProductDict]:
        """获取产品字典列表"""
        statement = select(ProductDict).offset(skip).limit(limit).order_by(ProductDict.name)
        return list(self.db.exec(statement).all())

    def get_product_dict(self, product_dict_id: UUID) -> Optional[ProductDict]:
        """获取单个产品字典"""
        return self.db.get(ProductDict, product_dict_id)

    def update_product_dict(self, product_dict_id: UUID, product_dict_in: ProductDictUpdate) -> Optional[ProductDict]:
        """更新产品字典"""
        product_dict = self.db.get(ProductDict, product_dict_id)
        if not product_dict:
            return None
        
        # 如果更新名称，检查新名称是否已存在
        if product_dict_in.name and product_dict_in.name != product_dict.name:
            existing = self.db.exec(
                select(ProductDict).where(ProductDict.name == product_dict_in.name)
            ).first()
            if existing:
                raise HTTPException(status_code=400, detail="产品名称已存在")
        
        update_data = product_dict_in.dict(exclude_unset=True)
        update_data['updated_at'] = datetime.utcnow()
        
        for field, value in update_data.items():
            setattr(product_dict, field, value)
        
        self.db.add(product_dict)
        self.db.commit()
        self.db.refresh(product_dict)
        return product_dict

    def delete_product_dict(self, product_dict_id: UUID) -> bool:
        """删除产品字典"""
        product_dict = self.db.get(ProductDict, product_dict_id)
        if not product_dict:
            return False
        
        self.db.delete(product_dict)
        self.db.commit()
        return True

    def import_from_projects(self) -> dict:
        """从现有项目产品中导入产品名称到字典"""
        try:
            # 获取所有唯一的产品名称，使用group_by确保唯一性
            statement = select(ProjectProduct.product_name).group_by(ProjectProduct.product_name)
            results = self.db.exec(statement).all()
            
            product_names = [name for name in results if name and name.strip()]
            
            # 获取已存在的产品字典名称
            existing_dicts = self.db.exec(select(ProductDict.name)).all()
            existing_names = set(existing_dicts)
            
            # 统计信息
            imported_count = 0
            skipped_count = 0
            errors = []
            
            # 导入新产品
            for product_name in product_names:
                product_name = product_name.strip()
                if not product_name:
                    continue
                    
                if product_name not in existing_names:
                    try:
                        product_dict = ProductDict(name=product_name)
                        self.db.add(product_dict)
                        imported_count += 1
                        existing_names.add(product_name)
                    except Exception as e:
                        # 如果添加失败（可能是并发冲突或唯一性约束），跳过
                        skipped_count += 1
                        errors.append(f"产品 '{product_name}': {str(e)}")
                        continue
                else:
                    skipped_count += 1
            
            self.db.commit()
            
            result = {
                "imported": imported_count,
                "skipped": skipped_count,
                "total": len(product_names)
            }
            
            if errors:
                result["errors"] = errors[:10]  # 只返回前10个错误
            
            return result
            
        except Exception as e:
            self.db.rollback()
            raise HTTPException(status_code=500, detail=f"导入失败: {str(e)}")

