import React, { useState, useEffect } from 'react';
import { Modal, Button, Select, Typography, Space, message, Tooltip, Alert } from 'antd';
import { SendOutlined, SettingOutlined, CopyOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { 
  AIPlatform, 
  AlternativeUrl,
  getUserPlatformSettings, 
  getDefaultPlatform, 
  getLastUsedPlatform,
  saveLastUsedPlatform,
  buildPlatformUrl
} from '../../services/aiPlatformService';

const { Option } = Select;
const { Paragraph, Text } = Typography;

interface ApplyToAIModalProps {
  visible: boolean;
  promptId: string;
  promptContent: string;
  onCancel: () => void;
  onApply: (platformId: string) => Promise<void>;
}

const ApplyToAIModal: React.FC<ApplyToAIModalProps> = ({
  visible,
  promptId,
  promptContent,
  onCancel,
  onApply
}) => {
  const [platforms, setPlatforms] = useState<AIPlatform[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<AIPlatform | null>(null);
  const [loading, setLoading] = useState(false);
  
  // 加载平台设置
  useEffect(() => {
    const loadPlatforms = async () => {
      try {
        console.log('%c[ApplyToAIModal] 开始加载平台设置', 'background: #9C27B0; color: white', {
          promptId: promptId,
          对话框可见性: visible
        });
        
        const userPlatforms = await getUserPlatformSettings();
        setPlatforms(userPlatforms);
        console.log('%c[ApplyToAIModal] 已加载平台列表', 'background: #9C27B0; color: white', {
          平台数量: userPlatforms.length,
          平台列表: userPlatforms.map(p => `${p.name}${p.isDefault ? '(默认)' : ''}`)
        });
        
        // 先获取默认平台
        const defaultPlatform = await getDefaultPlatform();
        console.log('%c[ApplyToAIModal] 获取默认平台', 'background: #4CAF50; color: white', {
          平台名称: defaultPlatform.name,
          平台ID: defaultPlatform.id,
          是否标记为默认: !!defaultPlatform.isDefault
        });
        
        // 优先使用默认平台，而不是最近使用的平台
        setSelectedPlatform(defaultPlatform);
        
        // 仍然检查最近使用的平台（仅用于日志记录）
        const lastUsed = getLastUsedPlatform();
        console.log('%c[ApplyToAIModal] 检查最近使用平台', 'background: #9C27B0; color: white', {
          最近使用平台: lastUsed ? lastUsed.name : '无',
          使用默认平台: defaultPlatform.name
        });
      } catch (error) {
        console.error('%c[ApplyToAIModal] 加载AI平台设置失败', 'background: #F44336; color: white', error);
        message.error('加载AI平台设置失败，请稍后重试');
      }
    };
    
    if (visible) {
      loadPlatforms();
    }
  }, [visible, promptId]);
  
  // 处理平台选择
  const handlePlatformChange = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    if (platform) {
      setSelectedPlatform(platform);
    }
  };
  
  // 处理应用提示词
  const handleApply = async () => {
    if (!selectedPlatform) {
      message.error('请选择AI平台');
      return;
    }
    
    setLoading(true);
    try {
      // 保存最近使用的平台
      saveLastUsedPlatform(selectedPlatform);
      
      // 调用父组件的onApply方法
      await onApply(selectedPlatform.id);
      
      // 对于不支持直接URL参数的平台，先复制提示词
      if (!selectedPlatform.supportsDirect) {
        await navigator.clipboard.writeText(promptContent);
      }
      
      // 构建URL并打开
      const url = buildPlatformUrl(selectedPlatform, promptContent);
      window.open(url, '_blank');
      
      // 根据平台类型显示不同的成功消息
      if (selectedPlatform.regionRestricted) {
        message.success(`已复制提示词并尝试打开${selectedPlatform.name}，如无法访问请尝试替代方式！`);
      } else if (selectedPlatform.supportsDirect) {
        message.success(`已成功应用到${selectedPlatform.name}！`);
      } else {
        message.success(`已复制提示词并打开${selectedPlatform.name}，请在对话框中粘贴！`);
      }
    } catch (error) {
      console.error('应用提示词失败:', error);
      message.error('应用失败，请稍后重试');
    } finally {
      setLoading(false);
      onCancel();
    }
  };
  
  // 复制提示词
  const handleCopy = async () => {
    console.log('%c[ApplyToAIModal] 开始复制提示词', 'background: #9C27B0; color: white', {
      contentLength: promptContent?.length || 0
    });
    
    try {
      // 尝试使用现代 Clipboard API
      let copySuccess = false;
      
      // 方法1: 使用 navigator.clipboard.writeText API (现代浏览器)
      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(promptContent);
          copySuccess = true;
          console.log('%c[ApplyToAIModal] 使用 Clipboard API 复制成功', 'background: #4CAF50; color: white');
        } catch (clipboardError) {
          console.warn('%c[ApplyToAIModal] Clipboard API 复制失败，尝试备用方法', 'background: #FF9800; color: white', {
            error: clipboardError
          });
          // 继续尝试备用方法
        }
      } else {
        console.warn('%c[ApplyToAIModal] Clipboard API 不可用，使用备用方法', 'background: #FF9800; color: white');
      }
      
      // 方法2: 使用 document.execCommand('copy') (兼容旧浏览器)
      if (!copySuccess && typeof document !== 'undefined') {
        try {
          // 创建临时文本区域
          const textArea = document.createElement('textarea');
          textArea.value = promptContent;
          
          // 确保文本区域在视口之外
          textArea.style.position = 'fixed';
          textArea.style.top = '-9999px';
          textArea.style.left = '-9999px';
          textArea.style.opacity = '0';
          
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          
          // 执行复制命令
          const successful = document.execCommand('copy');
          document.body.removeChild(textArea);
          
          if (successful) {
            copySuccess = true;
            console.log('%c[ApplyToAIModal] 使用 execCommand 复制成功', 'background: #4CAF50; color: white');
          } else {
            console.error('%c[ApplyToAIModal] execCommand 复制失败', 'background: #F44336; color: white');
          }
        } catch (execCommandError) {
          console.error('%c[ApplyToAIModal] execCommand 复制出错', 'background: #F44336; color: white', {
            error: execCommandError
          });
        }
      }
      
      // 处理复制结果
      if (copySuccess) {
        message.success('提示词已复制到剪贴板！');
        console.log('%c[ApplyToAIModal] 复制内容到剪贴板成功', 'background: #4CAF50; color: white');
      } else {
        throw new Error('所有复制方法均失败');
      }
    } catch (error) {
      console.error('%c[ApplyToAIModal] 复制内容失败', 'background: #F44336; color: white', { 
        error: error 
      });
      message.error('复制失败，请手动复制');
    }
  };
  
  // 根据平台类型生成按钮文本
  const getApplyButtonText = () => {
    if (!selectedPlatform) return '应用到AI平台';
    
    return selectedPlatform.supportsDirect
      ? `应用到${selectedPlatform.name}`
      : `复制并打开${selectedPlatform.name}`;
  };
  
  return (
    <Modal
      title="应用提示词到AI平台"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="copy" onClick={handleCopy} icon={<CopyOutlined />}>
          仅复制提示词
        </Button>,
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button 
          key="apply" 
          type="primary" 
          icon={<SendOutlined />}
          loading={loading} 
          onClick={handleApply}
        >
          {getApplyButtonText()}
        </Button>
      ]}
      width={600}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <div style={{ marginBottom: 16 }}>
          <Text strong>选择AI平台：</Text>
          <Select
            style={{ width: 200, marginLeft: 8 }}
            value={selectedPlatform?.id}
            onChange={handlePlatformChange}
          >
            {platforms.map(platform => (
              <Option key={platform.id} value={platform.id}>
                {platform.name} {platform.isDefault && '(默认)'}
              </Option>
            ))}
          </Select>
          <Tooltip title="管理AI平台设置">
            <Button 
              type="text" 
              icon={<SettingOutlined />} 
              style={{ marginLeft: 8 }}
              onClick={() => {
                message.info('平台设置功能将在下一版本提供');
                // 这里可以添加导航到设置页面的逻辑
              }}
            />
          </Tooltip>
        </div>
        
        {/* 平台使用提示 */}
        {selectedPlatform && !selectedPlatform.supportsDirect && (
          <Alert
            message="使用提示"
            description={
              <span>
                选中的{selectedPlatform.name}不支持直接通过URL参数应用提示词。
                点击“复制并打开”按钮后，系统会自动复制提示词并打开{selectedPlatform.name}网站，
                请在打开的页面中手动粘贴提示词。
              </span>
            }
            type="info"
            showIcon
            icon={<InfoCircleOutlined />}
            style={{ marginBottom: 16 }}
          />
        )}
        
        {/* 地区限制提示 */}
        {selectedPlatform && selectedPlatform.regionRestricted && (
          <Alert
            message="地区限制提示"
            description={
              <div>
                <p>选中的{selectedPlatform.name}可能在您的地区无法直接访问。您可以尝试以下替代方式：</p>
                {selectedPlatform.alternativeUrls && selectedPlatform.alternativeUrls.length > 0 ? (
                  <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
                    {selectedPlatform.alternativeUrls.map((alt, index) => (
                      <li key={index}>
                        <a href={alt.url} target="_blank" rel="noopener noreferrer">
                          {alt.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            }
            type="warning"
            showIcon
            icon={<InfoCircleOutlined />}
            style={{ marginBottom: 16 }}
          />
        )}
        
        <div>
          <Text strong>提示词内容：</Text>
          <div style={{ 
            maxHeight: '200px', 
            overflow: 'auto', 
            border: '1px solid #d9d9d9',
            borderRadius: '4px',
            padding: '8px',
            backgroundColor: '#f5f5f5',
            marginTop: 8
          }}>
            <Paragraph>{promptContent}</Paragraph>
          </div>
        </div>
      </Space>
    </Modal>
  );
};

export default ApplyToAIModal;

