// src/components/AccountStatusCard.js
import React, { useContext } from 'react';
import { Button } from 'antd';
import { 
    CheckCircleOutlined, 
    CloseCircleOutlined, 
    ExclamationCircleOutlined,
    PlayCircleOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import { SiteContext } from '../context/site';

const AccountStatusCard = ({ status, reason, onEnable, loading = false, disableButton = false }) => {
    const { getAContent } = useContext(SiteContext);
    
    const getStatusConfig = () => {
        switch(status) {
            case 'active':
                return {
                    color: '#52c41a',
                    bgColor: '#f6ffed',
                    borderColor: '#b7eb8f',
                    text: getAContent('cmp_vetonest.com_Active_Status', 'Actif'),
                    message: getAContent('cmp_vetonest.com_AccountActive_Message', 'Votre compte est actif. Vous recevez des demandes de consultation et apparaissez dans les recherches.')
                };
            case 'disabled':
                return {
                    color: '#ff4d4f',
                    bgColor: '#fff2f0',
                    borderColor: '#ffccc7',
                    text: getAContent('cmp_vetonest.com_Disabled_Status', 'Désactivé'),
                    message: getAContent('cmp_vetonest.com_AccountDisabled_Message', 'Votre compte est actuellement désactivé. Vous n\'apparaissez pas dans les recherches et ne recevez pas de nouvelles demandes.')
                };
            case 'vacation':
                return {
                    color: '#faad14',
                    bgColor: '#fff7e6',
                    borderColor: '#ffe58f',
                    text: getAContent('cmp_vetonest.com_Vacation_Status', 'Vacances'),
                    message: getAContent('cmp_vetonest.com_AccountVacation_Message', 'Vous êtes en mode vacances. Vous n\'apparaissez pas dans les recherches.')
                };
            default:
                return {
                    color: '#888',
                    bgColor: '#f5f5f5',
                    borderColor: '#d9d9d9',
                    text: getAContent('cmp_vetonest.com_Unknown_Status', 'Inconnu'),
                    message: ''
                };
        }
    };
    
    const config = getStatusConfig();
    
    return (
        <div className="account-status-card" style={{
            backgroundColor: config.bgColor,
            borderRadius: '12px',
            border: `1px solid ${config.borderColor}`,
            padding: '16px 20px',
            marginBottom: '24px',
            transition: 'all 0.3s ease',
            width: '100%'
        }}>
            {/* Status label */}
            <div style={{ marginBottom: '4px' }}>
                <strong style={{ fontSize: '15px' }}>
                    {getAContent('cmp_vetonest.com_AccountStatus_Label', 'Statut du compte')}
                </strong>
            </div>
            
            {/* Status value */}
            <div style={{ 
                color: config.color,
                fontWeight: 600,
                fontSize: '16px',
                marginBottom: '16px'
            }}>
                {config.text}
            </div>
            
            {/* Status message - removed (no longer needed as per request) */}
            
            {/* Reason section - with separator line above */}
            {reason && (
                <div style={{ 
                    marginTop: '12px',
                    paddingTop: '12px',
                    borderTop: `1px solid ${config.borderColor}`
                }}>
                    <div style={{ 
                        fontWeight: 600, 
                        fontSize: '13px',
                        marginBottom: '4px',
                        color: '#333'
                    }}>
                        {getAContent('cmp_vetonest.com_Reason_Label', 'Raison')}
                    </div>
                    <div style={{ 
                        color: '#555',
                        fontSize: '13px',
                        lineHeight: 1.4
                    }}>
                        {reason}
                    </div>
                </div>
            )}
            
            {/* Text link instead of button */}
            {status !== 'active' && onEnable && (
                <div style={{ marginTop: '16px' }}>
                    <a 
                        onClick={!disableButton ? onEnable : undefined}
                        style={{ 
                            color: disableButton ? '#ccc' : '#1890ff',
                            cursor: disableButton ? 'not-allowed' : 'pointer',
                            textDecoration: 'underline',
                            fontSize: '13px',
                            fontWeight: 500
                        }}
                    >
                        {getAContent('cmp_vetonest.com_Reactivate_Link', 'Réactiver mon compte')}
                    </a>
                </div>
            )}
        </div>
    );
};

export default AccountStatusCard;