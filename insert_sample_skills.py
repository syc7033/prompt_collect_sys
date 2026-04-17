#!/usr/bin/env python3
"""
创建 10 个高质量示例 Skill

设计原则：
1. 每个 Skill 有明确的应用场景和解决的实际问题
2. Prompt 组合遵循实际工作流程顺序
3. 描述清晰、专业，能帮助用户理解 Skill 的价值
4. 标签准确分类，方便搜索
5. 目标工具基于实际使用场景选择
"""
import sys
sys.path.insert(0, '/home/admin/prompt_collect_sys')

from app.database import SessionLocal
from app.skills.models import Skill, SkillPrompt
from app.auth.models import User
from app.categories.models import Category
from app.prompts.models import Prompt, PromptHistory
from app.ratings.models import Rating
from app.favorites.models import Favorite
from app.usage.models import Usage
import uuid

db = SessionLocal()

try:
    admin = db.query(User).filter(User.username == 'admin').first()
    if not admin:
        print("❌ 找不到 admin 用户")
        exit(1)
    
    PROMPT_UUIDS = {
        '需求优先级规划': '06f93472-04bb-46a8-88e5-f7774fbd1d9d',
        '系统概要设计': '1cb162bf-b67b-400f-b9d1-beb1a5484022',
        '详细设计(LLD)文档': 'a71cfd4e-7967-488a-accd-d8d731b81cb8',
        '技术选型': 'c70a96ec-f7f3-44e6-92d4-c7ee59602924',
        '修复Bug，避免出现幻觉': '36b50789-f5c2-4587-a3a9-f11213a82e3e',
        'AI 分析c++ dump崩溃信息': '9d218eee-00bc-44cb-bd7b-77dfce981053',
        '角色定位，拒绝假设': '37dcac72-c153-4b9c-8770-6cf691fd771b',
        '分析现有代码（项目级别）': 'ebac0bac-28a9-4de9-90ca-ac3d6ab5a220',
        '分析单个文件': 'ac5546fb-b690-4c7e-883a-48997d75e962',
        '代码审核（python）': '0e1f3d60-5454-45e4-a92a-b8edaa9393d4',
        '单元测试（python）': '598b784b-21d1-4350-ac00-9d6dc1762b5c',
        '代码军规 rule': 'f1a81a82-2759-4703-b673-c24272b1ec5d',
        '使用cf_public 公共库': '49c858f2-996f-43ce-8f08-2c072557fbcc',
        '当你不确定如何提问时': '93edbfb2-6e16-413c-bf38-7ed2e687725b',
        '功能和代码重构': '7ebb0f34-7498-44f5-8b06-6b2940d19dcf',
        '必要的基础认知': '92a9629e-f88a-45a5-9573-2a5f7b59ee2a',
        '代码编写基本提示词': 'de2208fb-5ae4-4df7-a3bf-fdafa129df83',
        '探讨方案的提问技巧': 'c1326f3a-9210-4df6-831e-8343f74a58f5',
        '渐进式小步迭代编码': 'e7943737-5768-4ea7-901c-12889f9737e4',
        '渐进式提问技巧': 'ab815de8-ae0f-4b85-8a5d-4a49124ec837',
        '需求文档编写': '2dac38a5-e26c-478c-85d1-383d2152fa79',
    }
    
    SKILLS = [
        {
            "title": "产品需求分析与技术设计全流程",
            "description": """完整的从产品需求到技术设计的标准流程。

适用场景：
- 新产品/功能立项时的需求分析
- 技术方案评审前的设计文档编写
- 确保需求到设计的完整追溯

工作流程：
1. 需求优先级规划 - 确定需求的重要性和紧急性
2. 需求文档编写 - 输出标准化需求文档
3. 系统概要设计 - 高层架构和模块划分
4. 详细设计(LLD) - 具体实现细节
5. 技术选型 - 技术栈决策与依据""",
            "tags": ["需求分析", "系统设计", "技术选型", "产品研发"],
            "target_tools": ["claude", "cursor"],
            "prompts": [
                ("需求优先级规划", "system"),
                ("需求文档编写", "instruction"),
                ("系统概要设计", "instruction"),
                ("详细设计(LLD)文档", "instruction"),
                ("技术选型", "instruction"),
            ]
        },
        {
            "title": "AI辅助Bug修复专业流程",
            "description": """利用AI高效定位和修复Bug的专业方法论。

适用场景：
- 线上问题紧急排查
- 复杂Bug的根因分析
- 崩溃日志解读

核心原则：
1. 拒绝AI幻觉 - 明确AI的角色定位和能力边界
2. 系统化分析 - 从现象到根因的推理过程
3. 验证优先 - 修复后必须有验证手段

包含：
- Bug修复防幻觉指南（system prompt）
- C++ dump崩溃分析方法
- 角色定位与假设管理""",
            "tags": ["Bug修复", "调试", "问题定位", "崩溃分析"],
            "target_tools": ["cursor", "copilot"],
            "prompts": [
                ("角色定位，拒绝假设", "system"),
                ("修复Bug，避免出现幻觉", "instruction"),
                ("AI 分析c++ dump崩溃信息", "instruction"),
            ]
        },
        {
            "title": "代码库深度分析工具包",
            "description": """系统性分析陌生代码库的方法论。

适用场景：
- 接手遗留项目
- 开源项目学习
- 代码审查准备
- 技术债务评估

分析层次：
1. 项目级分析 - 理解整体架构、模块关系
2. 文件级分析 - 深入具体实现细节
3. 代码审核 - 发现潜在问题

输出能力：
- 架构图生成
- 依赖关系梳理
- 代码质量评估""",
            "tags": ["代码分析", "架构理解", "代码审查", "技术债务"],
            "target_tools": ["cursor", "claude"],
            "prompts": [
                ("分析现有代码（项目级别）", "system"),
                ("分析单个文件", "instruction"),
                ("代码审核（python）", "instruction"),
            ]
        },
        {
            "title": "高质量代码编写最佳实践",
            "description": """AI辅助编程的核心最佳实践集合。

适用场景：
- 新项目开发
- 现有项目迭代
- 代码规范建立

三大核心原则：
1. 复用优先 - 优先使用公共库和现有组件
2. 渐进迭代 - 小步提交，持续验证
3. 规范遵循 - 遵循代码军规和最佳实践

工具支持：
- Cursor: 实时代码补全与重构
- Copilot: 智能代码生成
- Claude: 复杂逻辑设计与代码审查""",
            "tags": ["代码编写", "最佳实践", "编码规范", "公共库"],
            "target_tools": ["cursor", "copilot", "claude"],
            "prompts": [
                ("代码军规 rule", "system"),
                ("使用cf_public 公共库", "instruction"),
                ("代码编写基本提示词", "instruction"),
                ("渐进式小步迭代编码", "instruction"),
            ]
        },
        {
            "title": "测试驱动开发完整指南",
            "description": """从单元测试到代码审核的质量保障体系。

适用场景：
- TDD开发模式
- 代码质量门禁
- 重构前保障

质量三角：
1. 单元测试 - 保证代码正确性
2. 代码审核 - 发现潜在问题
3. 代码军规 - 统一质量标准

最佳实践：
- 测试先行或同步编写
- 每次提交包含测试
- 审核前自查清单""",
            "tags": ["单元测试", "代码审核", "TDD", "质量保障"],
            "target_tools": ["cursor", "copilot"],
            "prompts": [
                ("代码军规 rule", "system"),
                ("单元测试（python）", "instruction"),
                ("代码审核（python）", "instruction"),
            ]
        },
        {
            "title": "AI高效协作核心技巧",
            "description": """与AI编程助手高效协作的方法论。

核心理念：
- AI是协作伙伴，不是替代品
- 好的问题比好的答案更重要
- 渐进式交互优于一次性描述

三大技巧：
1. 角色定位 - 明确AI能做什么、不能做什么
2. 渐进提问 - 从模糊到精确，逐步收敛
3. 不确定时如何提问 - 避免无意义对话

适用：
- 所有AI编程工具使用者
- 希望提升AI协作效率的开发者""",
            "tags": ["AI协作", "提问技巧", "效率提升", "方法论"],
            "target_tools": ["cursor", "claude", "copilot"],
            "prompts": [
                ("角色定位，拒绝假设", "system"),
                ("必要的基础认知", "system"),
                ("当你不确定如何提问时", "instruction"),
                ("渐进式提问技巧", "instruction"),
            ]
        },
        {
            "title": "新功能开发标准流程",
            "description": """从需求到上线的完整功能开发流程。

适用场景：
- 标准功能迭代
- MVP快速验证
- 敏捷开发流程

开发流程：
1. 需求文档 - 明确做什么、为什么做
2. 方案探讨 - 技术方案与权衡
3. 渐进开发 - 小步实现，持续集成
4. 代码重构 - 优化实现，提升质量

交付物：
- 需求文档
- 技术方案
- 可运行代码
- 单元测试""",
            "tags": ["功能开发", "敏捷开发", "需求到上线", "研发流程"],
            "target_tools": ["cursor", "claude"],
            "prompts": [
                ("需求文档编写", "system"),
                ("探讨方案的提问技巧", "instruction"),
                ("渐进式小步迭代编码", "instruction"),
                ("功能和代码重构", "instruction"),
            ]
        },
        {
            "title": "技术方案设计方法论",
            "description": """系统性技术方案设计的方法论。

设计原则：
- 方案可落地性优先
- 技术选型有据可依
- 架构设计有层次

设计流程：
1. 技术选型 - 评估候选方案，给出选型依据
2. 系统概要设计 - 模块划分、接口定义
3. 详细设计(LLD) - 具体实现方案
4. 方案探讨 - 与AI讨论方案优劣

输出文档：
- 技术选型报告
- 架构设计文档
- 详细设计文档""",
            "tags": ["技术方案", "架构设计", "技术选型", "系统设计"],
            "target_tools": ["claude", "cursor"],
            "prompts": [
                ("技术选型", "system"),
                ("系统概要设计", "instruction"),
                ("详细设计(LLD)文档", "instruction"),
                ("探讨方案的提问技巧", "instruction"),
            ]
        },
        {
            "title": "遗留代码重构实战指南",
            "description": """安全、高效重构遗留代码的方法论。

重构原则：
- 先测试，后重构
- 小步迭代，持续验证
- 保持功能不变

重构流程：
1. 代码分析 - 理解现有实现
2. 补充测试 - 建立安全网
3. 渐进重构 - 小步改进
4. 审核验证 - 确保质量

风险控制：
- 每次重构有回滚点
- 测试覆盖关键路径
- 代码审核把关""",
            "tags": ["重构", "遗留系统", "代码优化", "技术债务"],
            "target_tools": ["cursor", "copilot"],
            "prompts": [
                ("功能和代码重构", "system"),
                ("单元测试（python）", "instruction"),
                ("分析现有代码（项目级别）", "instruction"),
                ("代码审核（python）", "instruction"),
            ]
        },
        {
            "title": "AI编程助手完全使用指南",
            "description": """AI编程助手从入门到精通的完整技能包。

覆盖场景：
- 日常编码、Bug修复、代码审查
- 需求分析、方案设计、文档编写
- 新项目启动、遗留代码理解

核心能力：
1. 基础认知 - 理解AI的能力边界
2. 编码实践 - 高效代码生成技巧
3. 问题解决 - Bug定位与修复
4. 质量保障 - 测试与审核

工具对比：
- Cursor: 强于代码补全与重构
- Claude: 强于复杂推理与方案设计
- Copilot: 强于IDE集成与上下文理解""",
            "tags": ["AI编程", "完整指南", "最佳实践", "效率提升"],
            "target_tools": ["cursor", "claude", "copilot"],
            "prompts": [
                ("必要的基础认知", "system"),
                ("代码编写基本提示词", "instruction"),
                ("修复Bug，避免出现幻觉", "instruction"),
                ("单元测试（python）", "instruction"),
                ("代码军规 rule", "instruction"),
            ]
        },
    ]
    
    created_count = 0
    
    for skill_data in SKILLS:
        skill = Skill(
            id=uuid.uuid4(),
            title=skill_data["title"],
            description=skill_data["description"],
            tags=skill_data["tags"],
            target_tools=skill_data["target_tools"],
            is_public=True,
            author_id=admin.id,
        )
        db.add(skill)
        db.flush()
        
        prompt_count = 0
        for order, (prompt_title, role) in enumerate(skill_data["prompts"]):
            if prompt_title in PROMPT_UUIDS:
                sp = SkillPrompt(
                    id=uuid.uuid4(),
                    skill_id=skill.id,
                    prompt_id=uuid.UUID(PROMPT_UUIDS[prompt_title]),
                    order_index=order,
                    role=role,
                )
                db.add(sp)
                prompt_count += 1
        
        created_count += 1
        print(f"✓ [{created_count:2d}] {skill_data['title']} ({prompt_count} prompts)")
    
    db.commit()
    print(f"\n🎉 成功创建 {created_count} 个高质量 Skill！")

finally:
    db.close()
