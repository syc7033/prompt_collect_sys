import React, { useEffect, useState } from 'react';
import { Modal, Radio, Button, Typography, Space } from 'antd';
import { AI_PLATFORMS, AIPlatform, getDefaultPlatform, savePreferredPlatform } from '../../utils/aiPlatforms';

const { Text } = Typography;

interface PlatformSelectModalProps {
  visible: boolean;
  prompt: string;
  preview?: string; // 提示词预览
  onCancel: () => void;
  onApply: (platformUrl: string) => void;
}

const PlatformSelectModal: React.FC<PlatformSelectModalProps> = ({
  visible,
  prompt,
  preview,
  onCancel,
  onApply
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<AIPlatform>(getDefaultPlatform());
  const [rememberChoice, setRememberChoice] = useState(false);
  
  // 当对话框打开时，重新获取默认平台
  useEffect(() => {
    if (visible) {
      setSelectedPlatform(getDefaultPlatform());
    }
  }, [visible]);
  
  // 处理平台选择
  const handlePlatformChange = (e: any) => {
    const platformId = e.target.value;
    const platform = AI_PLATFORMS.find(p => p.id === platformId);
    if (platform) {
      setSelectedPlatform(platform);
    }
  };
  
  // 处理确认应用
  const handleConfirm = () => {
    if (rememberChoice) {
      savePreferredPlatform(selectedPlatform.id);
    }
    
    const platformUrl = selectedPlatform.buildUrl(prompt);
    onApply(platformUrl);
  };
  
  // 生成预览文本（最多显示100个字符）
  const getPreviewText = () => {
    if (!preview) return '';
    
    return preview.length > 100 
      ? `${preview.slice(0, 100)}...` 
      : preview;
  };
  
  return (
    <Modal
      title="选择AI平台应用提示词"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          取消
        </Button>,
        <Button key="submit" type="primary" onClick={handleConfirm}>
          确认应用
        </Button>
      ]}
    >
      <div style={{ marginBottom: 16 }}>
        <Text strong>请选择要应用提示词的AI平台：</Text>
        
        <div style={{ marginTop: 16 }}>
          <Radio.Group 
            value={selectedPlatform.id} 
            onChange={handlePlatformChange}
            style={{ width: '100%' }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              {AI_PLATFORMS.map(platform => (
                <Radio key={platform.id} value={platform.id}>
                  {platform.name}
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        </div>
      </div>
      
      {preview && (
        <div style={{ marginTop: 16 }}>
          <Text strong>提示词预览：</Text>
          <div 
            style={{ 
              backgroundColor: '#f5f5f5', 
              padding: 8, 
              borderRadius: 4,
              marginTop: 8,
              maxHeight: 100,
              overflow: 'auto'
            }}
          >
            {getPreviewText()}
          </div>
        </div>
      )}
      
      <div style={{ marginTop: 16 }}>
        <Radio 
          checked={rememberChoice}
          onChange={(e) => setRememberChoice(e.target.checked)}
        >
          记住我的选择
        </Radio>
      </div>
    </Modal>
  );
};

export default PlatformSelectModal;
