#!/usr/bin/env python3
"""
测试项目服务的脚本
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from sqlmodel import Session, create_engine
from backend.app.services.project_service import ProjectService
from backend.app.core.config import settings

def test_project_service():
    # 创建数据库连接
    engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))
    
    with Session(engine) as session:
        project_service = ProjectService(session)
        
        print("1. 测试获取项目列表...")
        try:
            projects = project_service.get_projects()
            print(f"✅ 成功获取项目列表，数量: {len(projects)}")
            for project in projects:
                print(f"  - {project.name} ({project.project_type})")
        except Exception as e:
            print(f"❌ 获取项目列表失败: {e}")
            import traceback
            traceback.print_exc()
        
        print("\n2. 测试获取项目统计...")
        try:
            stats = project_service.get_project_statistics()
            print(f"✅ 成功获取项目统计")
            print(f"  总项目数: {stats.total_projects}")
            print(f"  按类型统计: {stats.by_type}")
        except Exception as e:
            print(f"❌ 获取项目统计失败: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    test_project_service()
