"""add_project_status_field

Revision ID: 954804867fbc
Revises: 641b403e6904
Create Date: 2025-11-09 23:43:14.433818

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = '954804867fbc'
down_revision = '641b403e6904'
branch_labels = None
depends_on = None


def upgrade():
    # 添加项目状态字段，默认值为"正常"
    op.add_column('project', sa.Column('status', sqlmodel.sql.sqltypes.AutoString(), nullable=False, server_default='正常'))


def downgrade():
    # 删除项目状态字段
    op.drop_column('project', 'status')
