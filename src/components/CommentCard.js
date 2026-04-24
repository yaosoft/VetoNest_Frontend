import React, { useState, useContext } from 'react';
import { Card, Avatar, Rate, Button, Modal, Input, message, Dropdown, Space, Tooltip } from 'antd';
import { 
    UserOutlined, 
    LikeOutlined, 
    LikeFilled, 
    DeleteOutlined, 
    FlagOutlined, 
    MessageOutlined,
    MoreOutlined
} from '@ant-design/icons';
import { AuthContext } from '../context/AuthProvider';
import { SiteContext } from '../context/site';

const { TextArea } = Input;

const CommentCard = ({ 
    comment, 
    onDelete, 
    onUseful, 
    onReport, 
    onReply,
    isOwner = false,
    replies = []
}) => {
    const { profileId } = useContext(AuthContext);
    const { base_url, getAContent, siteLocale } = useContext(SiteContext);
    
    const [showReply, setShowReply] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [submittingReply, setSubmittingReply] = useState(false);
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [submittingReport, setSubmittingReport] = useState(false);
    
    const formatDate = (dateData) => {
        if (!dateData) return '—';
        let date;
        if (typeof dateData === 'object' && dateData.date) {
            date = new Date(dateData.date);
        } else {
            date = new Date(dateData);
        }
        if (isNaN(date.getTime())) return '—';
        return date.toLocaleDateString(siteLocale || 'en-GB', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };
    
    const userImageUrl = comment.userPicture 
        ? `${base_url}uploads/files/profile/${comment.userPicture}`
        : null;
    
    const handleReplySubmit = async () => {
        if (!replyText.trim()) {
            message.warning(getAContent('cmp_vetonest.com_EnterReplyMessage') || 'Please enter a reply');
            return;
        }
        
        setSubmittingReply(true);
        try {
            await onReply(comment.id, replyText);
            setReplyText('');
            setShowReply(false);
            message.success(getAContent('cmp_vetonest.com_ReplyAdded') || 'Reply added successfully');
        } catch (error) {
            console.error('Error posting reply:', error);
            message.error(getAContent('cmp_vetonest.com_ErrorAddingReply') || 'Error adding reply');
        } finally {
            setSubmittingReply(false);
        }
    };
    
    const handleReportSubmit = async () => {
        if (!reportReason.trim()) {
            message.warning(getAContent('cmp_vetonest.com_EnterReportReason') || 'Please enter a reason');
            return;
        }
        
        setSubmittingReport(true);
        try {
            await onReport(comment.id, reportReason);
            setReportModalOpen(false);
            setReportReason('');
            message.success(getAContent('cmp_vetonest.com_CommentReported') || 'Comment reported successfully');
        } catch (error) {
            console.error('Error reporting comment:', error);
            message.error(getAContent('cmp_vetonest.com_ErrorReportingComment') || 'Error reporting comment');
        } finally {
            setSubmittingReport(false);
        }
    };
    
    const handleDeleteClick = () => {
        Modal.confirm({
            title: getAContent('cmp_vetonest.com_DeleteComment') || 'Delete Comment',
            content: getAContent('cmp_vetonest.com_ConfirmDeleteComment') || 'Are you sure you want to delete this comment?',
            okText: getAContent('cmp_vetonest.com_Delete_Btn') || 'Delete',
            cancelText: getAContent('cmp_vetonest.com_Cancel_Btn') || 'Cancel',
            okButtonProps: { danger: true },
            onOk: async () => {
                try {
                    await onDelete(comment.id);
                    message.success(getAContent('cmp_vetonest.com_CommentDeleted') || 'Comment deleted');
                } catch (error) {
                    console.error('Error deleting comment:', error);
                    message.error(getAContent('cmp_vetonest.com_ErrorDeletingComment') || 'Error deleting comment');
                }
            }
        });
    };
    
    const menuItems = [
        {
            key: 'reply',
            icon: <MessageOutlined />,
            label: getAContent('cmp_vetonest.com_Reply_Btn') || 'Reply',
            onClick: () => setShowReply(!showReply)
        },
        {
            key: 'report',
            icon: <FlagOutlined />,
            label: getAContent('cmp_vetonest.com_Report_Btn') || 'Report',
            onClick: () => setReportModalOpen(true)
        }
    ];
    
    if (isOwner) {
        menuItems.push({
            key: 'delete',
            icon: <DeleteOutlined />,
            label: getAContent('cmp_vetonest.com_Delete_Btn') || 'Delete',
            danger: true,
            onClick: handleDeleteClick
        });
    }
    
    return (
        <>
            <Card 
                size="small" 
                style={{ marginBottom: 16 }}
                bodyStyle={{ padding: '12px 16px' }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: 12, flex: 1 }}>
                        <Avatar 
                            src={userImageUrl}
                            icon={!userImageUrl && <UserOutlined />}
                            size="large"
                        />
                        <div style={{ flex: 1 }}>
                            <div>
                                <span style={{ fontWeight: 'bold', fontSize: 15 }}>
                                    {comment.userName}
                                </span>
                                {comment.rating && (
                                    <span style={{ marginLeft: 10 }}>
                                        <Rate disabled value={comment.rating} style={{ fontSize: 12 }} />
                                    </span>
                                )}
                                <span style={{ marginLeft: 10, color: '#888', fontSize: 12 }}>
                                    {getAContent('cmp_vetonest.com_ConsultationOn_Txt') || 'Consultation on'} {formatDate(comment.consultationDate)}
                                </span>
                            </div>
                            <p style={{ margin: '8px 0', fontSize: 14, color: '#333' }}>
                                {comment.commentText}
                            </p>
                            <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                                <Tooltip title={getAContent('cmp_vetonest.com_MarkUseful_Tooltip') || 'Mark as useful'}>
                                    <Button 
                                        type="text" 
                                        size="small"
                                        icon={comment.isUseful ? <LikeFilled style={{ color: '#1890ff' }} /> : <LikeOutlined />}
                                        onClick={() => onUseful(comment.id)}
                                    >
                                        {comment.usefulCount > 0 && comment.usefulCount}
                                    </Button>
                                </Tooltip>
                                <span style={{ color: '#bbb', fontSize: 12 }}>
                                    {getAContent('cmp_vetonest.com_PostedOn_Txt') || 'Posted on'} {formatDate(comment.dateCreated)}
                                </span>
                            </div>
                            
                            {/* Replies section */}
                            {replies && replies.length > 0 && (
                                <div style={{ marginTop: 16, paddingLeft: 40, borderLeft: '2px solid #f0f0f0' }}>
                                    {replies.map(reply => (
                                        <div key={reply.id} style={{ marginBottom: 12, display: 'flex', gap: 10 }}>
                                            <Avatar 
                                                src={reply.userPicture ? `${base_url}uploads/files/profile/${reply.userPicture}` : null}
                                                icon={!reply.userPicture && <UserOutlined />}
                                                size="small"
                                            />
                                            <div style={{ flex: 1 }}>
                                                <div>
                                                    <span style={{ fontWeight: 'bold', fontSize: 13 }}>{reply.userName}</span>
                                                    <span style={{ marginLeft: 10, color: '#888', fontSize: 11 }}>
                                                        {formatDate(reply.dateCreated)}
                                                    </span>
                                                </div>
                                                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#555' }}>
                                                    {reply.commentResponseText}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {/* Reply form */}
                            {showReply && (
                                <div style={{ marginTop: 16 }}>
                                    <TextArea
                                        rows={3}
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder={getAContent('cmp_vetonest.com_WriteReply_Placeholder') || 'Write your reply...'}
                                    />
                                    <div style={{ marginTop: 8, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                        <Button size="small" onClick={() => setShowReply(false)}>
                                            {getAContent('cmp_vetonest.com_Cancel_Btn') || 'Cancel'}
                                        </Button>
                                        <Button 
                                            size="small" 
                                            type="primary" 
                                            loading={submittingReply}
                                            onClick={handleReplySubmit}
                                        >
                                            {getAContent('cmp_vetonest.com_Submit_Btn') || 'Submit'}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <Dropdown menu={{ items: menuItems }} trigger={['click']}>
                        <Button type="text" icon={<MoreOutlined />} size="small" />
                    </Dropdown>
                </div>
            </Card>
            
            {/* Report Modal */}
            <Modal
                title={getAContent('cmp_vetonest.com_ReportComment_Title') || 'Report Comment'}
                open={reportModalOpen}
                onOk={handleReportSubmit}
                onCancel={() => {
                    setReportModalOpen(false);
                    setReportReason('');
                }}
                confirmLoading={submittingReport}
                okText={getAContent('cmp_vetonest.com_Submit_Btn') || 'Submit'}
                cancelText={getAContent('cmp_vetonest.com_Cancel_Btn') || 'Cancel'}
            >
                <TextArea
                    rows={4}
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    placeholder={getAContent('cmp_vetonest.com_ReportReason_Placeholder') || 'Please explain why this comment is inappropriate...'}
                />
            </Modal>
        </>
    );
};

export default CommentCard;