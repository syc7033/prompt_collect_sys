import React, { useState, useEffect } from 'react';
import { Typography, Card, Form, Input, Select, Switch, Button, message, Divider, Empty } from 'antd';
import { DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/ui/Layout';
import { createSkill, SkillCreate } from '../../services/skills';
import { getPrompts, Prompt } from '../../services/prompts';
import { useAuth } from '../../utils/AuthContext';
import LoginRequiredModal from '../../components/auth/LoginRequiredModal';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const TOOL_OPTIONS = ['cursor', 'claude', 'copilot', 'chatgpt'];
const ROLE_OPTIONS = [
  { value: 'system', label: '系统指令' },
  { value: 'instruction', label: '规则' },
  { value: 'example', label: '示例' },
];

interface SkillPromptItem {
  prompt_id: string;
  order_index: number;
  role: string;
  promptTitle?: string;
}

const CreateSkillPage: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [allPrompts, setAllPrompts] = useState<Prompt[]>([]);
  const [promptsLoading, setPromptsLoading] = useState(false);
  const [selectedPrompts, setSelectedPrompts] = useState<SkillPromptItem[]>([]);

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        setPromptsLoading(true);
        const result = await getPrompts(1, 100);
        setAllPrompts(result.data);
      } catch {
        message.error('获取 Prompt 列表失败');
      } finally {
        setPromptsLoading(false);
      }
    };
    fetchPrompts();
  }, []);

  const handleAddPrompt = (promptId: string) => {
    if (selectedPrompts.find(sp => sp.prompt_id === promptId)) {
      message.warning('该 Prompt 已添加');
      return;
    }
    const prompt = allPrompts.find(p => p.id === promptId);
    setSelectedPrompts(prev => [
      ...prev,
      {
        prompt_id: promptId,
        order_index: prev.length,
        role: 'instruction',
        promptTitle: prompt?.title,
      },
    ]);
  };

  const handleRemovePrompt = (promptId: string) => {
    setSelectedPrompts(prev =>
      prev.filter(sp => sp.prompt_id !== promptId).map((sp, i) => ({ ...sp, order_index: i }))
    );
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...selectedPrompts];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    setSelectedPrompts(updated.map((sp, i) => ({ ...sp, order_index: i })));
  };

  const handleMoveDown = (index: number) => {
    if (index === selectedPrompts.length - 1) return;
    const updated = [...selectedPrompts];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    setSelectedPrompts(updated.map((sp, i) => ({ ...sp, order_index: i })));
  };

  const handleRoleChange = (promptId: string, role: string) => {
    setSelectedPrompts(prev =>
      prev.map(sp => sp.prompt_id === promptId ? { ...sp, role } : sp)
    );
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    if (selectedPrompts.length === 0) {
      message.warning('请至少添加一个 Prompt');
      return;
    }
    try {
      const values = await form.validateFields();
      setLoading(true);
      const skillData: SkillCreate = {
        title: values.title,
        description: values.description,
        tags: values.tags || [],
        target_tools: values.target_tools || [],
        is_public: values.is_public ?? true,
        skill_prompts: selectedPrompts.map(sp => ({
          prompt_id: sp.prompt_id,
          order_index: sp.order_index,
          role: sp.role,
        })),
      };
      const newSkill = await createSkill(skillData);
      message.success('Skill 创建成功！');
      router.push(`/skills/${newSkill.id}`);
    } catch (error: any) {
      if (error?.errorFields) return;
      message.error('创建失败，请稍后重试');
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div style={{ marginBottom: 16 }}>
        <Link href="/skills">
          <a style={{ color: '#1890ff' }}>← 返回 Skills 广场</a>
        </Link>
      </div>

      <Card style={{ marginBottom: 20, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Title level={2} style={{ marginBottom: 4 }}>创建 Skill</Title>
        <Text type="secondary">将多个 Prompt 组合成可复用的 Skill，导出为 AI 工具配置文件</Text>
      </Card>

      <Card style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="Skill 名称" rules={[{ required: true, message: '请输入 Skill 名称' }]}>
            <Input placeholder="例如：Python 代码审查助手" maxLength={100} showCount />
          </Form.Item>

          <Form.Item name="description" label="描述">
            <TextArea placeholder="描述这个 Skill 的用途和适用场景..." rows={3} maxLength={500} showCount />
          </Form.Item>

          <Form.Item name="target_tools" label="适用工具">
            <Select mode="multiple" placeholder="选择适用的 AI 工具">
              {TOOL_OPTIONS.map(tool => (
                <Option key={tool} value={tool}>{tool}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="tags" label="标签">
            <Select mode="tags" placeholder="输入标签后按回车添加" tokenSeparators={[',']} />
          </Form.Item>

          <Form.Item name="is_public" label="公开" valuePropName="checked" initialValue={true}>
            <Switch checkedChildren="公开" unCheckedChildren="私有" />
          </Form.Item>
        </Form>

        <Divider orientation="left">选择并排序 Prompts</Divider>

        <div style={{ marginBottom: 16 }}>
          <Select<string>
            showSearch
            placeholder="搜索并添加 Prompt..."
            style={{ width: '100%', maxWidth: 500 }}
            loading={promptsLoading}
            filterOption={(input, option) =>
              String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())
            }
            onSelect={handleAddPrompt}
            value={undefined}
          >
            {allPrompts
              .filter(p => !selectedPrompts.find(sp => sp.prompt_id === p.id))
              .map(p => (
                <Option key={p.id} value={p.id}>{p.title}</Option>
              ))}
          </Select>
        </div>

        {selectedPrompts.length === 0 ? (
          <Empty description="还没有添加 Prompt，请从上方选择" style={{ padding: '20px 0' }} />
        ) : (
          <div>
            {selectedPrompts.map((sp, index) => (
              <div
                key={sp.prompt_id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 12px',
                  background: '#fafafa',
                  border: '1px solid #e8e8e8',
                  borderRadius: 6,
                  marginBottom: 8,
                }}
              >
                <Text type="secondary" style={{ fontSize: 12, width: 20, textAlign: 'center' }}>
                  {index + 1}
                </Text>
                <Text style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {sp.promptTitle}
                </Text>
                <Select
                  value={sp.role}
                  size="small"
                  style={{ width: 100 }}
                  onChange={role => handleRoleChange(sp.prompt_id, role)}
                >
                  {ROLE_OPTIONS.map(r => (
                    <Option key={r.value} value={r.value}>{r.label}</Option>
                  ))}
                </Select>
                <Button type="text" size="small" icon={<ArrowUpOutlined />} onClick={() => handleMoveUp(index)} disabled={index === 0} />
                <Button type="text" size="small" icon={<ArrowDownOutlined />} onClick={() => handleMoveDown(index)} disabled={index === selectedPrompts.length - 1} />
                <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => handleRemovePrompt(sp.prompt_id)} />
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Link href="/skills">
            <Button>取消</Button>
          </Link>
          <Button type="primary" loading={loading} onClick={handleSubmit}>
            创建 Skill
          </Button>
        </div>
      </Card>

      <LoginRequiredModal
        visible={showLoginModal}
        onCancel={() => setShowLoginModal(false)}
        onLogin={() => setShowLoginModal(false)}
        title="需要登录"
        message="创建 Skill 需要登录账号，请先登录。"
        actionName="去登录"
      />
    </Layout>
  );
};

export default CreateSkillPage;
