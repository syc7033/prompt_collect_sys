import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import { FileTextOutlined, StarOutlined, EyeOutlined, TrophyOutlined } from '@ant-design/icons';
import { ProfileStatistics } from '../../types/profile';
import styles from './StatisticsCards.module.css';

interface StatisticsCardsProps {
  statistics: ProfileStatistics;
}

const StatisticsCards: React.FC<StatisticsCardsProps> = ({ statistics }) => {
  // 打印统计数据，特别关注平均评分
  console.log('统计数据:', statistics);
  console.log('平均评分原始值:', statistics.total_prompt_rating);
  console.log('平均评分类型:', typeof statistics.total_prompt_rating);
  
  // 计算要显示的评分值
  const ratingValue = statistics.total_prompt_rating ? Number(statistics.total_prompt_rating).toFixed(1) : "0.0";
  console.log('平均评分显示值:', ratingValue);
  return (
    <div className={styles.statisticsContainer}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="提示词数量"
              value={statistics.prompt_count}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="收藏夹数量"
              value={statistics.favorite_count}
              prefix={<StarOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="提示词使用次数"
              value={statistics.total_prompt_usage}
              prefix={<EyeOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="平均评分"
              value={ratingValue}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#722ed1' }}
              suffix="/5"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StatisticsCards;
