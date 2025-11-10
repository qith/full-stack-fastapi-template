from typing import List, Optional, Dict, Any
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session

from app.api.deps import SessionDep, CurrentUser
from app.services.project_service import ProjectService
from app.schemas_pm import (
    Project, ProjectCreate, ProjectUpdate,
    ProjectProduct, ProjectProductCreate,
    RoleAssignment, RoleAssignmentCreate,
    Milestone, MilestoneCreate, MilestoneUpdate,
    Progress, ProgressCreate, ProgressUpdate,
    ProjectStatistics
)

router = APIRouter()


@router.post("/", response_model=Project)
def create_project(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    project_in: ProjectCreate,
) -> Any:
    """
    创建新项目
    """
    project_service = ProjectService(session)
    project = project_service.create_project(project_in)
    return project


@router.get("/", response_model=List[Project])
def read_projects(
    *,
    session: SessionDep,
    skip: int = 0,
    limit: int = 100,
    current_user: CurrentUser,
) -> Any:
    """
    获取项目列表
    """
    project_service = ProjectService(session)
    projects = project_service.get_projects(skip=skip, limit=limit)
    return projects


@router.get("/statistics", response_model=ProjectStatistics)
def get_project_statistics(
    *,
    session: SessionDep,
    current_user: CurrentUser,
) -> Any:
    """
    获取项目统计信息
    """
    project_service = ProjectService(session)
    statistics = project_service.get_project_statistics()
    return statistics


@router.get("/statistics/location-product-relationship")
def get_location_product_relationship(
    *,
    session: SessionDep,
    current_user: CurrentUser,
) -> Any:
    """
    获取区域-产品关联数据，用于桑基图
    """
    project_service = ProjectService(session)
    relationship_data = project_service.get_location_product_relationship()
    return relationship_data


@router.get("/statistics/product-type")
def get_product_type_statistics(
    *,
    session: SessionDep,
    current_user: CurrentUser,
) -> Any:
    """
    获取按产品和项目类型的统计数据
    """
    project_service = ProjectService(session)
    statistics = project_service.get_product_type_statistics()
    return statistics


@router.get("/{project_id}", response_model=Project)
def read_project(
    *,
    session: SessionDep,
    project_id: UUID,
    current_user: CurrentUser,
) -> Any:
    """
    获取项目详情
    """
    project_service = ProjectService(session)
    project = project_service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.put("/{project_id}", response_model=Project)
def update_project(
    *,
    session: SessionDep,
    project_id: UUID,
    project_in: ProjectUpdate,
    current_user: CurrentUser,
) -> Any:
    """
    更新项目信息
    """
    project_service = ProjectService(session)
    project = project_service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    project = project_service.update_project(project_id, project_in)
    return project


@router.post("/{project_id}/close")
def close_project(
    *,
    session: SessionDep,
    project_id: UUID,
    current_user: CurrentUser,
) -> Any:
    """
    关闭项目（将项目状态设置为"关闭"）
    """
    project_service = ProjectService(session)
    project = project_service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # 更新项目状态为"关闭"
    from app.schemas_pm import ProjectUpdate
    project_update = ProjectUpdate(status="关闭")
    updated_project = project_service.update_project(project_id, project_update)
    
    if not updated_project:
        raise HTTPException(status_code=500, detail="Failed to close project")
    
    return {"status": "success", "message": "项目已关闭", "project": updated_project}


@router.post("/{project_id}/complete")
def complete_project(
    *,
    session: SessionDep,
    project_id: UUID,
    current_user: CurrentUser,
) -> Any:
    """
    完成项目（将项目状态设置为"完成"）
    """
    project_service = ProjectService(session)
    project = project_service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # 更新项目状态为"完成"
    from app.schemas_pm import ProjectUpdate
    project_update = ProjectUpdate(status="完成")
    updated_project = project_service.update_project(project_id, project_update)
    
    if not updated_project:
        raise HTTPException(status_code=500, detail="Failed to complete project")
    
    return {"status": "success", "message": "项目已完成", "project": updated_project}


@router.delete("/{project_id}")
def delete_project(
    *,
    session: SessionDep,
    project_id: UUID,
    current_user: CurrentUser,
) -> Any:
    """
    删除项目
    """
    project_service = ProjectService(session)
    project = project_service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    project_service.delete_project(project_id)
    return {"status": "success"}


# 角色分配路由
@router.post("/{project_id}/roles", response_model=RoleAssignment)
def create_role_assignment(
    *,
    session: SessionDep,
    project_id: UUID,
    role_in: RoleAssignmentCreate,
    current_user: CurrentUser,
) -> Any:
    """
    添加角色分配
    """
    project_service = ProjectService(session)
    project = project_service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    role_assignment = project_service.add_role_assignment(project_id, role_in)
    return role_assignment


@router.delete("/{project_id}/roles/{role_id}")
def delete_role_assignment(
    *,
    session: SessionDep,
    project_id: UUID,
    role_id: UUID,
    current_user: CurrentUser,
) -> Any:
    """
    删除角色分配
    """
    project_service = ProjectService(session)
    success = project_service.delete_role_assignment(role_id)
    if not success:
        raise HTTPException(status_code=404, detail="Role assignment not found")
    return {"status": "success"}


# 里程碑路由
@router.post("/{project_id}/milestones", response_model=Milestone)
def create_milestone(
    *,
    session: SessionDep,
    project_id: UUID,
    milestone_in: MilestoneCreate,
    current_user: CurrentUser,
) -> Any:
    """
    添加里程碑
    """
    project_service = ProjectService(session)
    project = project_service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    milestone = project_service.add_milestone(project_id, milestone_in)
    return milestone


@router.put("/{project_id}/milestones/{milestone_id}", response_model=Milestone)
def update_milestone(
    *,
    session: SessionDep,
    project_id: UUID,
    milestone_id: UUID,
    milestone_in: MilestoneUpdate,
    current_user: CurrentUser,
) -> Any:
    """
    更新里程碑
    """
    project_service = ProjectService(session)
    project = project_service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    milestone_data = milestone_in.dict(exclude_unset=True)
    milestone = project_service.update_milestone(milestone_id, milestone_data)
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")
    return milestone


@router.get("/{project_id}/milestones", response_model=List[Milestone])
def read_project_milestones(
    *,
    session: SessionDep,
    project_id: UUID,
    current_user: CurrentUser,
) -> Any:
    """
    获取项目里程碑列表
    """
    project_service = ProjectService(session)
    project = project_service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    milestones = project_service.get_project_milestones(project_id)
    return milestones


@router.delete("/{project_id}/milestones/{milestone_id}")
def delete_milestone(
    *,
    session: SessionDep,
    project_id: UUID,
    milestone_id: UUID,
    current_user: CurrentUser,
) -> Any:
    """
    删除里程碑
    """
    project_service = ProjectService(session)
    project = project_service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    success = project_service.delete_milestone(milestone_id)
    if not success:
        raise HTTPException(status_code=404, detail="Milestone not found")
    return {"status": "success"}


# 进展路由
@router.post("/{project_id}/progresses", response_model=Progress)
def create_progress(
    *,
    session: SessionDep,
    project_id: UUID,
    progress_in: ProgressCreate,
    current_user: CurrentUser,
) -> Any:
    """
    添加进展
    """
    project_service = ProjectService(session)
    project = project_service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    progress = project_service.add_progress(project_id, progress_in)
    return progress


@router.put("/{project_id}/progresses/{progress_id}", response_model=Progress)
def update_progress(
    *,
    session: SessionDep,
    project_id: UUID,
    progress_id: UUID,
    progress_in: ProgressUpdate,
    current_user: CurrentUser,
) -> Any:
    """
    更新进展
    """
    project_service = ProjectService(session)
    project = project_service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    progress_data = progress_in.dict(exclude_unset=True)
    progress = project_service.update_progress(progress_id, progress_data)
    if not progress:
        raise HTTPException(status_code=404, detail="Progress not found")
    return progress


@router.get("/{project_id}/progresses")
def read_project_progresses(
    *,
    session: SessionDep,
    project_id: UUID,
    current_user: CurrentUser,
) -> Any:
    """
    获取项目进展列表
    """
    project_service = ProjectService(session)
    project = project_service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    progresses = project_service.get_project_progresses(project_id)
    return progresses


@router.delete("/{project_id}/progresses/{progress_id}")
def delete_progress(
    *,
    session: SessionDep,
    project_id: UUID,
    progress_id: UUID,
    current_user: CurrentUser,
) -> Any:
    """
    删除进展
    """
    project_service = ProjectService(session)
    project = project_service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    success = project_service.delete_progress(progress_id)
    if not success:
        raise HTTPException(status_code=404, detail="Progress not found")
    return {"status": "success"}
