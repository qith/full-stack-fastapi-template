"""add_menu_button_permissions

Revision ID: 7cb5534801cb
Revises: 5825034dc7b9
Create Date: 2025-11-09 16:43:11.353510

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = '7cb5534801cb'
down_revision = '5825034dc7b9'
branch_labels = None
depends_on = None


def upgrade():
    # 添加权限类型字段
    op.add_column('permissions', sa.Column('permission_type', sqlmodel.sql.sqltypes.AutoString(length=20), nullable=False, server_default='api'))
    # 添加菜单路径字段
    op.add_column('permissions', sa.Column('menu_path', sqlmodel.sql.sqltypes.AutoString(length=200), nullable=True))
    # 添加按钮标识字段
    op.add_column('permissions', sa.Column('button_id', sqlmodel.sql.sqltypes.AutoString(length=100), nullable=True))


def downgrade():
    # 删除按钮标识字段
    op.drop_column('permissions', 'button_id')
    # 删除菜单路径字段
    op.drop_column('permissions', 'menu_path')
    # 删除权限类型字段
    op.drop_column('permissions', 'permission_type')
