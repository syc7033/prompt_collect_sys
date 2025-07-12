import React, { useState, useEffect } from 'react';
import { Card, Statistic, Row, Col, Tooltip, Spin, Typography } from 'antd';
import { EyeOutlined, CopyOutlined, SendOutlined, ForkOutlined, FireOutlined } from '@ant-design/icons';
import { getUsageStats, UsageStat } from '../../services/usage';

const { Title } = Typography;

interface UsageStatsProps {
  promptId: string;
}

const UsageStats: React.FC<UsageStatsProps> = ({ promptId }) => {
  const [stats, setStats] = useState<UsageStat | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getUsageStats(promptId);
        setStats(data);
      } catch (error) {
        console.error('获取使用统计失败:', error);
      } finally {
        setLoading(false);
      }
    };

    if (promptId) {
      fetchStats();
    }
  }, [promptId]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <Spin />
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <Title level={5}>使用统计</Title>
        <p>暂无使用数据</p>
      </Card>
    );
  }

  // 计算热度等级（1-5）
  const getHeatLevel = (total: number) => {
    if (total < 10) return 1;
    if (total < 50) return 2;
    if (total < 100) return 3;
    if (total < 500) return 4;
    return 5;
  };

  const heatLevel = getHeatLevel(stats.total_usages);
  
  // 生成热度图标
  const renderHeatIcons = (level: number) => {
    const icons = [];
    for (let i = 0; i < level; i++) {
      icons.push(
        <FireOutlined 
          key={i} 
          style={{ 
            color: '#ff4d4f', 
            fontSize: '16px',
            marginRight: '2px'
          }} 
        />
      );
    }
    return icons;
  };

  return (
    <Card style={{ marginTop: 24, marginBottom: 24 }}>
      <Title level={5}>使用统计</Title>
      
      <div style={{ marginBottom: 16 }}>
        <Tooltip title={`热度等级 ${heatLevel}/5`}>
          <div>
            热度: {renderHeatIcons(heatLevel)}
          </div>
        </Tooltip>
      </div>
      
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Statistic 
            title="总使用次数" 
            value={stats.total_usages} 
            prefix={<FireOutlined style={{ color: '#ff4d4f' }} />} 
          />
        </Col>
        <Col xs={12} sm={6}>
          <Statistic 
            title="查看次数" 
            value={stats.view_count} 
            prefix={<EyeOutlined style={{ color: '#1890ff' }} />} 
          />
        </Col>
        <Col xs={12} sm={6}>
          <Statistic 
            title="复制次数" 
            value={stats.copy_count} 
            prefix={<CopyOutlined style={{ color: '#52c41a' }} />} 
          />
        </Col>
        <Col xs={12} sm={6}>
          <Statistic 
            title="应用次数" 
            value={stats.apply_count} 
            prefix={<SendOutlined style={{ color: '#722ed1' }} />} 
          />
        </Col>
      </Row>
      
      <div style={{ marginTop: 16 }}>
        <Statistic 
          title="Fork次数" 
          value={stats.fork_count} 
          prefix={<ForkOutlined style={{ color: '#faad14' }} />} 
        />
      </div>
    </Card>
  );
};

export default UsageStats;
