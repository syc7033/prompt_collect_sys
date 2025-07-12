from sqlalchemy.orm import Session
from sqlalchemy import or_, func, desc, and_, true, any_
from typing import List, Dict, Any, Optional
import uuid
import logging
import traceback

from app.prompts.models import Prompt
from app.prompts.schemas import PromptFilter

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SearchService:
    @staticmethod
    def search_prompts(
        db: Session,
        query: str,
        tags: Optional[List[str]] = None,
        creator_id: Optional[uuid.UUID] = None,
        skip: int = 0,
        limit: int = 20
    ) -> Dict[str, Any]:
        """
        搜索提示词
        """
        try:
            # 打印调试信息
            logger.info(f"search_prompts 被调用，参数: query='{query}', tags={tags}, creator_id={creator_id}, skip={skip}, limit={limit}")
            
            # 基本查询
            db_query = db.query(Prompt)
            
            # 应用搜索条件
            if query:
                logger.info(f"应用搜索条件: '{query}'")
                search_terms = query.split()
                for term in search_terms:
                    search_pattern = f"%{term}%"
                    db_query = db_query.filter(
                        or_(
                            Prompt.title.ilike(search_pattern),
                            Prompt.content.ilike(search_pattern),
                            Prompt.description.ilike(search_pattern)
                        )
                    )
            
            # 应用标签过滤
            if tags:
                logger.info(f"应用标签过滤: {tags}")
                # 确保标签是列表形式
                if isinstance(tags, str):
                    tags = [tags]  # 如果是单个字符串，转换为列表
                
                # 获取所有提示词的标签进行调试
                all_prompts = db.query(Prompt).all()
                all_tags = set()
                for p in all_prompts:
                    if p.tags:
                        all_tags.update(p.tags)
                logger.info(f"数据库中的所有标签: {all_tags}")
                
                # 使用PostgreSQL特定的数组操作方法
                for tag in tags:
                    logger.info(f"过滤标签: '{tag}'")
                    # 使用ANY操作符进行标签匹配
                    # 这是PostgreSQL特有的数组操作方法
                    db_query = db_query.filter(
                        or_(
                            # 使用ANY操作符进行精确匹配
                            tag == any_(Prompt.tags),
                            # 使用字符串转换进行模糊匹配
                            func.array_to_string(Prompt.tags, ',').ilike(f'%{tag}%')
                        )
                    )
            
            # 应用创建者过滤
            if creator_id:
                logger.info(f"应用创建者过滤: {creator_id}")
                db_query = db_query.filter(Prompt.creator_id == creator_id)
            
            # 获取总数
            total = db_query.count()
            logger.info(f"查询到的提示词总数: {total}")
            
            # 应用分页并获取结果
            prompts = db_query.order_by(desc(Prompt.updated_at)).offset(skip).limit(limit).all()
            logger.info(f"返回的提示词数量: {len(prompts)}")
            
            return {
                "data": prompts,
                "total": total,
                "page": skip // limit + 1 if limit > 0 else 1,
                "size": limit
            }
        except Exception as e:
            # 捕获并记录所有异常
            error_msg = f"search_prompts 出错: {str(e)}"
            logger.error(error_msg)
            logger.error(traceback.format_exc())
            # 返回空结果而不是抛出异常，避免500错误
            return {
                "data": [],
                "total": 0,
                "page": 1,
                "size": limit
            }
    
    @staticmethod
    def get_popular_tags(db: Session, limit: int = 20) -> List[Dict[str, Any]]:
        """
        获取热门标签
        """
        # 使用PostgreSQL的unnest函数展开数组
        query = db.query(
            func.unnest(Prompt.tags).label("tag"),
            func.count().label("count")
        ).group_by("tag").order_by(desc("count")).limit(limit)
        
        result = query.all()
        
        # 转换为字典列表
        return [{"tag": row.tag, "count": row.count} for row in result]
    
    @staticmethod
    def get_similar_prompts(db: Session, prompt_id: uuid.UUID, limit: int = 5) -> List[Prompt]:
        """
        获取相似的提示词
        """
        try:
            logger.info(f"尝试获取与提示词 {prompt_id} 相似的提示词")
            
            # 获取原始提示词
            prompt = db.query(Prompt).filter(Prompt.id == prompt_id).first()
            if not prompt:
                logger.warning(f"提示词 {prompt_id} 不存在")
                return []
            
            logger.info(f"找到原始提示词: {prompt.title}")
            
            # 基于标签查找相似提示词
            similar_query = db.query(Prompt).filter(Prompt.id != prompt_id)
            
            # 如果有标签，则使用标签查找
            if prompt.tags and len(prompt.tags) > 0:
                logger.info(f"使用标签查找相似提示词: {prompt.tags}")
                for tag in prompt.tags:
                    similar_query = similar_query.filter(Prompt.tags.contains([tag]))
            else:
                logger.info("原始提示词没有标签，跳过标签匹配")
            
            # 获取基于标签的相似提示词
            similar_prompts = similar_query.limit(limit).all()
            logger.info(f"基于标签找到 {len(similar_prompts)} 个相似提示词")
            
            # 如果没有足够的结果，则使用标题和描述进行模糊匹配
            if len(similar_prompts) < limit:
                remaining = limit - len(similar_prompts)
                logger.info(f"需要找到更多 {remaining} 个相似提示词，尝试使用标题和描述进行模糊匹配")
                
                # 排除已找到的提示词
                exclude_ids = [p.id for p in similar_prompts] + [prompt_id]
                
                # 构建搜索条件
                search_conditions = []
                
                # 添加标题搜索条件
                if prompt.title:
                    search_conditions.append(Prompt.title.ilike(f"%{prompt.title}%"))
                
                # 添加描述搜索条件（如果有描述）
                if prompt.description:
                    search_conditions.append(Prompt.description.ilike(f"%{prompt.description}%"))
                
                # 如果没有搜索条件，使用true()表达式以避免空条件
                if not search_conditions:
                    logger.warning("没有可用的搜索条件，使用默认排序")
                    text_query = db.query(Prompt).filter(Prompt.id.notin_(exclude_ids)).order_by(desc(Prompt.updated_at)).limit(remaining)
                else:
                    # 基于标题和描述查找
                    text_query = db.query(Prompt).filter(
                        Prompt.id.notin_(exclude_ids)
                    ).filter(
                        or_(*search_conditions)
                    ).limit(remaining)
                
                additional_prompts = text_query.all()
                logger.info(f"基于文本匹配找到额外的 {len(additional_prompts)} 个提示词")
                similar_prompts.extend(additional_prompts)
            
            logger.info(f"总共找到 {len(similar_prompts)} 个相似提示词")
            return similar_prompts
            
        except Exception as e:
            error_msg = f"获取相似提示词时出错: {str(e)}"
            logger.error(error_msg)
            logger.error(traceback.format_exc())
            # 返回空列表而不是抛出异常，以避免500错误
            return []
