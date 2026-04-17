import React, { useState, useEffect } from 'react';
import { Typography, Card, Tag, Space, Button, Divider, message, Descriptions, Dropdown, Menu, Spin, Modal } from 'antd';
import { DownloadOutlined, EditOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/ui/Layout';
import { getSkillById, deleteSkill, exportSkill, Skill } from '../../services/skills';
import { getPromptById } from '../../services/prompts';
import { useAuth } from '../../utils/AuthContext';

const { Title, Text, Paragraph } = Typography;
const { confirm } = Modal;

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  system: { label: '系统指令', color: 'red' },
  instruction: { label: '规则', color: 'blue' },
  example: { label: '示例', color: 'green' },
};

const TOOL_COLORS: Record<string, string> = {
  cursor: 'purple',
  claude: 'orange',
  copilot: 'blue',
  chatgpt: 'green',
};

const SkillDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [skill, setSkill] = useState<Skill | null>(null);
  const [promptContents, setPromptContents] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || typeof id !== 'string') return;
    const fetchSkill = async () => {
      try {
        setLoading(true);
        const data = await getSkillById(id);
        setSkill(data);
        const contents: Record<string, string> = {};
        await Promise.all(
          data.skill_prompts.map(async sp => {
            try {
              const prompt = await getPromptById(sp.prompt_id);
              contents[sp.prompt_id] = prompt.content;
            } catch {
              contents[sp.prompt_id] = '（无法加载 Prompt 内容）';
            }
          })
        );
        setPromptContents(contents);
      } catch {
        message.error('获取 Skill 详情失败');
      } finally {
        setLoading(false);
      }
    };
    fetchSkill();
  }, [id]);

  const handleDelete = () => {
    if (!skill) return;
    confirm({
      title: '确认删除',
      content: `确定要删除 Skill "${skill.title}" 吗？此操作不可撤销。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteSkill(skill.id);
          message.success('已删除');
          router.push('/skills');
        } catch {
          message.error('删除失败，请稍后重试');
        }
      },
    });
  };

  const exportMenu = (
    <Menu>
      <Menu.Item key="cursor" onClick={() => exportSkill(skill!.id, 'cursor')}>导出为 .cursorrules</Menu.Item>
      <Menu.Item key="claude" onClick={() => exportSkill(skill!.id, 'claude')}>导出为 CLAUDE.md</Menu.Item>
      <Menu.Item key="copilot" onClick={() => exportSkill(skill!.id, 'copilot')}>导出为 copilot-instructions.md</Menu.Item>
      <Menu.Item key="markdown" onClick={() => exportSkill(skill!.id, 'markdown')}>导出为 Markdown</Menu.Item>
    </Menu>
  );

  if (loading) {
    return <Layout><div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div></Layout>;
  }

  if (!skill) {
    return <Layout><Card><Text>Skill 不存在或已被删除</Text></Card></Layout>;
  }

  const isOwner = user?.id === skill.author_id;
  const ordered = [...skill.skill_prompts].sort((a, b) => a.order_index - b.order_index);

  return (
    <Layout>
      <div style={{ marginBottom: 16 }}>
        <Link href="/skills">
          <a style={{ color: '#1890ff', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <ArrowLeftOutlined /> 返回 Skills 广场
          </a>
        </Link>
      </div>

      <Card style={{ marginBottom: 20, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <Title level={2} style={{ marginBottom: 8 }}>{skill.title}</Title>
            {skill.description && (
              <Paragraph type="secondary" style={{ marginBottom: 12 }}>{skill.description}</Paragraph>
            )}
            <Space wrap>
              {skill.target_tools?.map(tool => (
                <Tag key={tool} color={TOOL_COLORS[tool] || 'default'}>{tool}</Tag>
              ))}
              {skill.tags?.map((tag, i) => (
                <Tag key={i} color="blue">{tag}</Tag>
              ))}
            </Space>
          </div>

          <Space>
            <Dropdown overlay={exportMenu} trigger={['click']}>
              <Button type="primary" icon={<DownloadOutlined />}>导出</Button>
            </Dropdown>
            {isOwner && (
              <>
                <Link href={`/skills/${skill.id}/edit`}>
                  <Button icon={<EditOutlined />}>编辑</Button>
                </Link>
                <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>删除</Button>
              </>
            )}
          </Space>
        </div>

        <Divider style={{ margin: '16px 0' }} />

        <Descriptions size="small" column={3}>
          <Descriptions.Item label="作者">{skill.author?.username}</Descriptions.Item>
          <Descriptions.Item label="Prompt 数量">{skill.skill_prompts?.length || 0}</Descriptions.Item>
          <Descriptions.Item label="更新时间">
            {new Date(skill.updated_at).toLocaleDateString('zh-CN')}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card
        title={<span style={{ fontWeight: 'bold' }}>包含的 Prompts</span>}
        style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
      >
        {ordered.map((sp, index) => {
          const roleInfo = ROLE_LABELS[sp.role] || { label: sp.role, color: 'default' };
          return (
            <div key={sp.id} style={{ marginBottom: index < ordered.length - 1 ? 16 : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>#{index + 1}</Text>
                <Tag color={roleInfo.color}>{roleInfo.label}</Tag>
                <Link href={`/prompts/${sp.prompt_id}`}>
                  <a style={{ fontSize: 13, color: '#1890ff' }}>查看原始 Prompt →</a>
                </Link>
              </div>
              <div style={{
                background: '#f6f8fa',
                border: '1px solid #e8e8e8',
                borderRadius: 6,
                padding: '12px 16px',
                fontFamily: 'monospace',
                fontSize: 13,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                maxHeight: 200,
                overflow: 'auto',
              }}>
                {promptContents[sp.prompt_id] || '加载中...'}
              </div>
              {index < ordered.length - 1 && <Divider style={{ margin: '16px 0' }} />}
            </div>
          );
        })}
      </Card>
    </Layout>
  );
};

export default SkillDetailPage;
