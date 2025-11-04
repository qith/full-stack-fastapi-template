#!/usr/bin/env python3
"""
创建测试项目数据的脚本
用于验证项目统计功能，包括PoC点数量统计
"""

import requests
import json
from datetime import datetime, timedelta

# 配置
BASE_URL = "http://localhost:8000"
LOGIN_URL = f"{BASE_URL}/api/v1/login/access-token"
PROJECTS_URL = f"{BASE_URL}/api/v1/projects/"

def get_auth_token():
    """获取认证token"""
    login_data = {
        "username": "admin@example.com",
        "password": "changethis"
    }
    
    response = requests.post(LOGIN_URL, data=login_data)
    if response.status_code == 200:
        return response.json()["access_token"]
    else:
        raise Exception(f"登录失败: {response.status_code} - {response.text}")

def create_project(token, project_data):
    """创建项目"""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    response = requests.post(PROJECTS_URL, headers=headers, json=project_data)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"创建项目失败: {response.status_code} - {response.text}")
        return None

def main():
    """主函数"""
    try:
        # 获取认证token
        print("正在获取认证token...")
        token = get_auth_token()
        print("✅ 认证成功")
        
        # 测试项目数据
        test_projects = [
            {
                "name": "华北地区交付项目A",
                "project_type": "交付",
                "location": "华北",
                "product": "产品A",
                "contract_amount": 1000000.0,
                "background_info": "华北地区的重要交付项目"
            },
            {
                "name": "华南地区PoC项目B",
                "project_type": "PoC",
                "location": "华南",
                "product": "产品B",
                "budget_amount": 500000.0,
                "background_info": "华南地区的PoC验证项目"
            },
            {
                "name": "华中地区PoC项目C",
                "project_type": "PoC",
                "location": "华中",
                "product": "产品C",
                "budget_amount": 300000.0,
                "background_info": "华中地区的PoC测试项目"
            },
            {
                "name": "香港机会点项目D",
                "project_type": "机会点",
                "location": "香港",
                "product": "产品D",
                "budget_amount": 200000.0,
                "background_info": "香港地区的商业机会"
            },
            {
                "name": "澳门PoC项目E",
                "project_type": "PoC",
                "location": "澳门",
                "product": "产品E",
                "budget_amount": 150000.0,
                "background_info": "澳门地区的PoC试点项目"
            },
            {
                "name": "非深非广交付项目F",
                "project_type": "交付",
                "location": "非深非广",
                "product": "产品F",
                "contract_amount": 800000.0,
                "background_info": "非深非广地区的交付项目"
            }
        ]
        
        # 创建项目
        print("\n正在创建测试项目...")
        created_projects = []
        for i, project_data in enumerate(test_projects, 1):
            print(f"创建项目 {i}/{len(test_projects)}: {project_data['name']}")
            result = create_project(token, project_data)
            if result:
                created_projects.append(result)
                print(f"  ✅ 成功创建")
            else:
                print(f"  ❌ 创建失败")
        
        print(f"\n✅ 成功创建 {len(created_projects)} 个项目")
        
        # 显示统计信息
        print("\n正在获取项目统计...")
        headers = {"Authorization": f"Bearer {token}"}
        stats_response = requests.get(f"{PROJECTS_URL}statistics", headers=headers)
        
        if stats_response.status_code == 200:
            stats = stats_response.json()
            print("\n📊 项目统计信息:")
            print(f"  总项目数: {stats['total_projects']}")
            print(f"  合同总金额: ¥{stats['total_contract_amount']:,.2f}")
            
            print("\n📈 按项目类型统计:")
            for type_stat in stats['by_type']:
                print(f"  {type_stat['project_type']}: {type_stat['count']} 个")
            
            print("\n🌍 按地区统计:")
            for location_stat in stats['by_location']:
                print(f"  {location_stat['location']}: {location_stat['count']} 个")
            
            print("\n📦 按产品统计:")
            for product_stat in stats['by_product']:
                print(f"  {product_stat['product']}: {product_stat['count']} 个")
        else:
            print(f"❌ 获取统计信息失败: {stats_response.status_code}")
            
    except Exception as e:
        print(f"❌ 错误: {e}")

if __name__ == "__main__":
    main()
