"""add categories and favorites

Revision ID: 7a9c2f3e4b5d
Revises: 984d219c70b5
Create Date: 2025-05-28 16:25:00

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import uuid

# revision identifiers, used by Alembic
revision = '7a9c2f3e4b5d'
down_revision = '984d219c70b5'
branch_labels = None
depends_on = None


def upgrade():
    # 创建categories表
    op.create_table(
        'categories',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('parent_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['parent_id'], ['categories.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # 创建favorites表
    op.create_table(
        'favorites',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # 创建favorite_prompt关联表
    op.create_table(
        'favorite_prompt',
        sa.Column('favorite_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('prompt_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('added_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['favorite_id'], ['favorites.id'], ),
        sa.ForeignKeyConstraint(['prompt_id'], ['prompts.id'], ),
        sa.PrimaryKeyConstraint('favorite_id', 'prompt_id')
    )
    
    # 在prompts表中添加category_id字段
    op.add_column('prompts', sa.Column('category_id', postgresql.UUID(as_uuid=True), nullable=True))
    op.create_foreign_key(None, 'prompts', 'categories', ['category_id'], ['id'])


def downgrade():
    # 删除prompts表中的category_id字段
    op.drop_constraint(None, 'prompts', type_='foreignkey')
    op.drop_column('prompts', 'category_id')
    
    # 删除favorite_prompt关联表
    op.drop_table('favorite_prompt')
    
    # 删除favorites表
    op.drop_table('favorites')
    
    # 删除categories表
    op.drop_table('categories')
