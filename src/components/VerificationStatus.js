import React, { useState, useEffect, useContext } from 'react';
import { Card, Steps, Tag, Button, Tooltip, Alert } from 'antd';
import { 
    CheckCircleOutlined, 
    ClockCircleOutlined, 
    CloseCircleOutlined, 
    ExclamationCircleOutlined,
    FileTextOutlined,
    SafetyCertificateOutlined,
    UserOutlined,
    EditOutlined
} from '@ant-design/icons';
import { SiteContext } from '../context/site';

const VerificationStatus = ({ vet, onVetDataUpdate }) => {
    const { getAContent, getTranslatedMessage, getAVetoProfile, profileTypeId } = useContext(SiteContext);
    const [currentStep, setCurrentStep] = useState(0);
    const [localVet, setLocalVet] = useState(vet);
    
    // Get effective status - treat null or undefined as 'not_submitted'
    const getEffectiveStatus = () => {
        // If vet is null/undefined or verificationStatus is null/undefined
        if (!localVet || !localVet.verificationStatus || !localVet.verificationStatus.code) {
            return { code: 'not_submitted', tagRefLabel: 'cmp_vetonest.com_verification_not_submitted' };
        }
        return localVet.verificationStatus;
    };
    
    const effectiveStatus = getEffectiveStatus();

    // Update localVet when prop changes
    useEffect(() => {
        setLocalVet(vet);
    }, [vet]);

    // Fetch full vet data if verification status is missing
    useEffect(() => {
        const fetchFullVetData = async () => {
            // If vet has an id but no verificationStatus, try to fetch full vet data
            if (localVet?.id && !localVet?.verificationStatus && profileTypeId === 2) {
                try {
                    const fullVetData = await getAVetoProfile(localVet.id);
                    if (fullVetData?.verificationStatus) {
                        setLocalVet(fullVetData);
                        // Update the parent component's data if callback provided
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
            'rejected': 3
        };
        setCurrentStep(statusMap[effectiveStatus.code] || 0);
    }, [effectiveStatus.code]);

    const getStepIcon = (status, stepIndex) => {
        if (stepIndex < currentStep) {
            return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
        }
        if (stepIndex === currentStep) {
            switch(status) {
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

    const getStatusColor = () => {
        switch(effectiveStatus.code) {
            case 'verified': return '#52c41a';
            case 'pending': return '#faad14';
            case 'rejected': return '#ff4d4f';
            default: return '#888';
        }
    };

    const getStatusIcon = () => {
        switch(effectiveStatus.code) {
            case 'verified': return <SafetyCertificateOutlined style={{ fontSize: 48, color: '#52c41a' }} />;
            case 'pending': return <ClockCircleOutlined style={{ fontSize: 48, color: '#faad14' }} />;
            case 'rejected': return <CloseCircleOutlined style={{ fontSize: 48, color: '#ff4d4f' }} />;
            default: return <FileTextOutlined style={{ fontSize: 48, color: '#888' }} />;
        }
    };

    // Function to scroll to and open the Professional Information edit
    const scrollToProfessionalInfo = () => {
        const editButtons = document.querySelectorAll('[data-fieldname="ProfileVeto"]');
        if (editButtons.length > 0) {
            editButtons[0].click();
        } else {
            const profileSection = document.querySelector('.activity-area-section');
            if (profileSection) {
                profileSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    };

    const steps = [
        {
            title: getAContent('cmp_vetonest.com_verification_step_1_title') || 'Document Submission',
            description: getAContent('cmp_vetonest.com_verification_submit_desc') || 'Submit your professional IDs',
            icon: <FileTextOutlined />
        },
        {
            title: getAContent('cmp_vetonest.com_verification_step_2_title') || 'Verification in Progress',
            description: getAContent('cmp_vetonest.com_verification_pending_desc') || 'Our team is reviewing your documents',
            icon: <ClockCircleOutlined />
        },
        {
            title: getAContent('cmp_vetonest.com_verification_step_3_title') || 'Account Verified',
            description: getAContent('cmp_vetonest.com_verification_verified_desc') || 'Your professional account is verified',
            icon: <SafetyCertificateOutlined />
        }
    ];

    // Get the display text for the status tag
    const getStatusDisplayText = () => {
        if (effectiveStatus.code === 'not_submitted') {
            return getAContent('cmp_vetonest.com_verification_not_submitted') || 'Not Verified';
        }
        if (effectiveStatus.tagRefLabel) {
            return getAContent(effectiveStatus.tagRefLabel);
        }
        return 'Not Verified';
    };

    // Don't render anything if localVet is null (still loading)
    if (!localVet) {
        return null;
    }

    return (
        <Card 
            className="verification-status-card"
            style={{
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                marginTop: '20px',
                border: `1px solid ${getStatusColor()}20`
            }}
        >
            <div className="verification-status-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {getStatusIcon()}
                    <div>
                        <h3 style={{ margin: 0, fontSize: '18px' }}>
                            {getAContent('cmp_vetonest.com_professional_verification') || 'Professional Verification'}
                        </h3>
                        <Tag 
                            color={getStatusColor()} 
                            style={{ marginTop: 4, fontSize: '12px', padding: '2px 8px' }}
                        >
                            {getStatusDisplayText()}
                        </Tag>
                    </div>
                </div>
                {effectiveStatus.code === 'verified' && (
                    <div style={{ textAlign: 'right' }}>
                        <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} />
                        <div style={{ fontSize: '12px', color: '#52c41a' }}>
                            {getAContent('cmp_vetonest.com_verified_badge') || 'Verified Account'}
                        </div>
                    </div>
                )}
            </div>

            {effectiveStatus.code === 'not_submitted' && (
                <Alert
                    message={getAContent('cmp_vetonest.com_verification_not_submitted_alert') || 'Complete your professional verification'}
                    description={
                        <div>
                            <p style={{ marginBottom: 8 }}>
                                {getAContent('cmp_vetonest.com_verification_not_submitted_alert_desc') || 
                                    'Add your professional IDs to start the verification process and build trust with pet owners.'}
                            </p>
                            <p style={{ marginBottom: 0, fontSize: '13px', color: '#666' }}>
                                <EditOutlined style={{ marginRight: 4 }} />
                                {getAContent('cmp_vetonest.com_verification_edit_hint') || 
                                    'Click the "Edit" button in the Professional Information section above to add your IDs.'}
                            </p>
                        </div>
                    }
                    type="info"
                    showIcon
                    style={{ marginBottom: 24, borderRadius: '8px' }}
                />
            )}

            {effectiveStatus.code === 'pending' && (
                <Alert
                    message={getAContent('cmp_vetonest.com_verification_step_2_title') || 'Verification in Progress'}
                    description={
                        <div>
                            <p style={{ marginBottom: 8 }}>
                                {getAContent('cmp_vetonest.com_verification_pending_desc') || 
                                    'Your professional IDs have been submitted and are being reviewed by our team.'}
                            </p>
                        </div>
                    }
                    type="info"
                    showIcon
                    style={{ marginBottom: 24, borderRadius: '8px' }}
                />
            )}

            {effectiveStatus.code === 'rejected' && (
                <Alert
                    message={getAContent('cmp_vetonest.com_verification_rejected_alert') || 'Verification Failed'}
                    description={
                        <div>
                            <p>{localVet?.verificationNotes || (getAContent('cmp_vetonest.com_verification_rejected_alert_desc') || 
                                'Your submitted documents could not be verified. Please check and resubmit.')}
                            </p>
                            <p style={{ marginBottom: 0, fontSize: '13px', color: '#666' }}>
                                <EditOutlined style={{ marginRight: 4 }} />
                                {getAContent('cmp_vetonest.com_verification_rejected_hint') || 
                                    'Click the "Edit" button in the Professional Information section to update your IDs.'}
                            </p>
                        </div>
                    }
                    type="error"
                    showIcon
                    style={{ marginBottom: 24, borderRadius: '8px' }}
                />
            )}

            <Steps
                current={currentStep}
                status={effectiveStatus.code === 'rejected' ? 'error' : 'process'}
                items={steps.map((step, index) => ({
                    title: step.title,
                    description: step.description,
                    icon: getStepIcon(effectiveStatus.code, index),
                    status: index === currentStep && effectiveStatus.code === 'rejected' ? 'error' : undefined
                }))}
                style={{ marginTop: 16 }}
            />

            {localVet?.professionalIdSubmittedAt && (
                <div className="verification-timestamps" style={{ 
                    marginTop: 20, 
                    paddingTop: 16, 
                    borderTop: '1px solid #f0f0f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                    color: '#888'
                }}>
                    <div>
                        <UserOutlined style={{ marginRight: 4 }} />
                        {getAContent('cmp_vetonest.com_submitted_on') || 'Submitted on'}: {new Date(localVet.professionalIdSubmittedAt).toLocaleDateString()}
                    </div>
                    {localVet?.professionalIdVerifiedAt && (
                        <div>
                            <SafetyCertificateOutlined style={{ marginRight: 4 }} />
                            {getAContent('cmp_vetonest.com_verified_on') || 'Verified on'}: {new Date(localVet.professionalIdVerifiedAt).toLocaleDateString()}
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
};

export default VerificationStatus;