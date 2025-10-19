#!/usr/bin/env python3
"""
初始化 RBAC 系统脚本
运行此脚本来设置默认的权限、角色和用户角色分配
"""

import logging
from sqlmodel import Session, select
from app.core.db import engine
from app.services.rbac_service import RBACService
from app.models import User
from app.models_rbac import Role

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def init_rbac():
    """初始化 RBAC 系统"""
    with Session(engine) as session:
        rbac_service = RBACService(session)
        
        logger.info("初始化默认权限和角色...")
        rbac_service.init_default_permissions()
        
        # 为默认管理员用户分配管理员角色
        admin_user = session.exec(
            select(User).where(User.email == "admin@example.com")
        ).first()
        
        if admin_user:
            # 查找管理员角色
            admin_role = session.exec(
                select(Role).where(Role.name == "admin")
            ).first()
            
            if admin_role:
                # 分配管理员角色
                rbac_service.assign_role_to_user(str(admin_user.id), str(admin_role.id))
                logger.info(f"为管理员用户 {admin_user.email} 分配了管理员角色")
            else:
                logger.warning("未找到管理员角色")
        else:
            logger.warning("未找到默认管理员用户")
        
        logger.info("RBAC 系统初始化完成！")


if __name__ == "__main__":
    init_rbac()
