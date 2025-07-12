-- 创建扩展（如果需要）
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. 创建users表（无外键依赖）
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR NOT NULL UNIQUE,
    username VARCHAR NOT NULL UNIQUE,
    hashed_password VARCHAR NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_superuser BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    avatar_url VARCHAR,
    display_name VARCHAR,
    bio TEXT,
    website VARCHAR,
    location VARCHAR,
    profession VARCHAR,
    interests VARCHAR
);
CREATE INDEX IF NOT EXISTS ix_users_email ON users(email);
CREATE INDEX IF NOT EXISTS ix_users_username ON users(username);

-- 2. 创建categories表（自引用外键）
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    description VARCHAR,
    parent_id UUID REFERENCES categories(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. 创建prompts表（依赖users和categories）
CREATE TABLE IF NOT EXISTS prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR NOT NULL,
    content VARCHAR NOT NULL,
    description VARCHAR,
    tags VARCHAR[],
    version INTEGER DEFAULT 1,
    parent_id UUID REFERENCES prompts(id),
    creator_id UUID NOT NULL REFERENCES users(id),
    category_id UUID REFERENCES categories(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    average_rating FLOAT DEFAULT 0.0,
    rating_count INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS ix_prompts_title ON prompts(title);
CREATE INDEX IF NOT EXISTS ix_prompts_creator_id ON prompts(creator_id);
CREATE INDEX IF NOT EXISTS ix_prompts_category_id ON prompts(category_id);

-- 4. 创建prompt_histories表（依赖prompts）
CREATE TABLE IF NOT EXISTS prompt_histories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
    snapshot JSONB NOT NULL,
    version INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS ix_prompt_histories_prompt_id ON prompt_histories(prompt_id);

-- 5. 创建favorites表（依赖users）
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS ix_favorites_user_id ON favorites(user_id);

-- 6. 创建favorite_prompt关联表（依赖favorites和prompts）
CREATE TABLE IF NOT EXISTS favorite_prompt (
    favorite_id UUID REFERENCES favorites(id) ON DELETE CASCADE,
    prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (favorite_id, prompt_id)
);

-- 7. 创建ratings表（依赖users和prompts）
CREATE TABLE IF NOT EXISTS ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS ix_ratings_prompt_id ON ratings(prompt_id);
CREATE INDEX IF NOT EXISTS ix_ratings_user_id ON ratings(user_id);

-- 8. 创建helpful_marks表（依赖ratings和users）
CREATE TABLE IF NOT EXISTS helpful_marks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rating_id UUID REFERENCES ratings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS ix_helpful_marks_rating_id ON helpful_marks(rating_id);
CREATE INDEX IF NOT EXISTS ix_helpful_marks_user_id ON helpful_marks(user_id);

-- 9. 创建usages表（依赖prompts和users）
CREATE TABLE IF NOT EXISTS usages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    usage_type VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS ix_usages_prompt_id ON usages(prompt_id);
CREATE INDEX IF NOT EXISTS ix_usages_user_id ON usages(user_id);
CREATE INDEX IF NOT EXISTS ix_usages_created_at ON usages(created_at);

-- 10. 创建alembic_version表（用于记录迁移版本）
CREATE TABLE IF NOT EXISTS alembic_version (
    version_num VARCHAR(32) PRIMARY KEY
);

-- 插入当前迁移版本（如果已知）
INSERT INTO alembic_version (version_num) VALUES ('8b9d3f4e5c6a');
