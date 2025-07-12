import React, { useState, useEffect } from 'react';
import { Card, List, Avatar, Statistic, Spin, Button } from 'antd';
import { 
  FireOutlined, 
  UserOutlined, 
  LineChartOutlined, 
  LinkOutlined,
  CloseOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { getStats, getActiveUsers, getResources, StatData, ActiveUser } from '../../services/stats';
import { getPopularPrompts, Prompt } from '../../services/prompts';

interface Resource {
  title: string;
  url: string;
  description: string;
}

interface InfoPanelProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ collapsed, onCollapse }) => {
  console.log('[InfoPanel] 组件渲染:', { collapsed, onCollapseType: typeof onCollapse });
  const [popularPrompts, setPopularPrompts] = useState<Prompt[]>([]);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [stats, setStats] = useState<StatData | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState({
    prompts: true,
    users: true,
    stats: true,
    resources: true
  });
  
  // 获取热门提示词
  useEffect(() => {
    const fetchPopularPrompts = async () => {
      console.log('[InfoPanel] 开始获取热门提示词');
      try {
        setLoading(prev => ({ ...prev, prompts: true }));
        
        // 先尝试从热门提示词端点获取数据
        console.log('[InfoPanel] 尝试从热门提示词端点获取数据');
        let prompts: Prompt[] = [];
        
        try {
          // 尝试从使用统计API获取热门提示词
          const usageResponse = await fetch('/api/usage/popular?limit=10&time_range=30');
          if (usageResponse.ok) {
            const usageData = await usageResponse.json();
            console.log('[InfoPanel] 从使用统计API获取热门提示词成功:', usageData);
            
            if (usageData && usageData.data && usageData.data.length > 0) {
              // 如果有数据，获取完整的提示词信息
              const promptIds = usageData.data.map((item: any) => item.prompt_id);
              console.log('[InfoPanel] 提取的热门提示词ID:', promptIds);
              
              // 获取完整的提示词数据
              prompts = await getPopularPrompts(10);
            }
          }
        } catch (usageError) {
          console.error('[InfoPanel] 从使用统计API获取热门提示词失败:', usageError);
        }
        
        // 如果从热门端点没有获取到数据，尝试获取普通提示词
        if (prompts.length === 0) {
          console.log('[InfoPanel] 从普通提示词端点获取数据');
          prompts = await getPopularPrompts(5);
        }
        
        console.log('[InfoPanel] 获取到的提示词原始数据:', JSON.stringify(prompts));
        
        // 获取每个提示词的使用统计数据
        const promptsWithStats = await Promise.all(prompts.map(async (prompt) => {
          try {
            // 获取使用统计数据
            const statsResponse = await fetch(`/api/usage/prompts/${prompt.id}/stats`);
            if (statsResponse.ok) {
              const statsData = await statsResponse.json();
              console.log(`[InfoPanel] 获取提示词 ${prompt.title} 的统计数据成功:`, statsData);
              
              if (statsData && statsData.data) {
                // 计算总使用次数
                const totalUsages = statsData.data.view_count + statsData.data.copy_count + 
                                    statsData.data.apply_count + statsData.data.fork_count;
                
                // 更新提示词对象
                return {
                  ...prompt,
                  usage_count: totalUsages,
                  usage_stats: {
                    views: statsData.data.view_count || 0,
                    copies: statsData.data.copy_count || 0,
                    applies: statsData.data.apply_count || 0,
                    forks: statsData.data.fork_count || 0
                  }
                };
              }
            }
            return prompt;
          } catch (error) {
            console.error(`[InfoPanel] 获取提示词 ${prompt.title} 的统计数据失败:`, error);
            return prompt;
          }
        }));
        
        // 输出每个提示词的使用次数
        console.log('[InfoPanel] 每个提示词的使用次数:');
        promptsWithStats.forEach((item, index) => {
          const usageCount = item.usage_count || 0;
          const usageStats = item.usage_stats ? 
            (item.usage_stats.views + item.usage_stats.copies + item.usage_stats.applies + item.usage_stats.forks) : 0;
          console.log(`[InfoPanel] 提示词 ${index+1}: ${item.title}, usage_count=${usageCount}, 总使用次数=${usageStats}`);
        });
        
        // 按使用次数排序
        const sortedPrompts = [...promptsWithStats].sort((a, b) => {
          const usageA = a.usage_count || 0;
          const usageB = b.usage_count || 0;
          console.log(`[InfoPanel] 比较: ${a.title}(${usageA}) vs ${b.title}(${usageB})`);
          return usageB - usageA; // 降序排序
        });
        
        console.log('[InfoPanel] 排序后的热门提示词:');
        sortedPrompts.forEach((item, index) => {
          console.log(`[InfoPanel] 排序后 ${index+1}: ${item.title}, usage_count=${item.usage_count || 0}`);
        });
        
        // 取前5个提示词
        setPopularPrompts(sortedPrompts.slice(0, 5));
      } catch (error) {
        console.error('[InfoPanel] 获取热门提示词出错:', error);
      } finally {
        setLoading(prev => ({ ...prev, prompts: false }));
      }
    };
    
    if (!collapsed) {
      fetchPopularPrompts();
    } else {
      console.log('[InfoPanel] 面板已折叠，跳过获取热门提示词');
    }
  }, [collapsed]);
  
  // 获取活跃用户
  useEffect(() => {
    const fetchActiveUsers = async () => {
      console.log('[InfoPanel] 开始获取活跃用户');
      try {
        setLoading(prev => ({ ...prev, users: true }));
        // 使用服务获取活跃用户
        const data = await getActiveUsers(5);
        console.log('[InfoPanel] 获取活跃用户成功:', data);
        setActiveUsers(data);
      } catch (error) {
        console.error('[InfoPanel] 获取活跃用户出错:', error);
      } finally {
        setLoading(prev => ({ ...prev, users: false }));
      }
    };
    
    if (!collapsed) {
      fetchActiveUsers();
    } else {
      console.log('[InfoPanel] 面板已折叠，跳过获取活跃用户');
    }
  }, [collapsed]);
  
  // 获取统计数据
  useEffect(() => {
    const fetchStats = async () => {
      console.log('[InfoPanel] 开始获取统计数据');
      try {
        setLoading(prev => ({ ...prev, stats: true }));
        // 使用服务获取统计数据
        const data = await getStats();
        console.log('[InfoPanel] 获取统计数据成功:', data);
        setStats(data);
      } catch (error) {
        console.error('[InfoPanel] 获取统计数据出错:', error);
      } finally {
        setLoading(prev => ({ ...prev, stats: false }));
      }
    };
    
    if (!collapsed) {
      fetchStats();
    } else {
      console.log('[InfoPanel] 面板已折叠，跳过获取统计数据');
    }
  }, [collapsed]);
  
  // 获取相关资源
  useEffect(() => {
    const fetchResources = async () => {
      console.log('[InfoPanel] 开始获取相关资源');
      try {
        setLoading(prev => ({ ...prev, resources: true }));
        // 使用服务获取相关资源
        const data = await getResources();
        console.log('[InfoPanel] 获取相关资源成功:', data);
        setResources(data);
      } catch (error) {
        console.error('[InfoPanel] 获取相关资源出错:', error);
      } finally {
        setLoading(prev => ({ ...prev, resources: false }));
      }
    };
    
    if (!collapsed) {
      fetchResources();
    } else {
      console.log('[InfoPanel] 面板已折叠，跳过获取相关资源');
    }
  }, [collapsed]);
  
  if (collapsed) {
    console.log('[InfoPanel] 面板已折叠，渲染折叠按钮');
    return (
      <div className="info-panel collapsed">
        <div className="info-panel-header collapsed">
          <Button 
            type="text" 
            icon={<LinkOutlined />}
            onClick={() => {
              console.log('[InfoPanel] 折叠状态下的展开按钮被点击，当前状态:', { collapsed });
              onCollapse(false);
              console.log('[InfoPanel] 调用onCollapse(false)完成');
            }}
            className="collapse-button"
          />
        </div>
        <style jsx>{`
          .info-panel.collapsed {
            width: 80px;
            position: fixed;
            top: 64px;
            right: 0;
            bottom: 80px;
            z-index: 100;
            background-color: #fff;
            border-left: 1px solid #f0f0f0;
            transition: width 0.3s;
            overflow: hidden;
          }
          
          .info-panel-header.collapsed {
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
  
  console.log('[InfoPanel] 渲染面板内容:', { 
    promptsLoaded: popularPrompts.length > 0,
    usersLoaded: activeUsers.length > 0,
    statsLoaded: stats !== null,
    resourcesLoaded: resources.length > 0,
    loading
  });
  
  return (
    <div className="info-panel">
      <div className="info-panel-header">
        <h3>信息面板</h3>
        <Button 
          type="text" 
          icon={<CloseOutlined />} 
          onClick={() => {
            console.log('[InfoPanel] 展开状态下的折叠按钮被点击，当前状态:', { collapsed });
            onCollapse(true);
            console.log('[InfoPanel] 调用onCollapse(true)完成');
          }}
          className="collapse-button"
        />
      </div>
      
      {/* 平台统计 */}
      <Card 
        title={<><LineChartOutlined /> 平台统计</>} 
        className="info-card"
        size="small"
        loading={loading.stats}
      >
        {stats && (
          <div className="stats-container">
            <Statistic title="总提示词数" value={stats.total_prompts} />
            <Statistic title="总用户数" value={stats.total_users} />
            <Statistic title="总使用次数" value={stats.total_usages} />
            <Statistic title="今日新增" value={stats.prompts_today} />
          </div>
        )}
      </Card>
      
      {/* 热门提示词 */}
      <Card 
        title={<><FireOutlined /> 热门提示词</>} 
        className="info-card"
        size="small"
        extra={<Link href="/prompts/popular"><a>查看更多</a></Link>}
        loading={loading.prompts}
      >
        <List
          itemLayout="horizontal"
          dataSource={popularPrompts}
          renderItem={(item, index) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <div className="rank-badge">
                    {index + 1}
                  </div>
                }
                title={<Link href={`/prompts/${item.id}`}><a>{item.title}</a></Link>}
                description={`${item.user?.username || item.creator?.username} · ${item.usage_count || (item.usage_stats ? (item.usage_stats.views + item.usage_stats.copies + item.usage_stats.applies + item.usage_stats.forks) : 0)}次使用`}
              />
            </List.Item>
          )}
        />
      </Card>
      
      {/* 活跃用户 */}
      <Card 
        title={<><UserOutlined /> 活跃用户</>} 
        className="info-card"
        size="small"
        loading={loading.users}
      >
        <List
          itemLayout="horizontal"
          dataSource={activeUsers}
          renderItem={(item, index) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Avatar src={item.avatar} icon={<UserOutlined />} />
                }
                title={<span style={{ cursor: 'default' }}>{item.username}</span>}
                description={`${item.prompt_count}个提示词`}
              />
            </List.Item>
          )}
        />
      </Card>
      
      {/* 相关资源 */}
      <Card 
        title={<><LinkOutlined /> 相关资源</>} 
        className="info-card"
        size="small"
        loading={loading.resources}
      >
        <List
          itemLayout="horizontal"
          dataSource={resources}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                title={<a href={item.url} target="_blank" rel="noopener noreferrer">{item.title}</a>}
                description={item.description}
              />
            </List.Item>
          )}
        />
      </Card>
      
      <style jsx>{`
        .info-panel {
          height: 100vh;
          background-color: #fff;
          border-left: 1px solid #f0f0f0;
          width: 300px;
          overflow-y: auto;
          padding: 0 0 20px 0;
          position: fixed;
          top: 64px; /* 与顶部导航栏高度一致 */
          right: 0;
          bottom: 80px; /* 与底部页脚高度一致 */
          z-index: 100;
        }
        
        .info-panel-header {
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .info-panel-header h3 {
          margin: 0;
        }
        
        .collapse-button {
          border: none;
        }
        
        .stats-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        
        .rank-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background-color: #f5f5f5;
          border-radius: 50%;
          font-weight: bold;
        }
      `}</style>
      
      <style jsx global>{`
        .info-card {
          margin: 16px;
        }
        
        .info-card .ant-card-head {
          min-height: 40px;
        }
        
        .info-card .ant-card-head-title {
          padding: 8px 0;
        }
        
        .info-card .ant-card-extra {
          padding: 8px 0;
        }
      `}</style>
    </div>
  );
};

export default InfoPanel;
