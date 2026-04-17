import React, { useState, useEffect } from 'react';
import { Typography, Row, Col, Card, Input, message, Modal, Empty, Pagination, Space } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import Link from 'next/link';
import Layout from '../../components/ui/Layout';
import SkillCard from '../../components/skills/SkillCard';
import { getSkills, searchSkills, deleteSkill, Skill } from '../../services/skills';
import { useAuth } from '../../utils/AuthContext';

const { Title, Paragraph } = Typography;
const { confirm } = Modal;

const SkillsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const pageSize = 12;

  useEffect(() => {
    fetchSkills();
  }, [page, searchQuery]);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const result = searchQuery
        ? await searchSkills(searchQuery, [], page, pageSize)
        : await getSkills(page, pageSize);
      setSkills(result.data);
      setTotal(result.total);
    } catch (error) {
      message.error('获取 Skill 列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
  };

  const handleDelete = (id: string) => {
    const skill = skills.find(s => s.id === id);
    if (!skill) return;
    confirm({
      title: '确认删除',
      content: `确定要删除 Skill "${skill.title}" 吗？此操作不可撤销。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteSkill(id);
          message.success('已删除');
          setSkills(skills.filter(s => s.id !== id));
          setTotal(total - 1);
        } catch {
          message.error('删除失败，请稍后重试');
        }
      },
    });
  };

  return (
    <Layout>
      <Card style={{ marginBottom: 20, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <Title level={2} style={{ marginBottom: 8 }}>Skills 广场</Title>
            <Paragraph type="secondary" style={{ margin: 0 }}>
              将多个 Prompt 打包为可复用的 Skill，一键导出到 Cursor、Claude、Copilot 等 AI 工具
            </Paragraph>
          </div>
          {isAuthenticated && (
            <Link href="/skills/create">
              <a>
                <Space style={{ background: '#1890ff', color: 'white', padding: '6px 16px', borderRadius: 4, cursor: 'pointer', fontWeight: 500 }}>
                  <PlusOutlined />
                  创建 Skill
                </Space>
              </a>
            </Link>
          )}
        </div>

        <div style={{ marginTop: 16 }}>
          <Input
            placeholder="搜索 Skill 标题或描述..."
            prefix={<SearchOutlined />}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onPressEnter={handleSearch}
            allowClear
            style={{ maxWidth: 400 }}
          />
        </div>
      </Card>

      <Card
        title={<span style={{ fontWeight: 'bold' }}>全部 Skills ({total})</span>}
        loading={loading}
        style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
      >
        {skills.length === 0 && !loading ? (
          <Empty description="暂无 Skill，快来创建第一个吧！" />
        ) : (
          <>
            <Row gutter={[16, 16]}>
              {skills.map(skill => (
                <Col key={skill.id} xs={24} sm={12} lg={8} xl={6}>
                  <SkillCard
                    skill={skill}
                    currentUserId={user?.id}
                    onDelete={handleDelete}
                  />
                </Col>
              ))}
            </Row>
            <div style={{ marginTop: 24, textAlign: 'right' }}>
              <Pagination
                current={page}
                pageSize={pageSize}
                total={total}
                onChange={setPage}
                showSizeChanger={false}
                showTotal={t => `共 ${t} 个`}
              />
            </div>
          </>
        )}
      </Card>
    </Layout>
  );
};

export default SkillsPage;
