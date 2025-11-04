#!/usr/bin/env python3
"""
调试API问题的脚本
"""

import requests
import json

def test_api():
    # 获取token
    login_data = {
        "username": "admin@example.com",
        "password": "changethis"
    }
    
    print("1. 测试登录...")
    login_response = requests.post("http://localhost:8000/api/v1/login/access-token", data=login_data)
    print(f"登录状态码: {login_response.status_code}")
    
    if login_response.status_code != 200:
        print(f"登录失败: {login_response.text}")
        return
    
    token = login_response.json()["access_token"]
    print("✅ 登录成功")
    
    # 测试项目API
    headers = {"Authorization": f"Bearer {token}"}
    
    print("\n2. 测试项目列表API...")
    projects_response = requests.get("http://localhost:8000/api/v1/projects/", headers=headers)
    print(f"项目列表状态码: {projects_response.status_code}")
    print(f"响应内容: {projects_response.text[:500]}")
    
    print("\n3. 测试项目统计API...")
    stats_response = requests.get("http://localhost:8000/api/v1/projects/statistics", headers=headers)
    print(f"统计API状态码: {stats_response.status_code}")
    print(f"响应内容: {stats_response.text[:500]}")
    
    print("\n4. 测试健康检查...")
    health_response = requests.get("http://localhost:8000/api/v1/utils/health-check")
    print(f"健康检查状态码: {health_response.status_code}")
    print(f"响应内容: {health_response.text}")

if __name__ == "__main__":
    test_api()
