// src/components/VetProfileSettings.js
import React, { useState, useContext, useEffect } from 'react';
import { Card, Button, Modal, Input, DatePicker, message, Tag, Alert, Space } from 'antd';
import { CalendarOutlined, PauseCircleOutlined, PlayCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { SiteContext } from '../../context/site';
import { AuthContext } from '../../context/AuthProvider';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

const VetProfileSettings = () => {
    const { profileId, user } = useContext(AuthContext);
    const { getAContent, getVetStatus, setVacationMode, disableSelf, enableSelf } = useContext(SiteContext);
    
    const [profileStatus, setProfileStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [vacationModalOpen, setVacationModalOpen] = useState(false);
    const [disableModalOpen, setDisableModalOpen] = useState(false);
    const [vacationDates, setVacationDates] = useState(null);
    const [vacationMessage, setVacationMessage] = useState('');
    const [disableReason, setDisableReason] = useState('');
    const [disableDuration, setDisableDuration] = useState(null);
    
    // Helper function for translations
    const t = (key, fallback) => {
        const val = getAContent(key);
        return (val && val !== '***' && val !== '...') ? val : fallback;
    };
    
    useEffect(() => {
        fetchStatus();
    }, []);
    
    const fetchStatus = async () => {
        const response = await getVetStatus(profileId);
        if (response.success) {
            setProfileStatus(response);
        }
    };
    
    const handleSetVacation = async () => {
        if (!vacationDates || !vacationDates[0] || !vacationDates[1]) {
            message.warning(t('cmp_vetonest.com_SelectVacationDates_Warning', 'Veuillez sélectionner les dates de vacances'));
            return;
        }
        
        setLoading(true);
        try {
            const response = await setVacationMode({
                profileVetoId: profileId,
                startDate: vacationDates[0].format('YYYY-MM-DD 00:00:00'),
                endDate: vacationDates[1].format('YYYY-MM-DD 23:59:59'),
                message: vacationMessage || t('cmp_vetonest.com_OnVacation_Default', 'En vacances')
            });
            
            if (response.success) {
                message.success(t('cmp_vetonest.com_VacationModeActivated_Success', 'Mode vacances activé'));
                setVacationModalOpen(false);
                setVacationDates(null);
                setVacationMessage('');
                fetchStatus();
            } else {
                message.error(response.message);
            }
        } catch (error) {
            message.error(t('cmp_vetonest.com_ErrorSettingVacation_Error', 'Erreur lors de l\'activation du mode vacances'));
        } finally {
            setLoading(false);
        }
    };
    
    const handleDisableSelf = async () => {
        if (!disableReason) {
            message.warning(t('cmp_vetonest.com_ProvideReason_Warning', 'Veuillez fournir une raison'));
            return;
        }
        
        setLoading(true);
        try {
            const response = await disableSelf({
                profileVetoId: profileId,
                reason: disableReason,
                duration: disableDuration
            });
            
            if (response.success) {
                message.success(t('cmp_vetonest.com_ProfileDisabled_Success', 'Votre profil a été désactivé'));
                setDisableModalOpen(false);
                setDisableReason('');
                setDisableDuration(null);
                fetchStatus();
            } else {
                message.error(response.message);
            }
        } catch (error) {
            message.error(t('cmp_vetonest.com_ErrorDisablingProfile_Error', 'Erreur lors de la désactivation du profil'));
        } finally {
            setLoading(false);
        }
    };
    
    const handleEnableSelf = async () => {
        Modal.confirm({
            title: t('cmp_vetonest.com_EnableProfile_Title', 'Réactiver le profil'),
            content: t('cmp_vetonest.com_EnableProfile_Confirm', 'Êtes-vous sûr de vouloir réactiver votre profil ? Vous recommencerez à recevoir des demandes de consultation.'),
            okText: t('cmp_vetonest.com_Enable_Btn', 'Oui, réactiver'),
            cancelText: t('cmp_vetonest.com_Cancel_Btn', 'Annuler'),
            onOk: async () => {
                setLoading(true);
                try {
                    const response = await enableSelf({ profileVetoId: profileId });
                    if (response.success) {
                        message.success(t('cmp_vetonest.com_ProfileEnabled_Success', 'Votre profil a été réactivé'));
                        fetchStatus();
                    } else {
                        message.error(response.message);
                    }
                } catch (error) {
                    message.error(t('cmp_vetonest.com_ErrorEnablingProfile_Error', 'Erreur lors de la réactivation du profil'));
                } finally {
                    setLoading(false);
                }
            }
        });
    };
    
    const getStatusConfig = () => {
        if (!profileStatus) return { color: 'default', text: t('cmp_vetonest.com_Loading_Status', 'Chargement...') };
        
        if (profileStatus.isOnVacation) {
            return {
                color: 'orange',
                text: t('cmp_vetonest.com_OnVacation_Status', 'En vacances') + ` (${t('cmp_vetonest.com_Until_Prefix', 'jusqu\'au')} ${dayjs(profileStatus.vacationEndDate).format('DD MMM YYYY')})`,
                icon: <CalendarOutlined />
            };
        }
        if (profileStatus.isDisabled) {
            return {
                color: 'red',
                text: t('cmp_vetonest.com_Disabled_Status', 'Désactivé'),
                icon: <PauseCircleOutlined />
            };
        }
        return {
            color: 'green',
            text: t('cmp_vetonest.com_Active_Status', 'Actif'),
            icon: <PlayCircleOutlined />
        };
    };
    
    const statusConfig = getStatusConfig();
    
    // Get user display name
    const userDisplayName = user?.userPrenom 
        ? `${user.userPrenom} ${user.userNom || ''}`.trim() 
        : t('cmp_vetonest.com_MyProfile_Label', 'Mon profil');
    
    return (
        <Card title={t('cmp_vetonest.com_ProfileStatusManagement_Title', 'Gestion du statut du profil')}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* Profile Header with Name */}
                <div style={{ marginBottom: 16 }}>
                    <h2 style={{ margin: 0, fontSize: '20px' }}>{userDisplayName}</h2>
                    <p style={{ margin: '8px 0 0', color: '#888' }}>
                        {t('cmp_vetonest.com_VeterinarianProfile_Label', 'Profil vétérinaire')}
                    </p>
                </div>
                
                {/* Current Status */}
                <div>
                    <h3>{t('cmp_vetonest.com_CurrentStatus_Label', 'Statut actuel')}</h3>
                    <Tag color={statusConfig.color} icon={statusConfig.icon} style={{ fontSize: '14px', padding: '4px 12px' }}>
                        {statusConfig.text}
                    </Tag>
                    
                    {profileStatus?.disableReason && (
                        <Alert
                            message={t('cmp_vetonest.com_DisableReason_Label', 'Raison de la désactivation')}
                            description={profileStatus.disableReason}
                            type="info"
                            showIcon
                            style={{ marginTop: 12 }}
                        />
                    )}
                    
                    {profileStatus?.vacationMessage && (
                        <Alert
                            message={t('cmp_vetonest.com_VacationMessage_Label', 'Message de vacances')}
                            description={profileStatus.vacationMessage}
                            type="info"
                            showIcon
                            style={{ marginTop: 12 }}
                        />
                    )}
                </div>
                
                {/* Action Buttons */}
                {profileStatus?.isActive && (
                    <Space>
                        <Button
                            type="primary"
                            icon={<CalendarOutlined />}
                            onClick={() => setVacationModalOpen(true)}
                        >
                            {t('cmp_vetonest.com_SetVacationMode_Btn', 'Mode vacances')}
                        </Button>
                        <Button
                            danger
                            icon={<PauseCircleOutlined />}
                            onClick={() => setDisableModalOpen(true)}
                        >
                            {t('cmp_vetonest.com_TemporarilyDisable_Btn', 'Désactiver temporairement')}
                        </Button>
                    </Space>
                )}
                
                {(profileStatus?.isDisabled || profileStatus?.isOnVacation) && (
                    <Button
                        type="primary"
                        icon={<PlayCircleOutlined />}
                        onClick={handleEnableSelf}
                        loading={loading}
                        style={{ background: '#52c41a' }}
                    >
                        {t('cmp_vetonest.com_ReactivateProfile_Btn', 'Réactiver le profil')}
                    </Button>
                )}
            </Space>
            
            {/* Vacation Mode Modal */}
            <Modal
                title={t('cmp_vetonest.com_SetVacationMode_Title', 'Mode vacances')}
                open={vacationModalOpen}
                onOk={handleSetVacation}
                onCancel={() => {
                    setVacationModalOpen(false);
                    setVacationDates(null);
                    setVacationMessage('');
                }}
                confirmLoading={loading}
                okText={t('cmp_vetonest.com_Activate_Btn', 'Activer')}
                cancelText={t('cmp_vetonest.com_Cancel_Btn', 'Annuler')}
            >
                <div style={{ marginBottom: 16 }}>
                    <label>{t('cmp_vetonest.com_VacationPeriod_Label', 'Période de vacances')} :</label>
                    <RangePicker
                        style={{ width: '100%', marginTop: 8 }}
                        showTime
                        format="YYYY-MM-DD HH:mm"
                        onChange={(dates) => setVacationDates(dates)}
                        placeholder={[t('cmp_vetonest.com_StartDate_Placeholder', 'Date de début'), t('cmp_vetonest.com_EndDate_Placeholder', 'Date de fin')]}
                    />
                </div>
                <div>
                    <label>{t('cmp_vetonest.com_Message_Optional_Label', 'Message (optionnel)')} :</label>
                    <TextArea
                        rows={3}
                        placeholder={t('cmp_vetonest.com_VacationMessage_Placeholder', 'Expliquez à vos clients pourquoi vous êtes en vacances...')}
                        value={vacationMessage}
                        onChange={(e) => setVacationMessage(e.target.value)}
                        style={{ marginTop: 8 }}
                    />
                </div>
            </Modal>
            
            {/* Disable Profile Modal */}
            <Modal
                title={t('cmp_vetonest.com_DisableProfile_Title', 'Désactiver le profil temporairement')}
                open={disableModalOpen}
                onOk={handleDisableSelf}
                onCancel={() => {
                    setDisableModalOpen(false);
                    setDisableReason('');
                    setDisableDuration(null);
                }}
                confirmLoading={loading}
                okText={t('cmp_vetonest.com_Disable_Btn', 'Désactiver')}
                cancelText={t('cmp_vetonest.com_Cancel_Btn', 'Annuler')}
                okButtonProps={{ danger: true }}
            >
                <div style={{ marginBottom: 16 }}>
                    <label>{t('cmp_vetonest.com_DisableReason_Label', 'Raison de la désactivation')} :</label>
                    <TextArea
                        rows={3}
                        placeholder={t('cmp_vetonest.com_DisableReason_Placeholder', 'ex: Pause, Congé médical, etc.')}
                        value={disableReason}
                        onChange={(e) => setDisableReason(e.target.value)}
                        style={{ marginTop: 8 }}
                    />
                </div>
                <div>
                    <label>{t('cmp_vetonest.com_AutoReactivate_Label', 'Réactivation automatique après (jours)')} :</label>
                    <Input
                        type="number"
                        placeholder={t('cmp_vetonest.com_AutoReactivate_Placeholder', 'Laisser vide pour réactiver manuellement')}
                        value={disableDuration}
                        onChange={(e) => setDisableDuration(e.target.value)}
                        style={{ marginTop: 8 }}
                    />
                </div>
                <Alert
                    message={t('cmp_vetonest.com_Note_Label', 'Note')}
                    description={t('cmp_vetonest.com_DisableWarning_Text', 'Lorsque vous êtes désactivé, vous n\'apparaîtrez pas dans les résultats de recherche et ne pourrez pas recevoir de nouvelles demandes de consultation. Vous pouvez toujours vous connecter et vous réactiver à tout moment.')}
                    type="warning"
                    showIcon
                    style={{ marginTop: 16 }}
                />
            </Modal>
        </Card>
    );
};

export default VetProfileSettings;