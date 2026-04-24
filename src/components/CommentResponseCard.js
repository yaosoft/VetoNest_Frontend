// components/CommentResponseCard.js
import React, { useContext } from 'react';
import { Avatar, Button, Tooltip, message, Modal, Dropdown } from 'antd';
import { UserOutlined, LikeOutlined, LikeFilled, DeleteOutlined, FlagOutlined, MoreOutlined } from '@ant-design/icons';
import { AuthContext } from '../context/AuthProvider';
import { SiteContext } from '../context/site';

const CommentResponseCard = ({ reply, onDelete, onUseful, onReport }) => {
    const { profileId } = useContext(AuthContext);
    const { base_url, getAContent } = useContext(SiteContext);
    
    const isOwner = reply.profileUserId === profileId;
    
    const userImageUrl = reply.userPicture 
        ? `${base_url}uploads/files/profile/${reply.userPicture}`
        : null;
    
    const handleReport = () => {
        Modal.confirm({
            title: getAContent('cmp_vetonest.com_ReportResponse_Title') || 'Report Response',
            content: (
                <Input.TextArea 
                    rows={3} 
                    placeholder={getAContent('cmp_vetonest.com_ReportReason_Placeholder') || 'Please explain why this response is inappropriate...'}
                    id="reportReason"
                />
            ),
            onOk: async () => {
                const reason = document.getElementById('reportReason').value;
                if (!reason) {
                    message.warning('Please enter a reason');
                    return;
                }
                await onReport(reply.id, reason, 'response');
                message.success('Response reported');
            }
        });
    };
    
    const handleDelete = () => {
        Modal.confirm({
            title: 'Delete Response',
            content: 'Are you sure you want to delete this response?',
            onOk: async () => {
                await onDelete(reply.id, 'response');
                message.success('Response deleted');
            }
        });
    };
    
    const menuItems = [
        {
            key: 'report',
            icon: <FlagOutlined />,
            label: getAContent('cmp_vetonest.com_Report_Btn') || 'Report',
            onClick: handleReport
        }
    ];
    
    if (isOwner) {
        menuItems.push({
            key: 'delete',
            icon: <DeleteOutlined />,
            label: getAContent('cmp_vetonest.com_Delete_Btn') || 'Delete',
            danger: true,
            onClick: handleDelete
        });
    }
    
    return (
        <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', gap: 10, flex: 1 }}>
                <Avatar 
                    src={userImageUrl}
                    icon={!userImageUrl && <UserOutlined />}
                    size="small"
                />
                <div style={{ flex: 1 }}>
                    <div>
                        <span style={{ fontWeight: 'bold', fontSize: 13 }}>{reply.userName}</span>
                        <span style={{ marginLeft: 10, color: '#888', fontSize: 11 }}>
                            {reply.dateCreated}
                        </span>
                    </div>
                    <p style={{ margin: '4px 0 0', fontSize: 13, color: '#555' }}>
                        {reply.commentResponseText}
                    </p>
                    <div style={{ marginTop: 4 }}>
                        <Tooltip title="Mark as useful">
                            <Button 
                                type="text" 
                                size="small"
                                icon={reply.isUseful ? <LikeFilled style={{ color: '#1890ff' }} /> : <LikeOutlined />}
                                onClick={() => onUseful(reply.id, 'response')}
                                style={{ padding: '0 4px', height: 'auto' }}
                            >
                                {reply.usefulCount > 0 && reply.usefulCount}
                            </Button>
                        </Tooltip>
                    </div>
                </div>
            </div>
            <Dropdown menu={{ items: menuItems }} trigger={['click']}>
                <Button type="text" icon={<MoreOutlined />} size="small" style={{ padding: '0 4px', height: 'auto' }} />
            </Dropdown>
        </div>
    );
};

export default CommentResponseCard;