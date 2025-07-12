import requests
import time

BASE_URL = "http://10.12.36.184:8000/api"
USERNAME = "admin"
PASSWORD = "123456"

def get_headers(token):
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

def login():
    resp = requests.post(f"{BASE_URL}/auth/login", data={"username": USERNAME, "password": PASSWORD})
    resp.raise_for_status()
    return resp.json()["access_token"]

def get_all_categories(token):
    resp = requests.get(f"{BASE_URL}/categories/tree", headers=get_headers(token))
    resp.raise_for_status()
    return resp.json()  # 直接返回list

def find_leaf_categories(categories, parent_path=None):
    """递归获取所有叶子节点，返回 (分类全路径, 分类ID) 列表"""
    leaves = []
    for cat in categories:
        path = (parent_path or []) + [cat["name"]]
        if not cat.get("children"):
            leaves.append(("/".join(path), cat["id"]))
        else:
            leaves.extend(find_leaf_categories(cat["children"], path))
    return leaves

def create_prompt(token, prompt):
    resp = requests.post(f"{BASE_URL}/prompts", headers=get_headers(token), json=prompt)
    if resp.status_code == 201:
        print(f"✅ 创建成功: {prompt['title']}")
        return True
    else:
        print(f"❌ 创建失败: {prompt['title']} - {resp.text}")
        return False

if __name__ == "__main__":
    token = login()
    print("已登录，获取所有分类...")
    category_tree = get_all_categories(token)
    leaf_categories = find_leaf_categories(category_tree)
    # 建立分类路径到ID的映射
    path2id = {path: cid for path, cid in leaf_categories}

    # 示例：为每个叶子节点设计的提示词
    # 你可以按需分批插入，或只插入部分，避免超时
    prompts_batch = [
    # 1. 编程开发
    # --- Web开发/前端框架
    {
        "title": "React组件最佳实践",
        "content": (
            "请结合实际项目经验，详细说明如何设计高复用、易维护的React组件。"
            "请包括：1）组件拆分原则；2）props与state管理建议；3）常见反模式与优化方法；4）代码示例。"
        ),
        "description": "指导开发者如何在实际项目中编写高质量、可复用的React组件，提升前端开发效率与代码可维护性。",
        "tags": ["React", "组件设计", "前端开发", "最佳实践"],
        "category_path": "编程开发/Web开发/前端框架"
    },
    {
        "title": "Vue.js状态管理模式",
        "content": (
            "请比较Vuex与Pinia的使用场景和优缺点，并给出在中大型Vue项目中组织全局状态的最佳实践。"
        ),
        "description": "帮助开发者选择合适的Vue状态管理方案，提升大型前端项目的可维护性。",
        "tags": ["Vue", "状态管理", "前端开发", "最佳实践"],
        "category_path": "编程开发/Web开发/前端框架"
    },
    {
        "title": "Angular依赖注入技巧",
        "content": (
            "请总结Angular依赖注入（DI）的核心机制与常见用法，列举实际开发中的高级用法和注意事项。"
        ),
        "description": "帮助Angular开发者深入理解依赖注入机制，提升大型项目的模块化与可测试性。",
        "tags": ["Angular", "依赖注入", "前端开发", "架构设计"],
        "category_path": "编程开发/Web开发/前端框架"
    },
    # --- Web开发/后端框架
    {
        "title": "FastAPI高性能API设计",
        "content": (
            "如何用FastAPI编写高性能RESTful接口？请涵盖异步编程、依赖注入、路由组织和自动文档。"
        ),
        "description": "面向后端开发者，介绍FastAPI的高性能API设计理念与实用技巧。",
        "tags": ["FastAPI", "后端开发", "API设计", "异步编程"],
        "category_path": "编程开发/Web开发/后端框架"
    },
    {
        "title": "Django ORM优化指南",
        "content": (
            "请介绍Django ORM在大数据量场景下的性能优化方法，包括查询优化、索引使用、N+1问题规避等。"
        ),
        "description": "指导Django开发者优化ORM操作，提升数据库访问性能。",
        "tags": ["Django", "ORM", "数据库优化", "后端开发"],
        "category_path": "编程开发/Web开发/后端框架"
    },
    {
        "title": "Express.js中间件开发",
        "content": (
            "请说明如何为Express.js开发自定义中间件，并给出常见中间件的实现案例与调试技巧。"
        ),
        "description": "帮助Node.js开发者高效开发和维护Express中间件，提升项目可扩展性。",
        "tags": ["Express", "中间件", "Node.js", "后端开发"],
        "category_path": "编程开发/Web开发/后端框架"
    },
    # --- Web开发/全栈开发
    {
        "title": "Next.js全栈应用架构",
        "content": (
            "请描述Next.js在全栈开发中的架构设计模式，包括API路由、服务端渲染与静态生成的结合。"
        ),
        "description": "帮助全栈开发者理解Next.js的架构优势与最佳实践。",
        "tags": ["Next.js", "全栈开发", "SSR", "前后端一体化"],
        "category_path": "编程开发/Web开发/全栈开发"
    },
    {
        "title": "MERN栈项目结构设计",
        "content": (
            "请给出MERN（MongoDB, Express, React, Node）全栈项目的文件结构与模块划分建议，并说明常见的组织模式。"
        ),
        "description": "为MERN栈开发者提供项目结构和模块划分的标准参考。",
        "tags": ["MERN", "全栈开发", "项目结构", "Node.js"],
        "category_path": "编程开发/Web开发/全栈开发"
    },
    {
        "title": "GraphQL API与前端集成",
        "content": (
            "请说明如何在全栈项目中设计GraphQL API，并与React/Vue等前端高效集成。"
        ),
        "description": "帮助开发者掌握GraphQL与主流前端框架的集成方法。",
        "tags": ["GraphQL", "全栈开发", "API设计", "前后端集成"],
        "category_path": "编程开发/Web开发/全栈开发"
    },
    # --- 移动开发/iOS开发
    {
        "title": "Swift UI响应式布局",
        "content": (
            "请介绍SwiftUI响应式布局的基本原理，如何实现动态界面自适应，以及常见的性能优化技巧。"
        ),
        "description": "帮助iOS开发者掌握SwiftUI响应式布局和性能优化方法。",
        "tags": ["SwiftUI", "iOS开发", "响应式布局", "移动开发"],
        "category_path": "编程开发/移动开发/iOS开发"
    },
    {
        "title": "iOS性能优化技巧",
        "content": (
            "请总结iOS应用开发中常见的性能瓶颈及优化手段，包括内存管理、界面流畅性和网络优化。"
        ),
        "description": "为iOS开发者提供系统性能优化的实用建议。",
        "tags": ["iOS", "性能优化", "移动开发", "内存管理"],
        "category_path": "编程开发/移动开发/iOS开发"
    },
    {
        "title": "SwiftUI与UIKit混合开发",
        "content": (
            "请说明在实际项目中如何实现SwiftUI与UIKit的无缝集成，包含数据传递、导航与兼容性处理。"
        ),
        "description": "指导开发者在渐进式重构项目时高效混用SwiftUI与UIKit。",
        "tags": ["SwiftUI", "UIKit", "iOS开发", "混合开发"],
        "category_path": "编程开发/移动开发/iOS开发"
    },
    # --- 移动开发/Android开发
    {
        "title": "Kotlin协程最佳实践",
        "content": (
            "请总结Kotlin协程在Android开发中的常见用法和最佳实践，包括异步任务、错误处理与生命周期管理。"
        ),
        "description": "帮助Android开发者高效使用协程提升应用响应速度与稳定性。",
        "tags": ["Kotlin", "协程", "Android", "异步编程"],
        "category_path": "编程开发/移动开发/Android开发"
    },
    {
        "title": "Jetpack Compose UI设计",
        "content": (
            "请介绍Jetpack Compose的声明式UI设计理念，并给出实际项目中的组件复用与主题定制案例。"
        ),
        "description": "指导Android开发者用Jetpack Compose构建现代化UI。",
        "tags": ["Jetpack Compose", "Android", "UI设计", "组件复用"],
        "category_path": "编程开发/移动开发/Android开发"
    },
    {
        "title": "Android应用架构组件",
        "content": (
            "请说明Android架构组件（如ViewModel、LiveData、Room等）在实际项目中的协作模式与最佳实践。"
        ),
        "description": "帮助开发者理解并高效使用Android官方架构组件。",
        "tags": ["Android", "架构组件", "ViewModel", "Room"],
        "category_path": "编程开发/移动开发/Android开发"
    },
    # --- 移动开发/跨平台框架
    {
        "title": "Flutter状态管理方案",
        "content": (
            "请比较Flutter常用状态管理方案（Provider、Bloc、Riverpod等），并给出适用场景和代码示例。"
        ),
        "description": "为Flutter开发者选择合适的状态管理工具提供参考。",
        "tags": ["Flutter", "状态管理", "跨平台开发", "移动开发"],
        "category_path": "编程开发/移动开发/跨平台框架"
    },
    {
        "title": "React Native原生模块集成",
        "content": (
            "请说明如何在React Native项目中集成原生模块，包含通信机制、常见坑和调试技巧。"
        ),
        "description": "指导开发者扩展React Native能力，实现与原生系统的深度集成。",
        "tags": ["React Native", "原生模块", "跨平台开发", "移动开发"],
        "category_path": "编程开发/移动开发/跨平台框架"
    },
    {
        "title": "跨平台UI一致性保障",
        "content": (
            "请总结Flutter/React Native等跨平台开发中UI一致性的常见挑战与解决方案。"
        ),
        "description": "帮助开发者提升多端UI一致性和用户体验。",
        "tags": ["跨平台开发", "UI一致性", "Flutter", "React Native"],
        "category_path": "编程开发/移动开发/跨平台框架"
    },
    # --- DevOps/容器化
    {
        "title": "Docker多阶段构建优化",
        "content": (
            "请介绍Docker多阶段构建的原理、优点及实际优化案例，包含镜像瘦身、安全性提升等。"
        ),
        "description": "帮助DevOps工程师提升Docker镜像构建效率与安全性。",
        "tags": ["Docker", "多阶段构建", "容器化", "DevOps"],
        "category_path": "编程开发/DevOps/容器化"
    },
    {
        "title": "Kubernetes Pod设计模式",
        "content": (
            "请总结Kubernetes中常用的Pod设计模式及其适用场景，包含Sidecar、Init、Adapter等。"
        ),
        "description": "为K8s用户提供Pod设计与微服务落地的最佳实践。",
        "tags": ["Kubernetes", "Pod", "设计模式", "DevOps"],
        "category_path": "编程开发/DevOps/容器化"
    },
    {
        "title": "容器网络故障排查",
        "content": (
            "请说明容器网络常见故障类型、排查思路及工具链，结合实际案例。"
        ),
        "description": "帮助运维人员快速定位和解决容器网络问题。",
        "tags": ["容器网络", "故障排查", "Kubernetes", "DevOps"],
        "category_path": "编程开发/DevOps/容器化"
    },
    # --- DevOps/CI/CD
    {
        "title": "GitHub Actions工作流设计",
        "content": (
            "请说明如何用GitHub Actions设计高效的CI/CD工作流，包含常用触发器、并发控制与安全实践。"
        ),
        "description": "为开发团队提供CI/CD自动化最佳实践。",
        "tags": ["GitHub Actions", "CI/CD", "自动化", "DevOps"],
        "category_path": "编程开发/DevOps/CI/CD"
    },
    {
        "title": "Jenkins流水线自动化测试",
        "content": (
            "请介绍Jenkins流水线集成自动化测试的配置方法，覆盖单元测试、集成测试与报告生成。"
        ),
        "description": "帮助测试与运维人员高效构建自动化测试流程。",
        "tags": ["Jenkins", "CI/CD", "自动化测试", "DevOps"],
        "category_path": "编程开发/DevOps/CI/CD"
    },
    {
        "title": "持续部署安全检查",
        "content": (
            "请总结CI/CD流程中常见的安全风险与防护措施，包含凭证管理、依赖漏洞扫描等。"
        ),
        "description": "为DevOps团队提供持续部署阶段的安全保障参考。",
        "tags": ["CI/CD", "安全", "持续部署", "DevOps"],
        "category_path": "编程开发/DevOps/CI/CD"
    },
    # --- DevOps/云服务
    {
        "title": "AWS无服务器架构设计",
        "content": (
            "请介绍AWS Lambda等无服务器架构的设计原则、常见场景与性能优化方法。"
        ),
        "description": "帮助云开发者理解Serverless架构优势与落地方案。",
        "tags": ["AWS", "Serverless", "云服务", "架构设计"],
        "category_path": "编程开发/DevOps/云服务"
    },
    {
        "title": "多云环境成本优化",
        "content": (
            "请说明多云部署下的成本监控、资源调度与优化策略，结合实际企业案例。"
        ),
        "description": "为企业架构师提供多云环境下的成本优化建议。",
        "tags": ["多云", "成本优化", "云服务", "DevOps"],
        "category_path": "编程开发/DevOps/云服务"
    },
    {
        "title": "云原生应用监控方案",
        "content": (
            "请介绍云原生应用的监控体系设计，包括Prometheus、Grafana等工具的集成与告警策略。"
        ),
        "description": "帮助运维团队构建高可用的云原生监控体系。",
        "tags": ["云原生", "监控", "Prometheus", "DevOps"],
        "category_path": "编程开发/DevOps/云服务"
    },

    # 2. 数据科学与AI
    # --- 数据分析/数据清洗
    {
        "title": "Pandas高效数据预处理",
        "content": (
            "请总结Pandas在数据清洗、缺失值处理、异常值检测方面的高效方法，并给出代码示例。"
        ),
        "description": "为数据分析师提供Pandas常用数据预处理技巧与实战方案。",
        "tags": ["Pandas", "数据清洗", "数据分析", "Python"],
        "category_path": "数据科学与AI/数据分析/数据清洗"
    },
    {
        "title": "缺失值处理策略",
        "content": (
            "请介绍数据分析中常用的缺失值处理方法，包括填充、删除与插值的适用场景和代码实现。"
        ),
        "description": "帮助分析师科学选择缺失值处理方案，提升数据质量。",
        "tags": ["数据分析", "缺失值", "数据预处理", "Python"],
        "category_path": "数据科学与AI/数据分析/数据清洗"
    },
    {
        "title": "异常值检测与处理",
        "content": (
            "请总结常见的异常值检测算法及其在实际数据分析中的应用，给出Python代码示例。"
        ),
        "description": "为数据科学家提供异常值检测与清洗的实用工具。",
        "tags": ["异常值", "数据清洗", "数据分析", "Python"],
        "category_path": "数据科学与AI/数据分析/数据清洗"
    },
    # --- 数据分析/数据可视化
    {
        "title": "Matplotlib高级图表定制",
        "content": (
            "请说明如何用Matplotlib实现高级图表定制，包括多子图、双Y轴、交互式元素等。"
        ),
        "description": "帮助分析师掌握Matplotlib高级用法，提升数据可视化表现力。",
        "tags": ["Matplotlib", "数据可视化", "Python", "图表"],
        "category_path": "数据科学与AI/数据分析/数据可视化"
    },
    {
        "title": "交互式仪表盘设计",
        "content": (
            "请介绍Python中常用的交互式数据仪表盘开发工具（如Dash、Streamlit），并举例说明。"
        ),
        "description": "为数据分析师提供交互式可视化应用开发思路。",
        "tags": ["仪表盘", "数据可视化", "交互式", "Python"],
        "category_path": "数据科学与AI/数据分析/数据可视化"
    },
    {
        "title": "数据故事可视化技巧",
        "content": (
            "请总结数据故事化表达的可视化技巧，包括配色、布局、标签与叙事顺序设计。"
        ),
        "description": "帮助分析师用可视化讲好数据故事，提高报告影响力。",
        "tags": ["数据故事", "数据可视化", "报告", "Python"],
        "category_path": "数据科学与AI/数据分析/数据可视化"
    },
    # --- 数据分析/统计分析
    {
        "title": "A/B测试设计与分析",
        "content": (
            "请详细说明A/B测试的实验设计流程、常见指标与统计分析方法，并给出Python实现。"
        ),
        "description": "为产品经理和分析师提供科学的A/B测试分析工具。",
        "tags": ["A/B测试", "统计分析", "数据分析", "Python"],
        "category_path": "数据科学与AI/数据分析/统计分析"
    },
    {
        "title": "时间序列预测模型",
        "content": (
            "请介绍常用的时间序列预测模型（如ARIMA、Prophet），并给出建模与评估流程。"
        ),
        "description": "帮助分析师掌握时间序列预测方法，提升业务预测能力。",
        "tags": ["时间序列", "预测模型", "统计分析", "Python"],
        "category_path": "数据科学与AI/数据分析/统计分析"
    },
    {
        "title": "多变量统计分析方法",
        "content": (
            "请总结多变量统计分析的常用方法（如主成分分析、因子分析），并给出实际应用案例。"
        ),
        "description": "为数据科学家提供多变量分析的理论与实操参考。",
        "tags": ["统计分析", "多变量", "PCA", "数据分析"],
        "category_path": "数据科学与AI/数据分析/统计分析"
    },
    # --- 机器学习/监督学习
    {
        "title": "分类模型特征工程",
        "content": (
            "请介绍分类任务中常用的特征工程方法，包括特征选择、编码、归一化等，附代码示例。"
        ),
        "description": "帮助机器学习工程师提升分类模型性能。",
        "tags": ["机器学习", "特征工程", "分类模型", "Python"],
        "category_path": "数据科学与AI/机器学习/监督学习"
    },
    {
        "title": "回归算法性能优化",
        "content": (
            "请总结回归模型常见的性能优化策略，包括特征处理、正则化与调参技巧。"
        ),
        "description": "为数据科学家优化回归算法提供实用建议。",
        "tags": ["回归", "性能优化", "机器学习", "Python"],
        "category_path": "数据科学与AI/机器学习/监督学习"
    },
    {
        "title": "模型解释性技术",
        "content": (
            "请介绍机器学习模型解释性技术（如SHAP、LIME），并给出实际应用案例。"
        ),
        "description": "帮助工程师提升模型可解释性，增强业务信任。",
        "tags": ["模型解释", "机器学习", "SHAP", "LIME"],
        "category_path": "数据科学与AI/机器学习/监督学习"
    },
    # --- 机器学习/无监督学习
    {
        "title": "聚类算法选择指南",
        "content": (
            "请比较常见聚类算法（KMeans、DBSCAN、层次聚类等）及其适用场景，附代码示例。"
        ),
        "description": "为数据科学家选择合适聚类方法提供参考。",
        "tags": ["聚类", "无监督学习", "机器学习", "Python"],
        "category_path": "数据科学与AI/机器学习/无监督学习"
    },
    {
        "title": "降维技术比较分析",
        "content": (
            "请总结常用降维技术（PCA、t-SNE、UMAP等）的原理、优缺点与实际应用。"
        ),
        "description": "帮助分析师高效降维与可视化高维数据。",
        "tags": ["降维", "PCA", "t-SNE", "无监督学习"],
        "category_path": "数据科学与AI/机器学习/无监督学习"
    },
    {
        "title": "异常检测系统设计",
        "content": (
            "请介绍无监督异常检测算法及其在金融/风控等领域的系统设计方案。"
        ),
        "description": "为风控和数据安全场景提供异常检测参考。",
        "tags": ["异常检测", "无监督学习", "风控", "机器学习"],
        "category_path": "数据科学与AI/机器学习/无监督学习"
    },
    # --- 机器学习/强化学习
    {
        "title": "强化学习环境设计",
        "content": (
            "请说明如何搭建和自定义强化学习环境，包含OpenAI Gym的扩展方法与案例。"
        ),
        "description": "帮助AI工程师快速构建强化学习实验环境。",
        "tags": ["强化学习", "环境设计", "OpenAI Gym", "AI"],
        "category_path": "数据科学与AI/机器学习/强化学习"
    },
    {
        "title": "多智能体系统策略",
        "content": (
            "请介绍多智能体强化学习的常见策略与协作机制，结合实际应用场景。"
        ),
        "description": "为AI开发者提供多智能体系统的实现思路。",
        "tags": ["多智能体", "强化学习", "AI", "协作"],
        "category_path": "数据科学与AI/机器学习/强化学习"
    },
    {
        "title": "奖励函数优化方法",
        "content": (
            "请总结强化学习中奖励函数设计的常见问题与优化技巧，附代码案例。"
        ),
        "description": "帮助研究者提升强化学习模型的训练效率。",
        "tags": ["奖励函数", "强化学习", "AI", "优化"],
        "category_path": "数据科学与AI/机器学习/强化学习"
    },
    # --- 深度学习/计算机视觉
    {
        "title": "CNN架构设计原则",
        "content": (
            "请总结卷积神经网络（CNN）设计的常用架构原则，如残差连接、批归一化等，附主流模型对比。"
        ),
        "description": "帮助深度学习工程师设计高效的视觉模型。",
        "tags": ["CNN", "计算机视觉", "深度学习", "模型设计"],
        "category_path": "数据科学与AI/深度学习/计算机视觉"
    },
    {
        "title": "目标检测模型优化",
        "content": (
            "请介绍目标检测模型（如YOLO、Faster R-CNN）的优化技巧和部署经验。"
        ),
        "description": "为CV工程师提供目标检测项目优化参考。",
        "tags": ["目标检测", "计算机视觉", "模型优化", "深度学习"],
        "category_path": "数据科学与AI/深度学习/计算机视觉"
    },
    {
        "title": "图像分割最佳实践",
        "content": (
            "请总结图像分割常用模型（如U-Net、Mask R-CNN）及其在医学/工业领域的最佳实践。"
        ),
        "description": "帮助工程师落地高质量图像分割项目。",
        "tags": ["图像分割", "计算机视觉", "深度学习", "最佳实践"],
        "category_path": "数据科学与AI/深度学习/计算机视觉"
    },
    # --- 深度学习/自然语言处理
    {
        "title": "Transformer模型微调",
        "content": (
            "请介绍Transformer模型（如BERT、GPT）微调流程与常见技巧，附代码示例。"
        ),
        "description": "帮助NLP工程师高效微调大模型，提升下游任务表现。",
        "tags": ["Transformer", "NLP", "微调", "深度学习"],
        "category_path": "数据科学与AI/深度学习/自然语言处理"
    },
    # --- 深度学习/自然语言处理（续）
    {
        "title": "文本摘要算法优化",
        "content": (
            "请介绍主流文本自动摘要算法（如抽取式与生成式），并给出在实际NLP项目中的优化建议。"
        ),
        "description": "帮助NLP工程师提升文本摘要模型的效果与应用场景。",
        "tags": ["文本摘要", "NLP", "自然语言处理", "深度学习"],
        "category_path": "数据科学与AI/深度学习/自然语言处理"
    },

    # --- 深度学习/生成式AI
    {
        "title": "扩散模型提示工程",
        "content": (
            "请介绍扩散模型（Diffusion Model）在文本/图像生成中的提示词设计方法与优化技巧。"
        ),
        "description": "为AI创作者提供扩散模型高质量提示词设计思路。",
        "tags": ["扩散模型", "生成式AI", "提示工程", "深度学习"],
        "category_path": "数据科学与AI/深度学习/生成式AI"
    },
    {
        "title": "GAN训练稳定性技巧",
        "content": (
            "请总结生成对抗网络（GAN）训练中常见的不稳定问题及其解决方法。"
        ),
        "description": "帮助研究者提升GAN模型训练的成功率和生成质量。",
        "tags": ["GAN", "生成式AI", "深度学习", "模型训练"],
        "category_path": "数据科学与AI/深度学习/生成式AI"
    },
    {
        "title": "生成内容质量评估",
        "content": (
            "请介绍如何评估生成式AI内容的质量，包括自动指标与人工评测方法。"
        ),
        "description": "为AI内容生产提供系统的质量评估标准。",
        "tags": ["生成式AI", "内容评估", "深度学习", "质量指标"],
        "category_path": "数据科学与AI/深度学习/生成式AI"
    },

    # 3. 内容创作
    # --- 技术写作/API文档
    {
        "title": "RESTful API文档标准",
        "content": (
            "请总结RESTful API文档的编写标准，包括接口描述、参数说明、错误码与示例。"
        ),
        "description": "帮助开发团队规范API文档，提升协作效率。",
        "tags": ["API文档", "RESTful", "技术写作", "标准"],
        "category_path": "内容创作/技术写作/API文档"
    },
    # --- 技术写作/技术博客
    {
        "title": "技术博客内容规划",
        "content": (
            "请说明如何规划高质量技术博客内容，包括选题、结构、代码展示与读者互动。"
        ),
        "description": "为技术博主提供内容策划与写作建议。",
        "tags": ["技术博客", "内容规划", "技术写作", "博客"],
        "category_path": "内容创作/技术写作/技术博客"
    },
    # --- 技术写作/项目文档
    {
        "title": "软件架构文档模板",
        "content": (
            "请提供标准的软件架构文档模板，包括模块划分、接口说明与架构图。"
        ),
        "description": "帮助团队高效编写和维护项目架构文档。",
        "tags": ["架构文档", "项目文档", "模板", "技术写作"],
        "category_path": "内容创作/技术写作/项目文档"
    },
    # --- 创意写作/产品文案
    {
        "title": "SaaS产品功能描述",
        "content": (
            "请为SaaS类产品撰写简洁有力的功能描述文案，突出核心价值与差异化。"
        ),
        "description": "帮助产品经理和市场人员高效输出产品文案。",
        "tags": ["产品文案", "SaaS", "创意写作", "营销"],
        "category_path": "内容创作/创意写作/产品文案"
    },
    # --- 创意写作/社交媒体
    {
        "title": "技术社区内容策略",
        "content": (
            "请制定技术社区的内容运营策略，包括话题策划、用户激励与内容分发。"
        ),
        "description": "为社区运营者提升内容活跃度与用户参与度提供参考。",
        "tags": ["社区内容", "内容策略", "社交媒体", "运营"],
        "category_path": "内容创作/创意写作/社交媒体"
    },
    # --- 创意写作/广告文案
    {
        "title": "开发工具推广文案",
        "content": (
            "请撰写一段用于推广开发工具的广告文案，突出效率提升和易用性。"
        ),
        "description": "帮助技术产品市场推广快速产出高转化文案。",
        "tags": ["广告文案", "开发工具", "推广", "创意写作"],
        "category_path": "内容创作/创意写作/广告文案"
    },
    # --- 学术写作/论文写作
    {
        "title": "研究方法描述框架",
        "content": (
            "请提供一份学术论文中研究方法部分的标准写作框架和示例。"
        ),
        "description": "为科研人员规范论文写作结构提供参考。",
        "tags": ["论文写作", "研究方法", "学术写作", "框架"],
        "category_path": "内容创作/学术写作/论文写作"
    },
    # --- 学术写作/文献综述
    {
        "title": "系统性文献综述方法",
        "content": (
            "请总结系统性文献综述的检索、筛选与归纳流程，并给出写作建议。"
        ),
        "description": "帮助学者高效完成文献综述工作。",
        "tags": ["文献综述", "学术写作", "综述方法", "研究"],
        "category_path": "内容创作/学术写作/文献综述"
    },
    # --- 学术写作/研究提案
    {
        "title": "技术研究计划书",
        "content": (
            "请提供技术类课题申报书/研究计划书的结构模板及写作要点。"
        ),
        "description": "为技术研究项目申报和立项提供标准文档参考。",
        "tags": ["研究提案", "计划书", "学术写作", "技术研究"],
        "category_path": "内容创作/学术写作/研究提案"
    },

    # 4. 产品与设计
    # --- 产品管理/需求分析
    {
        "title": "用户需求收集技巧",
        "content": (
            "请总结用户需求收集的常用方法，包括访谈、问卷与竞品分析，附实际案例。"
        ),
        "description": "帮助产品经理科学收集和分析用户需求。",
        "tags": ["需求分析", "用户研究", "产品管理", "调研"],
        "category_path": "产品与设计/产品管理/需求分析"
    },
    # --- 产品管理/产品路线图
    {
        "title": "技术产品路线图设计",
        "content": (
            "请介绍技术产品路线图的制定流程，包括版本规划、优先级排序与可视化。"
        ),
        "description": "为产品团队提供路线图设计与沟通参考。",
        "tags": ["产品路线图", "产品管理", "规划", "设计"],
        "category_path": "产品与设计/产品管理/产品路线图"
    },
    # --- 产品管理/用户故事
    {
        "title": "敏捷用户故事编写",
        "content": (
            "请给出敏捷开发中用户故事的标准写法和验收标准示例。"
        ),
        "description": "帮助敏捷团队规范用户故事编写，提高开发效率。",
        "tags": ["用户故事", "敏捷开发", "产品管理", "需求"],
        "category_path": "产品与设计/产品管理/用户故事"
    },
    # --- UI/UX设计/界面设计
    {
        "title": "管理后台UI模式",
        "content": (
            "请总结管理后台常用UI设计模式与组件库选择建议，附交互示例。"
        ),
        "description": "为企业级后台系统UI设计提供参考。",
        "tags": ["UI设计", "管理后台", "组件库", "UX"],
        "category_path": "产品与设计/UI/UX设计/界面设计"
    },
    # --- UI/UX设计/用户体验
    {
        "title": "技术产品用户旅程",
        "content": (
            "请说明如何绘制技术产品的用户旅程地图，包含关键触点与痛点分析。"
        ),
        "description": "帮助产品经理与设计师优化用户体验。",
        "tags": ["用户体验", "用户旅程", "UX", "产品设计"],
        "category_path": "产品与设计/UI/UX设计/用户体验"
    },
    # --- UI/UX设计/可用性测试
    {
        "title": "可用性测试计划",
        "content": (
            "请给出一份完整的可用性测试计划模板，包括目标、流程、用户招募与数据分析。"
        ),
        "description": "为UX设计团队系统开展可用性测试提供工具。",
        "tags": ["可用性测试", "UX", "用户体验", "测试计划"],
        "category_path": "产品与设计/UI/UX设计/可用性测试"
    },
    # --- 交互设计/流程图
    {
        "title": "系统流程图设计",
        "content": (
            "请说明如何绘制清晰的系统流程图，包括符号规范、层级划分和常用工具。"
        ),
        "description": "帮助设计师和开发者高效沟通系统流程。",
        "tags": ["流程图", "交互设计", "系统设计", "可视化"],
        "category_path": "产品与设计/交互设计/流程图"
    },
    # --- 交互设计/线框图
    {
        "title": "功能原型线框设计",
        "content": (
            "请给出功能原型线框图的设计流程与交互规范建议。"
        ),
        "description": "为产品经理和设计师快速原型设计提供方法论。",
        "tags": ["线框图", "原型设计", "交互设计", "产品设计"],
        "category_path": "产品与设计/交互设计/线框图"
    },
    # --- 交互设计/原型设计
    {
        "title": "高保真原型转换指南",
        "content": (
            "请说明如何将低保真原型高效转化为高保真原型，包含工具选择与交互细节。"
        ),
        "description": "帮助设计团队提升原型交付效率和质量。",
        "tags": ["原型设计", "高保真", "交互设计", "产品设计"],
        "category_path": "产品与设计/交互设计/原型设计"
    },

    # 5. 业务与运营
    # --- 市场分析/竞品分析
    {
        "title": "技术竞品分析框架",
        "content": (
            "请提供一套技术产品竞品分析的标准流程和对比矩阵模板。"
        ),
        "description": "帮助产品经理系统分析竞品，明确产品定位。",
        "tags": ["竞品分析", "市场分析", "产品定位", "对比矩阵"],
        "category_path": "业务与运营/市场分析/竞品分析"
    },
    # --- 市场分析/市场趋势
    {
        "title": "技术趋势分析方法",
        "content": (
            "请介绍技术行业趋势分析的常用方法与数据来源。"
        ),
        "description": "为战略与产品决策提供前瞻性趋势洞察。",
        "tags": ["市场趋势", "行业分析", "数据来源", "市场分析"],
        "category_path": "业务与运营/市场分析/市场趋势"
    },
    # --- 市场分析/用户研究
    {
        "title": "开发者用户画像",
        "content": (
            "请说明如何构建开发者用户画像，包括数据收集、特征分析与分群。"
        ),
        "description": "为技术产品用户研究与精准运营提供方法。",
        "tags": ["用户研究", "用户画像", "开发者", "市场分析"],
        "category_path": "业务与运营/市场分析/用户研究"
    },
    # --- 运营管理/客户支持
    {
        "title": "技术支持流程设计",
        "content": (
            "请总结技术产品客户支持的流程设计与工单系统搭建建议。"
        ),
        "description": "帮助企业构建高效的客户支持体系。",
        "tags": ["客户支持", "技术支持", "流程设计", "运营管理"],
        "category_path": "业务与运营/运营管理/客户支持"
    },
    # --- 运营管理/社区运营
    {
        "title": "开发者社区建设",
        "content": (
            "请给出开发者社区从0到1的建设流程、激励机制与内容运营建议。"
        ),
        "description": "为技术社区运营者提供系统建设方法论。",
        "tags": ["社区运营", "开发者社区", "激励机制", "内容运营"],
        "category_path": "业务与运营/运营管理/社区运营"
    },
    # --- 运营管理/活动策划
    {
        "title": "技术研讨会设计",
        "content": (
            "请说明如何策划一场高质量的技术研讨会，包括议题筛选、嘉宾邀请与互动设计。"
        ),
        "description": "为技术活动策划与运营提供实战指南。",
        "tags": ["活动策划", "技术研讨会", "运营管理", "会议"],
        "category_path": "业务与运营/运营管理/活动策划"
    },
    # --- 数据分析/KPI分析
    {
        "title": "技术产品KPI设计",
        "content": (
            "请介绍技术产品常用KPI指标的设计原则与数据采集方法。"
        ),
        "description": "帮助企业科学设定和追踪产品KPI。",
        "tags": ["KPI", "数据分析", "产品指标", "运营"],
        "category_path": "业务与运营/数据分析/KPI分析"
    },
    # --- 数据分析/用户行为分析
    {
        "title": "用户参与度分析",
        "content": (
            "请说明如何分析用户参与度，包括活跃度、留存率与行为路径追踪。"
        ),
        "description": "为产品和运营团队提升用户粘性提供数据支持。",
        "tags": ["用户行为", "参与度", "数据分析", "留存率"],
        "category_path": "业务与运营/数据分析/用户行为分析"
    },
    # --- 数据分析/业务报告
    {
        "title": "技术运营报告模板",
        "content": (
            "请提供一份技术产品运营报告的标准模板，包括核心数据、分析结论与优化建议。"
        ),
        "description": "帮助团队高效输出运营分析报告。",
        "tags": ["运营报告", "数据分析", "报告模板", "业务分析"],
        "category_path": "业务与运营/数据分析/业务报告"
    }
]
    
    # 分批插入（每批最多10条，避免超时）
    batch_size = 10
    for i in range(0, len(prompts_batch), batch_size):
        batch = prompts_batch[i:i+batch_size]
        for prompt in batch:
            cat_id = path2id.get(prompt["category_path"])
            if not cat_id:
                print(f"未找到分类: {prompt['category_path']}")
                continue
            prompt_data = {
                "title": prompt["title"],
                "content": prompt["content"],
                "description": prompt.get("description", ""),
                "tags": prompt.get("tags", []),
                "category_id": cat_id
            }
            create_prompt(token, prompt_data)
            time.sleep(0.2)  # 可根据后端压力调整
        print(f"已完成第{i//batch_size+1}批插入，休息2秒...")
        time.sleep(2)

    print("全部批量插入完成！")
