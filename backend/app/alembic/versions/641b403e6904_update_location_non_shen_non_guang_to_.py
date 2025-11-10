"""update_location_non_shen_non_guang_to_non_shen_non_dong

Revision ID: 641b403e6904
Revises: 7cb5534801cb
Create Date: 2025-11-09 23:11:33.492177

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = '641b403e6904'
down_revision = '7cb5534801cb'
branch_labels = None
depends_on = None


def upgrade():
    # 更新project表中的location字段：将"非深非广"改为"非深非莞"
    op.execute("""
        UPDATE project 
        SET location = '非深非莞' 
        WHERE location = '非深非广'
    """)


def downgrade():
    # 回滚：将"非深非莞"改回"非深非广"
    op.execute("""
        UPDATE project 
        SET location = '非深非广' 
        WHERE location = '非深非莞'
    """)
