import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Spin, Alert, Modal, message, Tag } from 'antd';
import { CheckCircleOutlined, WarningOutlined, CheckOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { SiteContext } from '../context/site';
import { AuthContext } from '../context/AuthProvider';
import StripeIcon from './icons/StripeIcon';

const VetStripeConnect = () => {
  const { getAContent, apiCall } = useContext(SiteContext);
  const { user, profile, userId, isAuthenticated } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const [onboardingUrl, setOnboardingUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('unconnected');
  const [requirements, setRequirements] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  // Helper to redirect to login if not authenticated
  const redirectToLogin = () => {
    message.warning(
      getAContent('cmp_vetonest.com_SessionExpired_Message') || 
      'Your session has expired. Please log in again.'
    );
    navigate('/connexion');
  };

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      redirectToLogin();
      return;
    }
    checkStatus();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const stripeStatus = params.get('stripe_status');
    
    if (stripeStatus === 'success') {
      message.success(
        getAContent('cmp_vetonest.com_StripeConnected_Success') || 
        'Your Stripe account has been successfully connected!'
      );
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
    
    checkStatus();
  }, [location.search]);

  const checkStatus = async () => {
    // Check authentication first
    if (!isAuthenticated()) {
      redirectToLogin();
      return;
    }

    setLoading(true);
    try {
      const response = await apiCall(`/vet/connect/status?userId=${userId}`, {
        method: 'GET',
      });

      // Handle authentication error
      if (!response.success && response.error === 'User not authenticated') {
        redirectToLogin();
        return;
      }

      if (response.success) {
        setStatus(response.status);
        setRequirements(response.requirements || []);
      }
    } catch (error) {
      console.error('Error checking Stripe status:', error);
      // Check if it's an authentication error
      if (error.message?.includes('authenticated') || error.status === 401) {
        redirectToLogin();
      } else {
        message.error(getAContent('cmp_vetonest.com_StripeCheckStatusError') || 'Failed to check Stripe connection status');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    let cleaned = phone.replace(/[^0-9+]/g, '');
    if (!cleaned.startsWith('+')) {
      if (cleaned.startsWith('0')) {
        cleaned = '+33' + cleaned.substring(1);
      } else {
        cleaned = '+33' + cleaned;
      }
    }
    return cleaned;
  };

  const handleConnect = async () => {
    // Check authentication first
    if (!isAuthenticated()) {
      redirectToLogin();
      return;
    }

    setLoading(true);
    try {
      let phone = profile?.phone || user?.phone || '';
      const formattedPhone = phone ? formatPhoneNumber(phone) : '';
      const email = profile?.email || user?.email;

      if (!email) {
        message.error(getAContent('cmp_vetonest.com_StripeEmailRequired') || 'Email is required to connect to Stripe');
        setLoading(false);
        return;
      }

      const payload = { userId, email, popup: true };
      if (formattedPhone) {
        payload.phone = formattedPhone;
      }

      const response = await apiCall('/vet/connect', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      // Handle authentication error
      if (!response.success && response.error === 'User not authenticated') {
        redirectToLogin();
        return;
      }

      if (response.success && response.onboardingUrl) {
        setOnboardingUrl(response.onboardingUrl);
        window.open(response.onboardingUrl, '_blank');
        setModalVisible(true);
      } else if (response.alreadyConnected) {
        setStatus('active');
        message.success(getAContent('cmp_vetonest.com_StripeConnected_Message') || 'Stripe account already connected');
        checkStatus();
      } else if (response.warning) {
        console.warn('Stripe warning:', response.warning);
        if (response.onboardingUrl) {
          setOnboardingUrl(response.onboardingUrl);
          window.open(response.onboardingUrl, '_blank');
          setModalVisible(true);
        } else {
          message.warning(response.warning);
          checkStatus();
        }
      } else {
        message.error(response.error || getAContent('cmp_vetonest.com_StripeConnectFailed') || 'Failed to connect to Stripe');
      }
    } catch (error) {
      console.error('Error connecting to Stripe:', error);
      if (error.message?.includes('authenticated') || error.status === 401) {
        redirectToLogin();
      } else {
        message.error(error.message || getAContent('cmp_vetonest.com_StripeConnectFailed') || 'Failed to connect to Stripe. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setModalVisible(false);
    setOnboardingUrl('');
    checkStatus();
  };

  const handleManageStripe = async () => {
    // Check authentication first
    if (!isAuthenticated()) {
      redirectToLogin();
      return;
    }

    const popupWindow = window.open('', '_blank');
    
    if (!popupWindow) {
      message.info(
        getAContent('cmp_vetonest.com_PopupBlocked_Message') || 
        'Please allow popups for this site.'
      );
      window.location.href = 'https://dashboard.stripe.com/express';
      return;
    }

    popupWindow.document.write(`
      <html>
        <head><title>Redirecting to Stripe...</title></head>
        <body style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;background:#f5f5f5;">
          <div style="text-align:center;">
            <div style="font-size:48px;margin-bottom:16px;">⏳</div>
            <h2>${getAContent('cmp_vetonest.com_Redirecting_Title') || 'Redirecting to Stripe...'}</h2>
            <p style="color:#666;">${getAContent('cmp_vetonest.com_Redirecting_Message') || 'Please wait while we connect you to Stripe Express.'}</p>
          </div>
        </body>
      </html>
    `);

    setLoading(true);
    try {
      const response = await apiCall('/vet/connect/manage', {
        method: 'POST',
        body: JSON.stringify({ userId, popup: true }),
      });

      // Handle authentication error
      if (!response.success && response.error === 'User not authenticated') {
        redirectToLogin();
        popupWindow.close();
        return;
      }

      if (response.success && response.managementUrl) {
        popupWindow.location.href = response.managementUrl;
      } else {
        popupWindow.location.href = 'https://dashboard.stripe.com/express';
        message.info(
          getAContent('cmp_vetonest.com_StripeManageFallback') || 
          'You may need to log in with your Stripe credentials.'
        );
      }
    } catch (error) {
      console.error('Error generating management link:', error);
      if (error.message?.includes('authenticated') || error.status === 401) {
        redirectToLogin();
        popupWindow.close();
      } else {
        popupWindow.location.href = 'https://dashboard.stripe.com/express';
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = () => {
    switch (status) {
      case 'active':
        return {
          icon: <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} />,
          title: getAContent('cmp_vetonest.com_StripeConnected_Title') || 'Connected to Stripe',
          description: getAContent('cmp_vetonest.com_StripeConnected_Desc') || 'Your account is ready to receive payments.',
          color: '#52c41a',
          bgColor: '#f6ffed',
          borderColor: '#b7eb8f',
          statusText: getAContent('cmp_vetonest.com_StatusConnected') || 'Connected',
          statusColor: '#52c41a',
        };
      case 'pending':
        return {
          icon: <WarningOutlined style={{ color: '#faad14', fontSize: 20 }} />,
          title: getAContent('cmp_vetonest.com_StripePending_Title') || 'Onboarding in progress',
          description: getAContent('cmp_vetonest.com_StripePending_Desc') || 'Please complete the Stripe onboarding process to receive payments.',
          color: '#faad14',
          bgColor: '#fffbe6',
          borderColor: '#ffe58f',
          statusText: getAContent('cmp_vetonest.com_StatusPending') || 'Pending',
          statusColor: '#faad14',
        };
      default:
        return {
          icon: <StripeIcon size={20} />,
          title: getAContent('cmp_vetonest.com_StripeConnect_Title') || 'Payment Setup',
          description: getAContent('cmp_vetonest.com_StripeConnect_Desc') || 'Connect your Stripe account to receive payments from consultations.',
          color: '#1890ff',
          bgColor: '#fafafa',
          borderColor: '#d9d9d9',
          statusText: getAContent('cmp_vetonest.com_StatusNotConnected') || 'Not Connected',
          statusColor: '#999',
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  // If not authenticated, show nothing (will redirect)
  if (!isAuthenticated()) {
    return null;
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <Spin size="large" />
        <p style={{ marginTop: 16, color: '#999' }}>
          {getAContent('cmp_vetonest.com_CheckingStatus_Txt') || 'Checking Stripe status...'}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* ─── Status Card ────────────────────────────────────────────────────── */}
      <div
        style={{
          borderRadius: '8px',
          border: `1px solid ${statusDisplay.borderColor}`,
          background: '#ffffff',
          overflow: 'hidden',
        }}
      >
        {/* ─── Header ──────────────────────────────────────────────────────── */}
        <div
          style={{
            padding: '12px 16px',
            background: statusDisplay.bgColor,
            borderBottom: `1px solid ${statusDisplay.borderColor}`,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          {statusDisplay.icon}
          <span style={{ fontSize: '14px', fontWeight: 500, color: '#333' }}>
            {statusDisplay.title}
          </span>
          <Tag
            color={status === 'active' ? 'success' : status === 'pending' ? 'warning' : 'default'}
            style={{ marginLeft: 'auto', fontSize: '11px' }}
          >
            {statusDisplay.statusText}
          </Tag>
        </div>

        {/* ─── Body ────────────────────────────────────────────────────────── */}
        <div style={{ padding: '16px' }}>
          <p style={{ color: '#666', marginBottom: 12, fontSize: '13px' }}>
            {statusDisplay.description}
          </p>

          {status === 'pending' && requirements.length > 0 && (
            <Alert
              message={getAContent('cmp_vetonest.com_RequirementsNeeded_Title') || 'Additional information needed'}
              description={
                <ul style={{ margin: '4px 0 0', paddingLeft: 16, fontSize: '12px' }}>
                  {requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              }
              type="warning"
              style={{ marginBottom: 12, fontSize: '13px' }}
              showIcon
            />
          )}

          {status === 'active' && (
            <>
              <Alert
                message={getAContent('cmp_vetonest.com_ReadyToReceive_Title') || 'Ready to receive payments'}
                description={getAContent('cmp_vetonest.com_ReadyToReceive_Desc') || 'You can now accept payments for consultations. Funds will be transferred to your bank account weekly.'}
                type="success"
                style={{ marginBottom: 8, fontSize: '13px' }}
                showIcon
                icon={<CheckOutlined />}
              />
              <Alert
                message={getAContent('cmp_vetonest.com_StripeManageInfo_Title') || 'Managing your Stripe account'}
                description={getAContent('cmp_vetonest.com_StripeManageInfo_Desc') || 'You\'ll be redirected to Stripe Express. If you haven\'t logged in before, you\'ll be prompted to create a password or use a magic link sent to your email.'}
                type="info"
                style={{ fontSize: '13px' }}
                showIcon
                icon={<InfoCircleOutlined />}
              />
            </>
          )}

          {status === 'unconnected' && (
            <Alert
              message={getAContent('cmp_vetonest.com_ActionRequired_Title') || 'Action Required'}
              description={getAContent('cmp_vetonest.com_ActionRequired_Desc') || 'You must connect your Stripe account to receive payments for consultations. This is a one-time setup that takes about 5-10 minutes.'}
              type="info"
              style={{ marginBottom: 12, fontSize: '13px' }}
              showIcon
            />
          )}

          {status === 'pending' && (
            <Alert
              message={getAContent('cmp_vetonest.com_OnboardingInProgress_Title') || 'Onboarding in progress'}
              description={getAContent('cmp_vetonest.com_OnboardingInProgress_Desc') || 'Please complete the Stripe onboarding process to receive payments.'}
              type="warning"
              style={{ marginBottom: 12, fontSize: '13px' }}
              showIcon
            />
          )}

          {/* ─── Button ────────────────────────────────────────────────────── */}
          {status === 'active' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: 4 }}>
              <Button
                type="primary"
                onClick={handleManageStripe}
                style={{
                  backgroundColor: '#635BFF',
                  borderColor: '#635BFF',
                  color: '#fff',
                  fontWeight: 500,
                  height: '36px',
                  fontSize: '13px',
                  width: '100%',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <StripeIcon size={16} />
                  {getAContent('cmp_vetonest.com_ManageStripe_Btn') || 'Manage Stripe Account'}
                </span>
              </Button>
              <Button
                type="link"
                onClick={checkStatus}
                style={{ width: '100%', color: '#666', height: 'auto', padding: '4px 0', fontSize: '12px' }}
              >
                {getAContent('cmp_vetonest.com_RefreshStatus_Btn') || 'Refresh Status'}
              </Button>
            </div>
          ) : status === 'pending' ? (
            <Button
              type="primary"
              onClick={handleConnect}
              loading={loading}
              style={{
                backgroundColor: '#FFDE59',
                borderColor: '#FFDE59',
                color: '#333',
                fontWeight: 500,
                height: '36px',
                fontSize: '13px',
                width: '100%',
              }}
            >
              {getAContent('cmp_vetonest.com_ContinueOnboarding_Btn') || 'Continue Onboarding →'}
            </Button>
          ) : (
            <Button
              type="primary"
              onClick={handleConnect}
              loading={loading}
              style={{
                backgroundColor: '#FFDE59',
                borderColor: '#FFDE59',
                color: '#333',
                fontWeight: 500,
                height: '36px',
                fontSize: '13px',
                width: '100%',
              }}
            >
              {getAContent('cmp_vetonest.com_ConnectStripe_Btn') || 'Connect to Stripe'}
            </Button>
          )}
        </div>
      </div>

      {/* ─── Modal ────────────────────────────────────────────────────────── */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <StripeIcon size={24} />
            <span>{getAContent('cmp_vetonest.com_OnboardingStarted_Title') || 'Onboarding started'}</span>
          </div>
        }
        open={modalVisible}
        onOk={handleRefresh}
        onCancel={handleRefresh}
        okText={getAContent('cmp_vetonest.com_CheckStatus_Btn') || 'Check status'}
        cancelText={getAContent('cmp_vetonest.com_Close_Btn') || 'Close'}
        okButtonProps={{
          style: {
            backgroundColor: '#FFDE59',
            borderColor: '#FFDE59',
            color: '#333',
            fontWeight: 600,
          },
        }}
        styles={{
          content: {
            padding: '20px',
          },
        }}
      >
        <p style={{ fontSize: '14px', color: '#555' }}>
          {getAContent('cmp_vetonest.com_OnboardingStarted_Message') ||
            'You have been redirected to Stripe to complete your onboarding. After finishing, click "Check status" to verify your connection.'}
        </p>

        {onboardingUrl && (
          <div
            style={{
              padding: '10px 12px',
              background: '#f5f5f5',
              borderRadius: '8px',
              marginBottom: '12px',
              wordBreak: 'break-all',
            }}
          >
            <span style={{ fontSize: '13px', color: '#555' }}>
              {getAContent('cmp_vetonest.com_StripeManualLinkText') || 'If the Stripe page didn\'t open automatically, click here:'}
            </span>
            <br />
            <a
              href={onboardingUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: '13px', color: '#1890ff' }}
            >
              {onboardingUrl}
            </a>
          </div>
        )}

        <Alert
          message={getAContent('cmp_vetonest.com_Reminder_Title') || 'Reminder'}
          description={getAContent('cmp_vetonest.com_Reminder_Message') || 'You must complete the Stripe onboarding to receive payments. This process usually takes 5-10 minutes.'}
          type="info"
          style={{ marginTop: 12 }}
          icon={<WarningOutlined />}
        />
      </Modal>
    </>
  );
};

export default VetStripeConnect;