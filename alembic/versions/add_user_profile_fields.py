"""add user profile fields

Revision ID: 8b9d3f4e5c6a
Revises: 7a9c2f3e4b5d
Create Date: 2025-05-29 17:30:00

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic
revision = '8b9d3f4e5c6a'
down_revision = '7a9c2f3e4b5d'
branch_labels = None
depends_on = None


def upgrade():
    # 添加用户个人资料字段
    op.add_column('users', sa.Column('avatar_url', sa.String(), nullable=True))
    op.add_column('users', sa.Column('display_name', sa.String(), nullable=True))
    op.add_column('users', sa.Column('bio', sa.Text(), nullable=True))
    op.add_column('users', sa.Column('website', sa.String(), nullable=True))
    op.add_column('users', sa.Column('location', sa.String(), nullable=True))
    op.add_column('users', sa.Column('profession', sa.String(), nullable=True))
    op.add_column('users', sa.Column('interests', sa.String(), nullable=True))


def downgrade():
    # 删除用户个人资料字段
    op.drop_column('users', 'interests')
    op.drop_column('users', 'profession')
    op.drop_column('users', 'location')
    op.drop_column('users', 'website')
    op.drop_column('users', 'bio')
    op.drop_column('users', 'display_name')
    op.drop_column('users', 'avatar_url')
