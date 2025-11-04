from typing import List, Optional
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel
from app.models_pm import ProjectType, MilestoneStatus, ProgressType


# 产品字典模型
class ProductDictBase(BaseModel):
    name: str
    description: Optional[str] = None


class ProductDictCreate(ProductDictBase):
    pass


class ProductDictUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class ProductDictInDBBase(ProductDictBase):
    id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ProductDict(ProductDictInDBBase):
    pass


# 产品模型
class ProjectProductBase(BaseModel):
    product_name: str
    product_amount: Optional[float] = None


class ProjectProductCreate(ProjectProductBase):
    pass


class ProjectProductUpdate(BaseModel):
    product_name: Optional[str] = None
    product_amount: Optional[float] = None


class ProjectProductInDBBase(ProjectProductBase):
    id: UUID
    project_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class ProjectProduct(ProjectProductInDBBase):
    pass


# 角色分配模型
class RoleAssignmentBase(BaseModel):
    role_name: str
    user_name: str
    user_email: Optional[str] = None
    user_phone: Optional[str] = None
    user_description: Optional[str] = None


class RoleAssignmentCreate(RoleAssignmentBase):
    pass


class RoleAssignmentUpdate(BaseModel):
    role_name: Optional[str] = None
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    user_phone: Optional[str] = None
    user_description: Optional[str] = None


class RoleAssignmentInDBBase(RoleAssignmentBase):
    id: UUID
    project_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class RoleAssignment(RoleAssignmentInDBBase):
    pass


# 里程碑模型
class MilestoneBase(BaseModel):
    milestone_date: datetime
    description: str
    status: MilestoneStatus = MilestoneStatus.NORMAL


class MilestoneCreate(MilestoneBase):
    pass


class MilestoneUpdate(BaseModel):
    milestone_date: Optional[datetime] = None
    description: Optional[str] = None
    status: Optional[MilestoneStatus] = None


class MilestoneInDBBase(MilestoneBase):
    id: UUID
    project_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Milestone(MilestoneInDBBase):
    pass


# 项目进展模型
class ProgressBase(BaseModel):
    description: str
    progress_type: ProgressType = ProgressType.DAILY
    tracking_user_id: UUID
    progress_date: datetime = None


class ProgressCreate(ProgressBase):
    pass


class ProgressUpdate(BaseModel):
    description: Optional[str] = None
    progress_type: Optional[ProgressType] = None
    tracking_user_id: Optional[UUID] = None
    progress_date: Optional[datetime] = None


class ProgressInDBBase(ProgressBase):
    id: UUID
    project_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Progress(ProgressInDBBase):
    pass


# 项目模型
class ProjectBase(BaseModel):
    name: str
    project_type: str
    location: str
    contract_amount: Optional[float] = None
    background: Optional[str] = None
    import_time: Optional[datetime] = None


class ProjectCreate(ProjectBase):
    products: Optional[List[ProjectProductCreate]] = []
    role_assignments: Optional[List[RoleAssignmentCreate]] = []
    milestones: Optional[List[MilestoneCreate]] = []


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    project_type: Optional[str] = None
    location: Optional[str] = None
    contract_amount: Optional[float] = None
    background: Optional[str] = None
    import_time: Optional[datetime] = None
    products: Optional[List[ProjectProductCreate]] = None
    role_assignments: Optional[List[RoleAssignmentCreate]] = None
    milestones: Optional[List[MilestoneCreate]] = None


class ProjectInDBBase(ProjectBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Project(ProjectInDBBase):
    products: List[ProjectProduct] = []
    role_assignments: List[RoleAssignment] = []
    milestones: List[Milestone] = []
    progresses: List[Progress] = []


# 统计模型
class ProjectCountByLocation(BaseModel):
    location: str
    count: int


class ProjectCountByProduct(BaseModel):
    product: str
    count: int


class ProjectCountByType(BaseModel):
    project_type: str
    count: int


class ProjectStatistics(BaseModel):
    by_location: List[ProjectCountByLocation]
    by_product: List[ProjectCountByProduct]
    by_type: List[ProjectCountByType]
    total_projects: int
    total_contract_amount: float
