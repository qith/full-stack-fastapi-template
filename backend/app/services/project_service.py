from typing import List, Optional, Dict, Any
from uuid import UUID
from sqlmodel import Session, select, func, or_
from datetime import datetime

from app.models_pm import (
    Project, ProjectProduct, RoleAssignment, Milestone, Progress
)
from app.schemas_pm import (
    ProjectCreate, ProjectUpdate,
    ProjectProductCreate, RoleAssignmentCreate, MilestoneCreate, ProgressCreate,
    ProjectStatistics, ProjectCountByLocation, ProjectCountByProduct, ProjectCountByType
)


class ProjectService:
    def __init__(self, db: Session):
        self.db = db

    # 项目CRUD操作
    def create_project(self, project_data: ProjectCreate) -> Project:
        """创建新项目"""
        # 提取产品、里程碑和角色分配数据
        products_data = project_data.products or []
        milestones_data = project_data.milestones or []
        role_assignments_data = project_data.role_assignments or []
        
        # 创建项目（不包含产品、里程碑和角色分配）
        project_dict = project_data.model_dump(exclude={'products', 'milestones', 'role_assignments'})
        project = Project(**project_dict)
        self.db.add(project)
        self.db.commit()
        self.db.refresh(project)
        
        # 创建产品
        if products_data:
            for product_data in products_data:
                product_dict = product_data if isinstance(product_data, dict) else product_data.model_dump()
                product = ProjectProduct(**product_dict, project_id=project.id)
                self.db.add(product)
        
        # 创建里程碑
        if milestones_data:
            for milestone_data in milestones_data:
                milestone_dict = milestone_data if isinstance(milestone_data, dict) else milestone_data.model_dump()
                milestone = Milestone(**milestone_dict, project_id=project.id)
                self.db.add(milestone)
        
        # 创建角色分配
        if role_assignments_data:
            for role_data in role_assignments_data:
                role_dict = role_data if isinstance(role_data, dict) else role_data.model_dump()
                role_assignment = RoleAssignment(**role_dict, project_id=project.id)
                self.db.add(role_assignment)
        
        if products_data or milestones_data or role_assignments_data:
            self.db.commit()
            self.db.refresh(project)
        
        return project

    def get_project(self, project_id: UUID) -> Optional[Project]:
        """获取项目详情"""
        return self.db.get(Project, project_id)

    def get_projects(self, skip: int = 0, limit: int = 100) -> List[Project]:
        """获取项目列表"""
        statement = select(Project).order_by(Project.created_at.desc()).offset(skip).limit(limit)
        projects = self.db.exec(statement).all()
        # 预加载关系数据
        for project in projects:
            self.db.refresh(project)
        return projects

    def update_project(self, project_id: UUID, project_data: ProjectUpdate) -> Optional[Project]:
        """更新项目信息"""
        project = self.get_project(project_id)
        if not project:
            return None

        # 处理产品更新
        if project_data.products is not None:
            # 删除现有产品
            statement = select(ProjectProduct).where(ProjectProduct.project_id == project_id)
            existing_products = self.db.exec(statement).all()
            for product in existing_products:
                self.db.delete(product)
            
            # 添加新产品
            for product_data in project_data.products:
                product_dict = product_data if isinstance(product_data, dict) else product_data.model_dump()
                product = ProjectProduct(**product_dict, project_id=project_id)
                self.db.add(product)

        # 处理里程碑更新
        if project_data.milestones is not None:
            # 删除现有里程碑
            statement = select(Milestone).where(Milestone.project_id == project_id)
            existing_milestones = self.db.exec(statement).all()
            for milestone in existing_milestones:
                self.db.delete(milestone)
            
            # 添加新里程碑
            for milestone_data in project_data.milestones:
                milestone_dict = milestone_data if isinstance(milestone_data, dict) else milestone_data.model_dump()
                milestone = Milestone(**milestone_dict, project_id=project_id)
                self.db.add(milestone)

        # 处理角色分配更新
        if project_data.role_assignments is not None:
            # 删除现有角色分配
            statement = select(RoleAssignment).where(RoleAssignment.project_id == project_id)
            existing_roles = self.db.exec(statement).all()
            for role in existing_roles:
                self.db.delete(role)
            
            # 添加新角色分配
            for role_data in project_data.role_assignments:
                role_dict = role_data if isinstance(role_data, dict) else role_data.model_dump()
                role_assignment = RoleAssignment(**role_dict, project_id=project_id)
                self.db.add(role_assignment)

        # 更新项目基本信息
        update_data = project_data.model_dump(exclude_unset=True, exclude={'products', 'milestones', 'role_assignments'})
        for key, value in update_data.items():
            setattr(project, key, value)

        project.updated_at = datetime.utcnow()
        self.db.add(project)
        self.db.commit()
        self.db.refresh(project)
        return project

    def delete_project(self, project_id: UUID) -> bool:
        """删除项目"""
        project = self.get_project(project_id)
        if not project:
            return False

        # 删除关联的角色分配
        statement = select(RoleAssignment).where(RoleAssignment.project_id == project_id)
        role_assignments = self.db.exec(statement).all()
        for role_assignment in role_assignments:
            self.db.delete(role_assignment)

        # 删除关联的里程碑
        statement = select(Milestone).where(Milestone.project_id == project_id)
        milestones = self.db.exec(statement).all()
        for milestone in milestones:
            self.db.delete(milestone)

        # 删除关联的进展
        statement = select(Progress).where(Progress.project_id == project_id)
        progresses = self.db.exec(statement).all()
        for progress in progresses:
            self.db.delete(progress)

        # 删除关联的项目产品
        statement = select(ProjectProduct).where(ProjectProduct.project_id == project_id)
        project_products = self.db.exec(statement).all()
        for project_product in project_products:
            self.db.delete(project_product)

        # 删除项目
        self.db.delete(project)
        self.db.commit()
        return True

    # 角色分配操作
    def add_role_assignment(self, project_id: UUID, role_data: RoleAssignmentCreate) -> Optional[RoleAssignment]:
        """添加角色分配"""
        project = self.get_project(project_id)
        if not project:
            return None

        role_assignment = RoleAssignment(**role_data.model_dump(), project_id=project_id)
        self.db.add(role_assignment)
        self.db.commit()
        self.db.refresh(role_assignment)
        return role_assignment

    def delete_role_assignment(self, role_assignment_id: UUID) -> bool:
        """删除角色分配"""
        role_assignment = self.db.get(RoleAssignment, role_assignment_id)
        if not role_assignment:
            return False

        self.db.delete(role_assignment)
        self.db.commit()
        return True

    # 里程碑操作
    def add_milestone(self, project_id: UUID, milestone_data: MilestoneCreate) -> Optional[Milestone]:
        """添加里程碑"""
        project = self.get_project(project_id)
        if not project:
            return None

        milestone = Milestone(**milestone_data.model_dump(), project_id=project_id)
        self.db.add(milestone)
        self.db.commit()
        self.db.refresh(milestone)
        return milestone

    def update_milestone(self, milestone_id: UUID, milestone_data: Dict[str, Any]) -> Optional[Milestone]:
        """更新里程碑"""
        milestone = self.db.get(Milestone, milestone_id)
        if not milestone:
            return None

        for key, value in milestone_data.items():
            if hasattr(milestone, key):
                setattr(milestone, key, value)

        milestone.updated_at = datetime.utcnow()
        self.db.add(milestone)
        self.db.commit()
        self.db.refresh(milestone)
        return milestone

    def get_project_milestones(self, project_id: UUID) -> List[Milestone]:
        """获取项目里程碑列表"""
        statement = select(Milestone).where(Milestone.project_id == project_id)
        return self.db.exec(statement).all()

    def delete_milestone(self, milestone_id: UUID) -> bool:
        """删除里程碑"""
        milestone = self.db.get(Milestone, milestone_id)
        if not milestone:
            return False

        self.db.delete(milestone)
        self.db.commit()
        return True

    # 进展操作
    def add_progress(self, project_id: UUID, progress_data: ProgressCreate) -> Optional[Progress]:
        """添加进展"""
        project = self.get_project(project_id)
        if not project:
            return None

        # 如果没有提供进展日期，使用当前时间
        if not progress_data.progress_date:
            progress_data_dict = progress_data.model_dump()
            progress_data_dict["progress_date"] = datetime.utcnow()
            progress = Progress(**progress_data_dict, project_id=project_id)
        else:
            progress = Progress(**progress_data.model_dump(), project_id=project_id)
            
        self.db.add(progress)
        self.db.commit()
        self.db.refresh(progress)
        return progress

    def update_progress(self, progress_id: UUID, progress_data: Dict[str, Any]) -> Optional[Progress]:
        """更新进展"""
        progress = self.db.get(Progress, progress_id)
        if not progress:
            return None

        for key, value in progress_data.items():
            if hasattr(progress, key):
                setattr(progress, key, value)

        progress.updated_at = datetime.utcnow()
        self.db.add(progress)
        self.db.commit()
        self.db.refresh(progress)
        return progress

    def get_project_progresses(self, project_id: UUID) -> List[dict]:
        """获取项目进展列表"""
        from app.models import User
        try:
            # 先获取进展数据
            progress_statement = select(Progress).where(Progress.project_id == project_id)
            progresses_data = self.db.exec(progress_statement).all()
            
            progresses = []
            for progress in progresses_data:
                progress_dict = progress.model_dump()
                
                # 单独查询每个进展的跟踪人信息
                try:
                    user_statement = select(User.full_name, User.email).where(User.id == progress.tracking_user_id)
                    user_result = self.db.exec(user_statement).first()
                    
                    if user_result:
                        full_name, email = user_result
                        display_name = full_name or email or '未知用户'
                    else:
                        display_name = '未知用户'
                except Exception as e:
                    display_name = '未知用户'
                
                progress_dict['tracking_user_name'] = display_name
                progresses.append(progress_dict)
            
            return progresses
        except Exception as e:
            # 如果查询失败，返回原始数据
            statement = select(Progress).where(Progress.project_id == project_id)
            results = self.db.exec(statement).all()
            progresses = []
            for progress in results:
                progress_dict = progress.model_dump()
                progress_dict['tracking_user_name'] = '未知用户'
                progresses.append(progress_dict)
            return progresses

    def delete_progress(self, progress_id: UUID) -> bool:
        """删除进展"""
        progress = self.db.get(Progress, progress_id)
        if not progress:
            return False

        self.db.delete(progress)
        self.db.commit()
        return True

    # 统计功能
    def get_project_statistics(self) -> ProjectStatistics:
        """获取项目统计信息（只统计非关闭项目）"""
        # 按区域统计（排除关闭项目，只统计正常和完成状态的项目）
        location_stats = []
        statement = select(Project.location, func.count(Project.id)).where(
            or_(Project.status == '正常', Project.status == '完成', Project.status.is_(None))
        ).group_by(Project.location)
        results = self.db.exec(statement).all()
        for location, count in results:
            location_stats.append(ProjectCountByLocation(location=location, count=count))

        # 按产品统计 - 统计每个产品涉及的去重项目数（排除关闭项目）
        product_stats = []
        # 使用 distinct 统计每个产品名称对应的不同项目数量，需要join Project表来过滤状态
        statement = select(
            ProjectProduct.product_name, 
            func.count(func.distinct(ProjectProduct.project_id))
        ).join(
            Project, Project.id == ProjectProduct.project_id
        ).where(
            or_(Project.status == '正常', Project.status == '完成', Project.status.is_(None))
        ).group_by(ProjectProduct.product_name)
        results = self.db.exec(statement).all()
        for product_name, count in results:
            product_stats.append(ProjectCountByProduct(product=product_name, count=count))

        # 按项目类型统计（排除关闭项目，只统计正常和完成状态的项目）
        type_stats = []
        statement = select(Project.project_type, func.count(Project.id)).where(
            or_(Project.status == '正常', Project.status == '完成', Project.status.is_(None))
        ).group_by(Project.project_type)
        results = self.db.exec(statement).all()
        for project_type, count in results:
            type_stats.append(ProjectCountByType(project_type=project_type, count=count))

        # 总项目数（排除关闭项目，只统计正常和完成状态的项目）
        statement = select(func.count(Project.id)).where(
            or_(Project.status == '正常', Project.status == '完成', Project.status.is_(None))
        )
        total_projects = self.db.exec(statement).one()

        return ProjectStatistics(
            by_location=location_stats,
            by_product=product_stats,
            by_type=type_stats,
            total_projects=total_projects,
            total_contract_amount=0  # 不再计算合同总金额
        )

    def get_location_product_relationship(self) -> List[Dict[str, Any]]:
        """获取区域-产品关联数据，用于桑基图（只统计非关闭项目）"""
        # 查询项目、区域和产品的关联数据（排除关闭项目）
        statement = select(
            Project.location,
            ProjectProduct.product_name,
            func.count(ProjectProduct.id).label('count')
        ).join(
            ProjectProduct, Project.id == ProjectProduct.project_id
        ).where(
            or_(Project.status == '正常', Project.status == '完成', Project.status.is_(None))
        ).group_by(
            Project.location, ProjectProduct.product_name
        )
        
        results = self.db.exec(statement).all()
        relationship_data = []
        
        for location, product_name, count in results:
            relationship_data.append({
                'location': location,
                'product': product_name,
                'count': count
            })
        
        return relationship_data

    def get_product_type_statistics(self) -> List[Dict[str, Any]]:
        """获取按产品和项目类型的统计数据（只统计非关闭项目）"""
        # 查询项目、产品和项目类型的关联数据（排除关闭项目）
        statement = select(
            ProjectProduct.product_name,
            Project.project_type,
            func.count(func.distinct(ProjectProduct.project_id)).label('count')
        ).join(
            Project, Project.id == ProjectProduct.project_id
        ).where(
            or_(Project.status == '正常', Project.status == '完成', Project.status.is_(None))
        ).group_by(
            ProjectProduct.product_name, Project.project_type
        )
        
        results = self.db.exec(statement).all()
        # 按产品名称组织数据
        product_type_data = {}
        
        for product_name, project_type, count in results:
            if product_name not in product_type_data:
                product_type_data[product_name] = {
                    'product': product_name,
                    '机会点': 0,
                    '交付': 0,
                    'PoC': 0
                }
            product_type_data[product_name][project_type] = count
        
        return list(product_type_data.values())
