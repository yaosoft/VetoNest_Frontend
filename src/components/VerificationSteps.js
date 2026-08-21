import React, { useState, useEffect, useContext } from 'react';
import { Steps, Tooltip } from 'antd';
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    ExclamationCircleOutlined,
    FileTextOutlined,
    SafetyCertificateOutlined,
    InfoCircleOutlined,
} from '@ant-design/icons';
import { SiteContext } from '../context/site';

// Lightweight companion to VerificationStatus: just the step progress.
// No Card wrapper, header/Tag, Alert messages, or timestamp footer —
// those are redundant now that the compact "Professional verification"
// status card (next to Account Status) already shows the current status.
const VerificationSteps = ({ vet, onVetDataUpdate }) => {
    const { getAContent, getAVetoProfile, profileTypeId } = useContext(SiteContext);
    const [currentStep, setCurrentStep] = useState(0);
    const [localVet, setLocalVet] = useState(vet);

    // Get effective status - treat null or undefined as 'not_submitted'
    const getEffectiveStatus = () => {
        if (!localVet || !localVet.verificationStatus || !localVet.verificationStatus.code) {
            return { code: 'not_submitted' };
        }
        return localVet.verificationStatus;
    };

    const effectiveStatus = getEffectiveStatus();

    // Keep in sync if the parent's vet prop updates
    useEffect(() => {
        setLocalVet(vet);
    }, [vet]);

    // Fetch full vet data if verification status is missing (same as VerificationStatus)
    useEffect(() => {
        const fetchFullVetData = async () => {
            if (localVet?.id && !localVet?.verificationStatus && profileTypeId === 2) {
                try {
                    const fullVetData = await getAVetoProfile(localVet.id);
                    if (fullVetData?.verificationStatus) {
                        setLocalVet(fullVetData);
                        if (onVetDataUpdate) {
                            onVetDataUpdate(fullVetData);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching vet data:', error);
                }
            }
        };

        fetchFullVetData();
    }, [localVet?.id, localVet?.verificationStatus, profileTypeId]);

    useEffect(() => {
        const statusMap = {
            'not_submitted': 0,
            'pending': 1,
            'verified': 2,
            'rejected': 3,
        };
        setCurrentStep(statusMap[effectiveStatus.code] || 0);
    }, [effectiveStatus.code]);

    const getStepIcon = (status, stepIndex) => {
        if (stepIndex < currentStep) {
            return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
        }
        if (stepIndex === currentStep) {
            switch (status) {
                case 'verified':
                    return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
                case 'pending':
                    return <ClockCircleOutlined style={{ color: '#faad14' }} />;
                case 'rejected':
                    return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
                default:
                    return <ExclamationCircleOutlined style={{ color: '#888' }} />;
            }
        }
        return null;
    };

    const steps = [
        {
            title: getAContent('cmp_vetonest.com_verification_step_1_title') || 'Document Submission',
            description: getAContent('cmp_vetonest.com_verification_submit_desc') || 'Submit your professional credentials',
            icon: <FileTextOutlined />,
        },
        {
            title: getAContent('cmp_vetonest.com_verification_step_2_title') || 'Verification in Progress',
            description: getAContent('cmp_vetonest.com_verification_pending_desc') || 'Documents being reviewed',
            icon: <ClockCircleOutlined />,
        },
        {
            title: getAContent('cmp_vetonest.com_verification_step_3_title') || 'Account Verified',
            description: getAContent('cmp_vetonest.com_verification_verified_desc') || 'Account verified',
            icon: <SafetyCertificateOutlined />,
        },
    ];

    // Don't render anything if localVet is null (still loading)
    if (!localVet) {
        return null;
    }

    return (
        <Steps
            size="small"
            current={currentStep}
            status={effectiveStatus.code === 'rejected' ? 'error' : 'process'}
            items={steps.map((step, index) => ({
                title: (
                    <span style={{ fontSize: '13px' }}>
                        {step.title}{' '}
                        <Tooltip title={step.description}>
                            <InfoCircleOutlined style={{ fontSize: '12px', color: '#999' }} />
                        </Tooltip>
                    </span>
                ),
                icon: getStepIcon(effectiveStatus.code, index),
                status: index === currentStep && effectiveStatus.code === 'rejected' ? 'error' : undefined,
            }))}
        />
    );
};

export default VerificationSteps;