from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from app.api.deps import SessionDep, CurrentUser
from app.services.product_dict_service import ProductDictService
from app.schemas_pm import ProductDict, ProductDictCreate, ProductDictUpdate

router = APIRouter()


@router.post("/", response_model=ProductDict)
def create_product_dict(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    product_dict_in: ProductDictCreate,
) -> ProductDict:
    """
    创建产品字典
    """
    product_dict_service = ProductDictService(session)
    return product_dict_service.create_product_dict(product_dict_in)


@router.get("/", response_model=List[ProductDict])
def read_product_dicts(
    *,
    session: SessionDep,
    skip: int = 0,
    limit: int = 100,
    current_user: CurrentUser,
) -> List[ProductDict]:
    """
    获取产品字典列表
    """
    product_dict_service = ProductDictService(session)
    return product_dict_service.get_product_dicts(skip=skip, limit=limit)


@router.get("/{product_dict_id}", response_model=ProductDict)
def read_product_dict(
    *,
    session: SessionDep,
    product_dict_id: UUID,
    current_user: CurrentUser,
) -> ProductDict:
    """
    获取单个产品字典
    """
    product_dict_service = ProductDictService(session)
    product_dict = product_dict_service.get_product_dict(product_dict_id)
    if not product_dict:
        raise HTTPException(status_code=404, detail="Product dict not found")
    return product_dict


@router.put("/{product_dict_id}", response_model=ProductDict)
def update_product_dict(
    *,
    session: SessionDep,
    product_dict_id: UUID,
    product_dict_in: ProductDictUpdate,
    current_user: CurrentUser,
) -> ProductDict:
    """
    更新产品字典
    """
    product_dict_service = ProductDictService(session)
    product_dict = product_dict_service.update_product_dict(product_dict_id, product_dict_in)
    if not product_dict:
        raise HTTPException(status_code=404, detail="Product dict not found")
    return product_dict


@router.delete("/{product_dict_id}")
def delete_product_dict(
    *,
    session: SessionDep,
    product_dict_id: UUID,
    current_user: CurrentUser,
) -> dict:
    """
    删除产品字典
    """
    product_dict_service = ProductDictService(session)
    success = product_dict_service.delete_product_dict(product_dict_id)
    if not success:
        raise HTTPException(status_code=404, detail="Product dict not found")
    return {"status": "success"}


@router.post("/import-from-projects")
def import_from_projects(
    *,
    session: SessionDep,
    current_user: CurrentUser,
) -> dict:
    """
    从现有项目产品中导入产品名称到字典
    """
    product_dict_service = ProductDictService(session)
    result = product_dict_service.import_from_projects()
    return result

