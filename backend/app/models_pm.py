from typing import List, Optional
from datetime import datetime
from uuid import UUID, uuid4
from enum import Enum
from sqlmodel import Field, SQLModel, Relationship


class ProjectType(str, Enum):
    DELIVERY = "交付"
    POC = "PoC"
    OPPORTUNITY = "机会点"


class MilestoneStatus(str, Enum):
    NORMAL = "正常"
    DELAYED = "延期"
    COMPLETED = "完成"


class ProgressType(str, Enum):
    DAILY = "日进展"
    WEEKLY = "周进展"


class ProjectStatus(str, Enum):
    NORMAL = "正常"
    CLOSED = "关闭"
    COMPLETED = "完成"


class ProductDict(SQLModel, table=True):
    """产品字典表"""
    __tablename__ = "product_dict"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str = Field(unique=True, index=True)  # 产品名称，唯一
    description: Optional[str] = Field(default=None)  # 产品描述
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default=None)


class ProjectProduct(SQLModel, table=True):
    """项目产品表"""
    __tablename__ = "project_product"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    project_id: UUID = Field(foreign_key="project.id")
    product_name: str = Field()  # 产品名称
    product_amount: Optional[float] = Field(default=None)  # 产品金额
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # 关系
    project: "Project" = Relationship(back_populates="products")


class RoleAssignment(SQLModel, table=True):
    """角色分配表"""
    __tablename__ = "role_assignment"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    project_id: UUID = Field(foreign_key="project.id")
    role_name: str = Field(index=True)  # 角色名称，如"行解"、"区解"、"市场"等
    user_name: str = Field()  # 用户姓名
    user_email: Optional[str] = Field(default=None)  # 用户邮箱
    user_phone: Optional[str] = Field(default=None)  # 用户电话
    user_description: Optional[str] = Field(default=None)  # 用户描述
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # 关系
    project: "Project" = Relationship(back_populates="role_assignments")


class Milestone(SQLModel, table=True):
    """项目里程碑表"""
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    project_id: UUID = Field(foreign_key="project.id")
    milestone_date: datetime = Field()  # 里程碑日期
    description: str = Field()  # 里程碑描述
    status: MilestoneStatus = Field(default=MilestoneStatus.NORMAL)  # 里程碑状态
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # 关系
    project: "Project" = Relationship(back_populates="milestones")


class Progress(SQLModel, table=True):
    """项目进展表"""
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    project_id: UUID = Field(foreign_key="project.id")
    description: str = Field()  # 进展描述
    progress_type: ProgressType = Field(default=ProgressType.DAILY)  # 进展类型
    tracking_user_id: UUID = Field(foreign_key="user.id")  # 进展跟踪人
    progress_date: datetime = Field(default_factory=datetime.utcnow)  # 进展记录时间
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # 关系
    project: "Project" = Relationship(back_populates="progresses")


class Project(SQLModel, table=True):
    """项目表"""
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str = Field(index=True)  # 项目名称
    project_type: str = Field()  # 项目类型 (改为字符串以匹配API)
    location: str = Field()  # 项目属地
    contract_amount: Optional[float] = Field(default=None)  # 合同金额
    background: Optional[str] = Field(default=None)  # 项目背景信息
    import_time: Optional[datetime] = Field(default=None)  # 项目导入时间
    status: str = Field(default="正常")  # 项目状态：正常、关闭、完成
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # 关系
    products: List["ProjectProduct"] = Relationship(back_populates="project")
    role_assignments: List[RoleAssignment] = Relationship(back_populates="project")
    milestones: List[Milestone] = Relationship(back_populates="project")
    progresses: List[Progress] = Relationship(back_populates="project")


# Pydantic models for API
class ProjectProductCreate(SQLModel):
    product_name: str
    product_amount: Optional[float] = None


class ProjectProductUpdate(SQLModel):
    product_name: Optional[str] = None
    product_amount: Optional[float] = None


class ProjectProductPublic(SQLModel):
    id: UUID
    project_id: UUID
    product_name: str
    product_amount: Optional[float] = None
    created_at: datetime


class RoleAssignmentCreate(SQLModel):
    role_name: str
    user_name: str
    user_email: Optional[str] = None
    user_phone: Optional[str] = None
    user_description: Optional[str] = None


class RoleAssignmentPublic(SQLModel):
    id: UUID
    project_id: UUID
    role_name: str
    user_name: str
    user_email: Optional[str] = None
    user_phone: Optional[str] = None
    user_description: Optional[str] = None
    created_at: datetime


class MilestoneCreate(SQLModel):
    milestone_date: datetime
    description: str
    status: MilestoneStatus = MilestoneStatus.NORMAL


class MilestoneUpdate(SQLModel):
    milestone_date: Optional[datetime] = None
    description: Optional[str] = None
    status: Optional[MilestoneStatus] = None


class MilestonePublic(SQLModel):
    id: UUID
    project_id: UUID
    milestone_date: datetime
    description: str
    status: MilestoneStatus
    created_at: datetime
    updated_at: datetime


class ProgressCreate(SQLModel):
    description: str
    progress_type: ProgressType
    tracking_user_id: UUID
    progress_date: Optional[datetime] = None


class ProgressUpdate(SQLModel):
    description: Optional[str] = None
    progress_type: Optional[ProgressType] = None
    tracking_user_id: Optional[UUID] = None
    progress_date: Optional[datetime] = None


class ProgressPublic(SQLModel):
    id: UUID
    project_id: UUID
    description: str
    progress_type: ProgressType
    tracking_user_id: UUID
    progress_date: datetime
    created_at: datetime
    updated_at: datetime


class ProjectCreate(SQLModel):
    name: str
    project_type: str
    location: str
    contract_amount: Optional[float] = None
    background: Optional[str] = None
    import_time: Optional[datetime] = None
    products: List[ProjectProductCreate] = []
    milestones: List[MilestoneCreate] = []
    role_assignments: List[RoleAssignmentCreate] = []


class ProjectUpdate(SQLModel):
    name: Optional[str] = None
    project_type: Optional[str] = None
    location: Optional[str] = None
    contract_amount: Optional[float] = None
    background: Optional[str] = None
    import_time: Optional[datetime] = None
    products: Optional[List[ProjectProductCreate]] = None
    milestones: Optional[List[MilestoneCreate]] = None
    role_assignments: Optional[List[RoleAssignmentCreate]] = None


class ProjectPublic(SQLModel):
    id: UUID
    name: str
    project_type: str
    location: str
    contract_amount: Optional[float] = None
    background: Optional[str] = None
    import_time: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    products: List[ProjectProductPublic] = []
    role_assignments: List[RoleAssignmentPublic] = []
    milestones: List[MilestonePublic] = []
    progresses: List[ProgressPublic] = []


class ProjectStatistics(SQLModel):
    total_projects: int
    by_location: List[dict]
    by_product: List[dict]
    by_type: List[dict]
    total_contract_amount: float = 0
