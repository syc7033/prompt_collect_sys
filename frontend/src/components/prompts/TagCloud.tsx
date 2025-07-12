import React from 'react';
import { Tag, Spin } from 'antd';
import { TagCount } from '../../services/prompts';

interface TagCloudProps {
  tags: TagCount[];
  loading: boolean;
  onTagClick: (tag: string) => void;
  selectedTags?: string[];
}

const TagCloud: React.FC<TagCloudProps> = ({
  tags,
  loading,
  onTagClick,
  selectedTags = [],
}) => {
  if (loading) {
    return <Spin size="large" style={{ display: 'block', margin: '20px auto' }} />;
  }

  if (!tags || tags.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '20px',
        fontSize: '16px',
        color: '#999',
        direction: 'ltr',
        writingMode: 'horizontal-tb'
      }}>
        暂无标签
      </div>
    );
  }

  // 根据标签使用频率计算字体大小
  const maxCount = Math.max(...tags.map(tag => tag.count));
  const minCount = Math.min(...tags.map(tag => tag.count));
  const fontSizeScale = (count: number) => {
    // 将标签使用频率映射到14-22px的字体大小范围
    if (maxCount === minCount) return 16;
    return 14 + (count - minCount) / (maxCount - minCount) * 8;
  };
  
  // 根据标签使用频率计算颜色深浅
  const getTagColor = (count: number, selected: boolean) => {
    if (selected) return 'blue';
    
    const colors = ['#e6f7ff', '#bae7ff', '#91d5ff', '#69c0ff', '#40a9ff'];
    if (maxCount === minCount) return colors[2];
    
    const index = Math.floor((count - minCount) / (maxCount - minCount) * (colors.length - 1));
    return colors[index];
  };

  // 计算标签的最大宽度
  const tagWidths = {};
  const tagGroups = [];
  
  // 将标签分组，每组4个标签
  for (let i = 0; i < tags.length; i += 4) {
    tagGroups.push(tags.slice(i, i + 4));
  }
  
  return (
    <div 
      className="tag-cloud"
      style={{
        padding: '10px',
        direction: 'ltr',
        writingMode: 'horizontal-tb'
      }}
    >
      {tagGroups.map((group, groupIndex) => (
        <div 
          key={`group-${groupIndex}`}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '12px',
            width: '100%'
          }}
        >
          {group.map(tag => (
            <Tag
              key={tag.tag}
              color={selectedTags.includes(tag.tag) ? 'blue' : 'default'}
              style={{ 
                fontSize: `${fontSizeScale(tag.count)}px`,
                padding: '6px 12px',
                cursor: 'pointer',
                borderRadius: '16px',
                textAlign: 'center',
                flex: '1 0 21%',  // 固定宽度比例
                margin: '0 8px',   // 水平间距
                height: '32px',     // 固定高度
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '24%',    // 最大宽度
                minWidth: '22%',    // 最小宽度
                direction: 'ltr',
                writingMode: 'horizontal-tb'
              }}
              onClick={() => onTagClick(tag.tag)}
            >
              {tag.tag} ({tag.count})
            </Tag>
          ))}
          
          {/* 填充空白标签以保持对齐 */}
          {Array(4 - group.length).fill(0).map((_, index) => (
            <div 
              key={`empty-${index}`} 
              style={{ flex: '1 0 21%', margin: '0 8px' }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default TagCloud;
