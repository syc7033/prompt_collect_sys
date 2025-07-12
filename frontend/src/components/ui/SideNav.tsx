import React, { useState, useEffect, useRef } from 'react';
import { Menu, Tree, Tag, Spin, Button } from 'antd';
import { 
  FolderOutlined, 
  TagsOutlined, 
  StarOutlined, 
  MenuFoldOutlined, 
  MenuUnfoldOutlined,
  SettingOutlined,
  FileOutlined,
  FolderOpenOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../utils/AuthContext';
import { getCategories, getCategoryTree, getCategoryTreeWithCounts, Category } from '../../services/categories';
import { getFavorites, Favorite } from '../../services/favorites';
import { getPopularTags } from '../../services/stats';

// 使用从服务导入的接口

interface SideNavProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

const { SubMenu } = Menu;
const { DirectoryTree } = Tree;

const SideNav: React.FC<SideNavProps> = ({ collapsed, onCollapse }) => {

  console.log('[SideNav] 组件渲染:', { collapsed, onCollapseType: typeof onCollapse });
  const [categories, setCategories] = useState<Category[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [popularTags, setPopularTags] = useState<{tag: string, count: number}[]>([]);
  const [loading, setLoading] = useState({
    categories: true,
    favorites: true,
    tags: true
  });
  
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  
  // 缓存分类数据和最后获取时间
  const categoriesCache = useRef<{data: Category[], timestamp: number}>({data: [], timestamp: 0});
  const categoriesFetchingRef = useRef<boolean>(false);
  
  // 获取分类数据
  useEffect(() => {
    const fetchCategories = async () => {
      // 如果已经在获取中，则跳过
      if (categoriesFetchingRef.current) {
        console.log('[SideNav] 分类数据正在获取中，跳过重复请求');
        return;
      }
      
      // 检查缓存是否有效（5分钟内）
      const now = Date.now();
      if (categoriesCache.current.data.length > 0 && 
          now - categoriesCache.current.timestamp < 5 * 60 * 1000) {
        console.log('[SideNav] 使用缓存的分类数据');
        setCategories(categoriesCache.current.data);
        return;
      }
      
      console.log('[SideNav] 开始获取分类数据');
      try {
        categoriesFetchingRef.current = true;
        setLoading(prev => ({ ...prev, categories: true }));
        // 使用服务获取带子节点计数的分类数据
        const data = await getCategoryTreeWithCounts();
        console.log('[SideNav] 获取分类数据成功:', data);
        // 确保数据类型正确
        setCategories(data as Category[]);
        // 更新缓存
        categoriesCache.current = {data: data as Category[], timestamp: now};
      } catch (error) {
        console.error('[SideNav] 获取分类数据出错:', error);
      } finally {
        categoriesFetchingRef.current = false;
        setLoading(prev => ({ ...prev, categories: false }));
      }
    };
    
    if (!collapsed) {
      fetchCategories();
    } else {
      console.log('[SideNav] 导航栏已折叠，跳过获取分类数据');
    }
  }, [collapsed]);
  
  // 缓存收藏夹数据和最后获取时间
  const favoritesCache = useRef<{data: Favorite[], timestamp: number}>({data: [], timestamp: 0});
  const favoritesFetchingRef = useRef<boolean>(false);
  
  // 获取收藏夹数据的函数
  const fetchFavorites = async () => {
    // 如果已经在获取中，则跳过
    if (favoritesFetchingRef.current) {
      console.log('[SideNav] 收藏夹数据正在获取中，跳过重复请求');
      return;
    }
    
    // 检查缓存是否有效（2分钟内）
    const now = Date.now();
    if (favoritesCache.current.data.length > 0 && 
        now - favoritesCache.current.timestamp < 2 * 60 * 1000) {
      console.log('[SideNav] 使用缓存的收藏夹数据');
      setFavorites(favoritesCache.current.data);
      return;
    }
    
    console.log('[SideNav] 开始获取收藏夹数据');
    try {
      favoritesFetchingRef.current = true;
      setLoading(prev => ({ ...prev, favorites: true }));
      // 使用服务获取收藏夹数据
      if (isAuthenticated) {
        const data = await getFavorites();
        console.log('[SideNav] 获取收藏夹数据成功:', data);
        setFavorites(data);
        // 更新缓存
        favoritesCache.current = {data, timestamp: now};
      } else {
        // 未登录时显示空列表
        console.log('[SideNav] 用户未登录，设置空收藏夹列表');
        setFavorites([]);
        favoritesCache.current = {data: [], timestamp: now};
      }
    } catch (error) {
      console.error('[SideNav] 获取收藏夹数据出错:', error);
    } finally {
      favoritesFetchingRef.current = false;
      setLoading(prev => ({ ...prev, favorites: false }));
    }
  };
  
  // 监听折叠状态和登录状态变化
  useEffect(() => {
    if (!collapsed) {
      fetchFavorites();
    } else {
      console.log('[SideNav] 导航栏已折叠，跳过获取收藏夹数据');
    }
  }, [collapsed, isAuthenticated]);
  
  // 使用路由变化的引用来避免过多请求
  const lastPathRef = useRef<string>(router.pathname);
  
  // 监听路由变化，当从收藏夹页面返回时刷新数据
  useEffect(() => {
    // 只有当路由真正变化时才处理
    if (router.pathname !== lastPathRef.current) {
      lastPathRef.current = router.pathname;
      
      // 如果路由不是收藏夹相关页面，并且不是折叠状态，则刷新收藏夹数据
      if (!collapsed && !router.pathname.includes('/favorites')) {
        // 添加延时避免频繁请求
        const timer = setTimeout(() => {
          fetchFavorites();
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [router.pathname, collapsed]);
  
  // 缓存热门标签数据和最后获取时间
  const tagsCache = useRef<{data: {tag: string, count: number}[], timestamp: number}>({data: [], timestamp: 0});
  const tagsFetchingRef = useRef<boolean>(false);
  
  // 获取热门标签
  useEffect(() => {
    const fetchTags = async () => {
      // 如果已经在获取中，则跳过
      if (tagsFetchingRef.current) {
        console.log('[SideNav] 热门标签数据正在获取中，跳过重复请求');
        return;
      }
      
      // 检查缓存是否有效（10分钟内）
      const now = Date.now();
      if (tagsCache.current.data.length > 0 && 
          now - tagsCache.current.timestamp < 10 * 60 * 1000) {
        console.log('[SideNav] 使用缓存的热门标签数据');
        setPopularTags(tagsCache.current.data);
        return;
      }
      
      console.log('[SideNav] 开始获取热门标签');
      try {
        tagsFetchingRef.current = true;
        setLoading(prev => ({ ...prev, tags: true }));
        
        // 使用服务获取热门标签
        console.log('[SideNav] 调用 getPopularTags 函数，限制数量: 10');
        const data = await getPopularTags(10);
        
        console.log('[SideNav] 获取热门标签成功，数据类型:', typeof data);
        console.log('[SideNav] 获取热门标签成功，是否为数组:', Array.isArray(data));
        
        if (Array.isArray(data)) {
          setPopularTags(data);
          // 更新缓存
          tagsCache.current = {data, timestamp: now};
          console.log('[SideNav] 成功设置热门标签数据到状态');
        } else {
          console.error('[SideNav] 获取的标签数据不是数组格式');
        }
      } catch (error) {
        console.error('[SideNav] 获取热门标签出错:', error);
      } finally {
        tagsFetchingRef.current = false;
        setLoading(prev => ({ ...prev, tags: false }));
        console.log('[SideNav] 热门标签加载状态设置为完成');
      }
    };
    
    if (!collapsed) {
      // 添加延时避免多个请求同时发出
      const timer = setTimeout(() => {
        console.log('[SideNav] 导航栏已展开，开始获取热门标签');
        fetchTags();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      console.log('[SideNav] 导航栏已折叠，跳过获取热门标签');
    }
  }, [collapsed]);
  
  // 定义树节点类型
  interface TreeNode {
    key: string;
    title: React.ReactNode;
    children?: TreeNode[];
    isLeaf?: boolean;
    disabled?: boolean;
    className?: string;
  }

  // 将分类数据转换为Tree组件所需的格式
  const formatCategories = (categories: Category[]): TreeNode[] => {
    return categories.map(category => {
      // 检查是否为叶子节点（没有子分类的节点）
      const isLeafNode = !category.children || category.children.length === 0;
      
      return {
        key: category.id,
        title: (
          <span style={{ 
            // 非叶子节点使用不同的样式，使其看起来不可点击
            cursor: isLeafNode ? 'pointer' : 'default',
            // 叶子节点使用正常颜色，父分类使用深灰色
            color: isLeafNode ? 'inherit' : '#666',
            // 父分类使用粗体
            fontWeight: isLeafNode ? 'normal' : 'bold',
            // 父分类稍微大一点的字体
            fontSize: isLeafNode ? '14px' : '15px'
          }}>
            {category.name} 
            {/* 叶子节点显示提示词数量 */}
            {isLeafNode && (
              <span style={{ 
                fontSize: '12px', 
                color: '#1890ff', // 统一使用蓝色
                marginLeft: '5px',
                fontWeight: 'normal'
              }}>
                [{category.prompt_count || 0}]
              </span>
            )}
            {/* 父分类显示子节点数量 */}
            {!isLeafNode && (
              <span style={{ 
                fontSize: '12px', 
                color: '#1890ff', // 统一使用蓝色
                marginLeft: '5px',
                fontWeight: 'normal'
              }}>
                [{category.children_count || 0}]
              </span>
            )}
          </span>
        ),
        // 添加自定义属性标记是否为叶子节点
        isLeaf: isLeafNode,
        children: category.children ? formatCategories(category.children) : undefined,
        // 添加禁用属性，非叶子节点不可选择
        disabled: !isLeafNode,
        // 添加自定义类名
        className: isLeafNode ? 'leaf-node' : 'parent-node'
      };
    });
  };
  
  // 处理分类点击事件
  const handleCategorySelect = (selectedKeys: React.Key[], info: any) => {
    const categoryId = selectedKeys[0]?.toString();
    if (categoryId && info.node.props.isLeaf) {
      console.log(`[分类点击] 跳转到分类详情页面: /categories/${categoryId}`);
      router.push(`/categories/${categoryId}`);
    }
  };
  
  // 处理标签点击事件
  const handleTagClick = (tag: string) => {
    router.push(`/prompts?tag=${encodeURIComponent(tag)}`);
  };
  
  // 处理收藏夹点击事件
  const handleFavoriteClick = (favoriteId: string) => {
    router.push(`/favorites/${favoriteId}`);
  };
  
  // 打印渲染状态
  console.log('[SideNav] 侧边导航栏状态:', {
    categories: categories.length,
    favorites: favorites.length,
    popularTags: popularTags.length,
    loading
  });
  
  if (collapsed) {
    console.log('[SideNav] 导航栏已折叠，渲染折叠按钮');
    return (
      <div className="side-nav collapsed">
        <div className="side-nav-header">
          <Button 
            type="text" 
            icon={<MenuUnfoldOutlined />}
            onClick={() => {
              console.log('[SideNav] 折叠按钮被点击，当前状态:', { collapsed });
              onCollapse(false);
              console.log('[SideNav] 调用onCollapse(false)完成');
            }}
            className="collapse-button"
          />
        </div>
        <style jsx>{`
          .side-nav.collapsed {
            width: 80px;
            position: fixed;
            top: 64px;
            left: 0;
            bottom: 80px;
            z-index: 100;
            background-color: #fff;
            border-right: 1px solid #f0f0f0;
            transition: width 0.3s;
            overflow: hidden;
          }
          
          .side-nav-header {
            height: 64px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0;
            border-bottom: 1px solid #f0f0f0;
          }
          
          .collapse-button {
            border: none;
          }
        `}</style>
      </div>
    );
  }
  
  console.log('[SideNav] 渲染导航栏内容:', { 
    categoriesLoaded: categories.length > 0,
    favoritesLoaded: favorites.length > 0,
    tagsLoaded: popularTags.length > 0,
    loading
  });
  
  return (
    <div className={`side-nav ${collapsed ? 'collapsed' : ''}`}>
      <div className={`side-nav-inner ${collapsed ? 'collapsed' : ''}`}>
        <Button 
          type="text" 
          icon={<MenuFoldOutlined />}
          onClick={() => {
            console.log('[SideNav] 展开状态下的折叠按钮被点击，当前状态:', { collapsed });
            onCollapse(true);
            console.log('[SideNav] 调用onCollapse(true)完成');
          }}
          className="collapse-button"
        />
      </div>
      
      <div className="side-nav-content">
        {/* 分类 */}
        <div className="side-nav-section">
          <div className="section-title">
            <FolderOutlined /> {!collapsed && <span>分类</span>}
            {!collapsed && (
              <Link href="/categories">
                <a className="manage-link">
                  <SettingOutlined /> 管理
                </a>
              </Link>
            )}
          </div>
          {loading.categories ? (
            <div className="loading-container">
              <Spin size="small" />
            </div>
          ) : categories.length > 0 ? (
            <DirectoryTree
              defaultExpandAll={false}
              onSelect={handleCategorySelect}
              treeData={formatCategories(categories)}
              className="category-tree"
            />
          ) : (
            <div className="empty-message">
              {!collapsed && <span>暂无分类数据</span>}
            </div>
          )}
        </div>
        
        {/* 热门标签 */}
        <div className="side-nav-section">
          <div className="section-title">
            <TagsOutlined /> {!collapsed && <span>热门标签</span>}
          </div>
          {loading.tags ? (
            <div className="loading-container">
              <Spin size="small" />
              {!collapsed && <div style={{ marginTop: '8px', fontSize: '12px' }}>加载中...</div>}
            </div>
          ) : popularTags && popularTags.length > 0 ? (
            <div className="tag-columns">
              {console.log('[SideNav] 渲染热门标签，数量:', popularTags.length)}
              <div className="tag-column left-column">
                {popularTags.slice(0, 5).map((tag, index) => {
                  console.log(`[SideNav] 渲染左侧标签 ${index}:`, tag);
                  // 计算标签大小级别（1-5）
                  const countLevel = Math.min(5, Math.max(1, Math.ceil(tag.count / 2)));
                  return (
                    <Tag 
                      key={tag.tag || `tag-left-${index}`} 
                      className="display-tag"
                      data-count={countLevel}
                    >
                      {tag.tag}
                    </Tag>
                  );
                })}
              </div>
              <div className="tag-column right-column">
                {popularTags.slice(5, 10).map((tag, index) => {
                  console.log(`[SideNav] 渲染右侧标签 ${index + 5}:`, tag);
                  // 计算标签大小级别（1-5）
                  const countLevel = Math.min(5, Math.max(1, Math.ceil(tag.count / 2)));
                  return (
                    <Tag 
                      key={tag.tag || `tag-right-${index}`} 
                      className="display-tag"
                      data-count={countLevel}
                    >
                      {tag.tag}
                    </Tag>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="empty-message">
              {console.log('[SideNav] 没有热门标签数据，数组长度:', popularTags?.length)}
              {!collapsed && (
                <>
                  <span>暂无标签数据</span>
                  <div style={{ marginTop: '8px', fontSize: '12px', color: '#999' }}>
                    热门标签状态: {JSON.stringify(popularTags)}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        
        {/* 收藏夹 */}
        {isAuthenticated && (
          <div className="side-nav-section">
            <div className="section-title">
              <StarOutlined /> {!collapsed && <span>我的收藏夹</span>}
              {!collapsed && (
                <Link href="/favorites">
                  <a className="manage-link">
                    <SettingOutlined /> 管理
                  </a>
                </Link>
              )}
            </div>
            {loading.favorites ? (
              <div className="loading-container">
                <Spin size="small" />
              </div>
            ) : favorites.length > 0 ? (
              <Menu mode="inline" className="favorites-menu">
                {!collapsed && favorites.map(favorite => (
                  <Menu.Item 
                    key={favorite.id}
                    onClick={() => handleFavoriteClick(favorite.id)}
                  >
                    {favorite.name}
                  </Menu.Item>
                ))}
              </Menu>
            ) : (
              <div className="empty-message">
                {!collapsed && (
                  <>
                    <span>暂无收藏夹</span>
                    <Link href="/favorites">
                      <a className="create-link">创建收藏夹</a>
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      <style jsx>{`
        .side-nav {
          height: 100vh;
          background-color: #fff;
          border-right: 1px solid #f0f0f0;
          transition: width 0.3s;
          width: 250px;
          overflow-y: auto;
          overflow-x: hidden;
          position: fixed;
          top: 64px; /* 与顶部导航栏高度一致 */
          left: 0;
          bottom: 80px; /* 与底部页脚高度一致 */
          z-index: 100;
        }
        
        .side-nav.collapsed {
          width: 80px;
          /* 保持固定定位 */
          position: fixed;
          top: 64px;
          left: 0;
          bottom: 80px;
          z-index: 100;
        }
        
        .side-nav-header {
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding: 0 16px;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .collapse-button {
          border: none;
        }
        
        .side-nav-content {
          padding: 16px 0;
        }
        
        .side-nav-section {
          margin-bottom: 24px;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
          margin: 16px;
          overflow: hidden;
        }
        
        .section-title {
          font-weight: bold;
          padding: 12px 16px;
          color: #333;
          border-bottom: 1px solid #f0f0f0;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
          justify-content: space-between;
          background-color: #fafafa;
          font-size: 14px;
        }
        
        .manage-link {
          font-size: 12px;
          font-weight: normal;
          color: #1890ff;
        }
        
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px 0;
          gap: 10px;
        }
        
        .empty-message {
          padding: 20px 16px;
          color: #999;
          font-size: 14px;
          text-align: center;
          background-color: #fafafa;
          border-radius: 4px;
          margin: 8px 16px;
        }
        
        .create-link {
          display: block;
          margin-top: 12px;
          color: #1890ff;
          font-size: 13px;
        }
        
        .display-tag {
          margin: 5px 0;
          transition: all 0.3s;
          border-radius: 4px;
          padding: 5px 10px;
          background-color: #f5f5f5;
          border: none;
          font-size: 13px;
          display: inline-flex;
          align-items: center;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
          cursor: default; /* 取消点击手势 */
          max-width: 100%;
        }
        
        .tag-columns {
          padding: 12px 16px;
          display: flex;
          justify-content: space-between;
        }
        
        .tag-column {
          display: flex;
          flex-direction: column;
          width: 48%;
        }
        
        .left-column {
          align-items: flex-start;
        }
        
        .right-column {
          align-items: flex-start;
        }
        
        .display-tag {
          width: 100%;
          margin-bottom: 8px;
          text-align: left;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        /* 标签使用不同的颜色 */
        .display-tag:nth-child(5n+1) {
          background-color: #e6f7ff;
          color: #1890ff;
        }
        
        .display-tag:nth-child(5n+2) {
          background-color: #f6ffed;
          color: #52c41a;
        }
        
        .display-tag:nth-child(5n+3) {
          background-color: #fff7e6;
          color: #fa8c16;
        }
        
        .display-tag:nth-child(5n+4) {
          background-color: #fff0f6;
          color: #eb2f96;
        }
        
        .display-tag:nth-child(5n+5) {
          background-color: #f9f0ff;
          color: #722ed1;
        }
        
        /* 标签大小根据使用次数变化 */
        .display-tag[data-count="1"] {
          font-size: 12px;
        }
        
        .display-tag[data-count="2"] {
          font-size: 13px;
        }
        
        .display-tag[data-count="3"] {
          font-size: 14px;
        }
        
        .display-tag[data-count="4"] {
          font-size: 15px;
        }
        
        .display-tag[data-count="5"] {
          font-size: 16px;
        }
      `}</style>
      
      <style jsx global>{`
        .category-tree {
          padding: 8px 16px;
        }
        
        .category-tree .ant-tree-treenode {
          padding: 6px 0;
        }
        
        .category-tree .ant-tree-node-content-wrapper {
          padding: 4px 8px;
          border-radius: 4px;
          transition: all 0.3s;
        }
        
        /* 叶子节点样式 */
        .category-tree .leaf-node .ant-tree-node-content-wrapper:hover {
          background-color: #e6f7ff;
          cursor: pointer;
        }
        
        /* 非叶子节点样式 */
        .category-tree .parent-node .ant-tree-node-content-wrapper {
          cursor: default;
        }
        
        .category-tree .parent-node .ant-tree-node-content-wrapper:hover {
          background-color: transparent;
        }
        
        /* 禁用状态的节点样式 */
        .category-tree .ant-tree-treenode-disabled {
          opacity: 1; /* 保持完全可见 */
        }
        
        .category-tree .ant-tree-treenode-disabled .ant-tree-node-content-wrapper {
          color: #666 !important;
          cursor: default !important;
        }
        
        .favorites-menu {
          border-right: none !important;
        }
        
        .favorites-menu .ant-menu-item {
          margin: 4px 16px;
          padding: 0 16px;
          border-radius: 4px;
          height: 36px;
          line-height: 36px;
        }
        
        .favorites-menu .ant-menu-item:hover {
          background-color: #e6f7ff;
          color: #1890ff;
        }
      `}</style>
    </div>
  );
};

export default SideNav;
