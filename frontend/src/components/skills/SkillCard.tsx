import React from 'react';
import { Card, Tag, Space, Button, Typography, Avatar, Tooltip, Dropdown, Menu } from 'antd';
import { UserOutlined, DownloadOutlined, EyeOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { Skill, exportSkill } from '../../services/skills';

const { Title, Paragraph, Text } = Typography;

const TOOL_COLORS: Record<string, string> = {
  cursor: 'purple',
  claude: 'orange',
  copilot: 'blue',
  chatgpt: 'green',
};

interface SkillCardProps {
  skill: Skill;
  currentUserId?: string;
  onDelete?: (id: string) => void;
}

const SkillCard: React.FC<SkillCardProps> = ({ skill, currentUserId, onDelete }) => {
  const { id, title, description, tags, target_tools, author, skill_prompts, updated_at } = skill;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const exportMenu = (
    <Menu>
      <Menu.Item key="cursor" onClick={() => exportSkill(id, 'cursor')}>导出为 .cursorrules</Menu.Item>
      <Menu.Item key="claude" onClick={() => exportSkill(id, 'claude')}>导出为 CLAUDE.md</Menu.Item>
      <Menu.Item key="copilot" onClick={() => exportSkill(id, 'copilot')}>导出为 copilot-instructions.md</Menu.Item>
      <Menu.Item key="markdown" onClick={() => exportSkill(id, 'markdown')}>导出为 Markdown</Menu.Item>
    </Menu>
  );

  return (
    <Card
      hoverable
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      title={
        <Link href={`/skills/${id}`}>
          <a>
            <Title level={4} style={{ fontSize: '16px', marginBottom: 0 }} ellipsis={{ rows: 1 }}>
              {title}
            </Title>
          </a>
        </Link>
      }
      extra={
        <Space>
          <Avatar icon={<UserOutlined />} size="small" />
          <Text type="secondary" style={{ fontSize: '13px' }}>
            {author?.username || '匿名'}
          </Text>
        </Space>
      }
      bodyStyle={{ padding: '12px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ marginBottom: '8px', minHeight: '22px', overflow: 'hidden' }}>
        <Space size={[0, 4]} wrap>
          {target_tools && target_tools.map(tool => (
            <Tag key={tool} color={TOOL_COLORS[tool] || 'default'} style={{ fontSize: '11px' }}>
              {tool}
            </Tag>
          ))}
        </Space>
      </div>

      <div style={{ height: '60px', overflow: 'hidden', marginBottom: '10px' }}>
        <Paragraph
          type="secondary"
          style={{ fontSize: '13px', margin: 0 }}
          ellipsis={{ rows: 3 }}
        >
          {description || '暂无描述'}
        </Paragraph>
      </div>

      <div style={{ marginBottom: '10px', minHeight: '22px', overflow: 'hidden' }}>
        <Space size={[0, 4]} wrap>
          {tags && tags.map((tag, i) => (
            <Tag key={i} color="blue" style={{ fontSize: '11px' }}>{tag}</Tag>
          ))}
        </Space>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid #f0f0f0' }}>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          {skill_prompts?.length || 0} 个 Prompt · {formatDate(updated_at)}
        </Text>

        <Space size={4}>
          <Tooltip title="查看详情">
            <Link href={`/skills/${id}`}>
              <Button type="text" icon={<EyeOutlined />} size="small" />
            </Link>
          </Tooltip>

          <Dropdown overlay={exportMenu} trigger={['click']} placement="bottomRight">
            <Tooltip title="导出">
              <Button type="text" icon={<DownloadOutlined />} size="small" />
            </Tooltip>
          </Dropdown>

          {currentUserId === author?.id && (
            <>
              <Tooltip title="编辑">
                <Link href={`/skills/${id}/edit`}>
                  <Button type="text" icon={<EditOutlined />} size="small" />
                </Link>
              </Tooltip>
              {onDelete && (
                <Tooltip title="删除">
                  <Button type="text" danger icon={<DeleteOutlined />} size="small" onClick={() => onDelete(id)} />
                </Tooltip>
              )}
            </>
          )}
        </Space>
      </div>
    </Card>
  );
};

export default SkillCard;
