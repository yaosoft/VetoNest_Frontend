// src/components/VerificationStatusBadge.js
import React, { useContext, useEffect, useState } from 'react';
import { Tag, Tooltip } from 'antd';
import { 
    CheckCircleOutlined, 
    ClockCircleOutlined, 
    CloseCircleOutlined, 
    ExclamationCircleOutlined
} from '@ant-design/icons';
import { SiteContext } from '../context/site';

const VerificationStatusBadge = ({ status, showTooltip = true, showIcon = true, size = 'default' }) => {
    const { getAContent } = useContext(SiteContext);
    const [translatedText, setTranslatedText] = useState('');
    const [tooltipText, setTooltipText] = useState('');

    const statusConfig = {
        verified: {
            color: 'success',
            icon: <CheckCircleOutlined />,
            textKey: 'cmp_vetonest.com_verification_verified',
            tooltipKey: 'cmp_vetonest.com_verification_verified_tooltip',
            fallbackText: 'Verified',
            fallbackTooltip: 'This professional has been verified by our team'
        },
        pending: {
            color: 'warning',
            icon: <ClockCircleOutlined />,
            textKey: 'cmp_vetonest.com_verification_pending',
            tooltipKey: 'cmp_vetonest.com_verification_pending_tooltip',
            fallbackText: 'Verification in Progress',
            fallbackTooltip: 'Verification is being processed'
        },
        not_submitted: {
            color: 'default',
            icon: <ExclamationCircleOutlined />,
            textKey: 'cmp_vetonest.com_verification_not_submitted',
            tooltipKey: 'cmp_vetonest.com_verification_not_submitted_tooltip',
            fallbackText: 'Not Verified',
            fallbackTooltip: 'Professional verification not yet completed'
        },
        rejected: {
            color: 'error',
            icon: <CloseCircleOutlined />,
            textKey: 'cmp_vetonest.com_verification_rejected',
            tooltipKey: 'cmp_vetonest.com_verification_rejected_tooltip',
            fallbackText: 'Verification Failed',
            fallbackTooltip: 'Verification was unsuccessful'
        }
    };

    const getEffectiveStatus = () => {
        if (!status) return 'not_submitted';
        if (typeof status === 'object') {
            return status.code || 'not_submitted';
        }
        return status || 'not_submitted';
    };

    const effectiveStatus = getEffectiveStatus();
    const config = statusConfig[effectiveStatus] || statusConfig.not_submitted;

    useEffect(() => {
        const loadTranslations = async () => {
            try {
                // Load status text using getAContent
                let text = await getAContent(config.textKey);
                if (!text || text === '***' || text === '...' || text.includes('undefined')) {
                    text = config.fallbackText;
                }
                setTranslatedText(text);

                // Load tooltip text using getAContent
                let tooltip = await getAContent(config.tooltipKey);
                if (!tooltip || tooltip === '***' || tooltip === '...' || tooltip.includes('undefined')) {
                    tooltip = config.fallbackTooltip;
                }
                setTooltipText(tooltip);
            } catch (error) {
                console.error('Error loading translations:', error);
                setTranslatedText(config.fallbackText);
                setTooltipText(config.fallbackTooltip);
            }
        };
        
        loadTranslations();
    }, [effectiveStatus, config, getAContent]);

    const sizeStyles = {
        small: { fontSize: '11px', padding: '2px 8px' },
        default: { fontSize: '13px', padding: '4px 10px' },
        large: { fontSize: '14px', padding: '4px 12px' }
    };

    const badgeContent = (
        <Tag 
            color={config.color} 
            icon={showIcon ? config.icon : null}
            style={sizeStyles[size] || sizeStyles.default}
        >
            {translatedText || config.fallbackText}
        </Tag>
    );

    if (showTooltip && tooltipText) {
        return (
            <Tooltip title={tooltipText} placement="top">
                {badgeContent}
            </Tooltip>
        );
    }

    return badgeContent;
};

export default VerificationStatusBadge;