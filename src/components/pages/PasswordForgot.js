import React, { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from "../../context/AuthProvider";
import { SiteContext } from "../../context/site";
import { Space, Spin, Button, message, Form, Input, Alert, Modal } from 'antd';
import { LoadingOutlined, MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import InputCode from "../InputCode";
import Header from '../Header';
import Footer from '../Footer';
import Title from '../Title';

const PasswordForgot = () => {
    // Context
    const { isValidPassword } = useContext(AuthContext);
    const {
        siteName,
        siteEmail,
        siteUrl,
        siteDomain,
        generateRandomDigits,
        sendEmail,
        checkEmail,
        setVerificationCode,
        setVerificationUserId,
        insertSpaceAtPosition,
        getAContent,
        siteLocale
    } = useContext(SiteContext);

    // Rate limiting state variables
    const [resendCount, setResendCount] = useState(0);
    const [resendCooldown, setResendCooldown] = useState(0);
    const MAX_RESEND_ATTEMPTS = 3;
    const COOLDOWN_SECONDS = 60;

    // Navigation
    const navigate = useNavigate();
    const [form] = Form.useForm();

    // State management
    const [loading, setLoading] = useState(false);
    const [sendingDisabled, setSendingDisabled] = useState(false);
    const [ready, setReady] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Form data
    const [email, setEmail] = useState('');
    const [userId, setUserId] = useState(null);
    const [generatedCode, setGeneratedCode] = useState('');
    const [emailVerificationResult, setEmailVerificationResult] = useState(false);
    
    // Error states
    const [formError, setFormError] = useState(null);
    const [displayCodeCorrect, setDisplayCodeCorrect] = useState(false);
    const [displayCodeIncorrect, setDisplayCodeIncorrect] = useState(false);
    
    // Email validation
    const regexEmailValidation = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const isValidEmail = (email) => regexEmailValidation.test(email);

    // Auto-fill fix
    useEffect(() => {
        const id = setTimeout(() => setReady(true), 50);
        return () => clearTimeout(id);
    }, []);

    // Clear errors
    const clearErrors = () => {
        setFormError(null);
    };

    // Handle email submission
    const handleSubmit = async (values) => {
        clearErrors();
        setLoading(true);
        setSendingDisabled(true);

        try {
            // Check if email exists
            const checkEmailData = { email: values.email };
            const id = await checkEmail(checkEmailData);

            if (!id) {
                setFormError({
                    message: getAContent('cmp_vetonest.com_email_not_found') || "Email not found",
                    description: getAContent('cmp_vetonest.com_email_not_found_details') || "No account exists with this email address.",
                    type: 'error'
                });
                setLoading(false);
                setSendingDisabled(false);
                return;
            }

            setUserId(id);
            setEmail(values.email);

            // Generate verification code
            const genCode = await generateRandomDigits(6);
            setGeneratedCode(genCode);

            // Determine if French (using same logic as ConsultationBooking.js)
            const isFrench = siteLocale?.startsWith('fr');
            
            // Localized subject
            const subject = isFrench
                ? `Réinitialisez votre mot de passe - ${siteName}`
                : `Reset Your Password - ${siteName}`;

            // Send verification email
            const domainName = values.email.split('@')[1];
            
            const sendEmailData = {
                to_email: values.email,
                to_domain: domainName,
                subject: subject,
                userName: '',
                siteName: siteName,
                siteDomain: siteDomain,
                siteEmail: siteEmail,
                siteUrl: siteUrl,
                code: insertSpaceAtPosition(genCode, 3),
                emailTemplate: 'password_forgot',
                siteLocale: siteLocale,  // Pass the locale to template (same as consultation_request)
                timezone: 'Europe/Paris', // Default timezone
            };

            const emailSent = await sendEmail(sendEmailData);

            if (!emailSent) {
                setFormError({
                    message: getAContent('cmp_vetonest.com_email_send_error') || "Failed to send email",
                    description: getAContent('cmp_vetonest.com_email_send_error_details') || "Please check your network connection and try again.",
                    type: 'error'
                });
                setLoading(false);
                setSendingDisabled(false);
                return;
            }

            // Open verification modal
            setLoading(false);
            setIsModalOpen(true);

        } catch (error) {
            console.error("Password reset error:", error);
            setFormError({
                message: getAContent('cmp_vetonest.com_error_occurred') || "An error occurred",
                description: getAContent('cmp_vetonest.com_try_again_later') || "Please try again later.",
                type: 'error'
            });
            setLoading(false);
            setSendingDisabled(false);
        }
    };

    // Handle code verification
    const handleCodeComplete = async (code) => {
        if (generatedCode !== code) {
            setDisplayCodeIncorrect(true);
            setDisplayCodeCorrect(false);
            setEmailVerificationResult(false);
            message.error(getAContent('cmp_vetonest.com_code_incorrect') || "Invalid verification code");
            return;
        }

        setDisplayCodeCorrect(true);
        setDisplayCodeIncorrect(false);
        setEmailVerificationResult(true);
        message.success(getAContent('cmp_vetonest.com_code_correct') || "Code verified successfully!");

        // Close modal and navigate to reset page
        setTimeout(() => {
            setIsModalOpen(false);
            setVerificationCode(generatedCode);
            setVerificationUserId(userId);
            navigate(`/mot-de-passe-oublie/reset/${generatedCode}/${userId}`);
        }, 1500);
    };

    // Resend verification code with rate limiting
    const handleResendCode = async () => {
        if (!email) return;

        // Check if user has exceeded max resend attempts
        if (resendCount >= MAX_RESEND_ATTEMPTS) {
            message.error(
                getAContent('cmp_vetonest.com_code_resend_limit_reached') || 
                "You have reached the maximum number of code requests. Please try again later."
            );
            return;
        }

        // Check cooldown
        if (resendCooldown > 0) {
            message.error(
                getAContent('cmp_vetonest.com_code_resend_cooldown') || 
                `Please wait ${resendCooldown} seconds before requesting another code.`
            );
            return;
        }

        setDisplayCodeIncorrect(false);
        setDisplayCodeCorrect(false);
        
        // Increment resend count
        setResendCount(prev => prev + 1);
        
        // Start cooldown
        setResendCooldown(COOLDOWN_SECONDS);
        const interval = setInterval(() => {
            setResendCooldown(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        
        const genCode = await generateRandomDigits(6);
        setGeneratedCode(genCode);

        const isFrench = siteLocale?.startsWith('fr');
        const subject = isFrench
            ? `Réinitialisez votre mot de passe - ${siteName}`
            : `Reset Your Password - ${siteName}`;
        
        const domainName = email.split('@')[1];
        
        const sendEmailData = {
            to_email: email,
            to_domain: domainName,
            subject: subject,
            userName: '',
            siteName: siteName,
            siteDomain: siteDomain,
            siteEmail: siteEmail,
            siteUrl: siteUrl,
            code: insertSpaceAtPosition(genCode, 3),
            emailTemplate: 'password_forgot',
            siteLocale: siteLocale,  // Pass the locale to template
            timezone: 'Europe/Paris',
        };

        const emailSent = await sendEmail(sendEmailData);
        
        if (emailSent) {
            message.success(getAContent('cmp_vetonest.com_code_resent') || "Verification code resent!");
        } else {
            message.error(getAContent('cmp_vetonest.com_code_resend_failed') || "Failed to resend code. Please try again.");
        }
    };

    return (
        <>
            {/* Verification Code Modal */}
            <Modal
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={450}
                maskClosable={false}
                closable={true}
                centered
                styles={{
                    body: {
                        padding: '24px',
                        background: 'transparent'
                    },
                    content: {
                        background: '#fff',
                        borderRadius: '16px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                    }
                }}
            >
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        backgroundColor: '#FFDE59',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 16
                    }}>
                        <MailOutlined style={{ fontSize: 28, color: '#000' }} />
                    </div>
                    
                    <h3 style={{ margin: '0 0 8px 0', fontSize: 20, fontWeight: 600 }}>
                        {getAContent('cmp_vetonest.com_WCfOc17hne') || "Email Verification"}
                    </h3>
                    
                    <p style={{ margin: '0 0 24px 0', color: '#666', fontSize: 14 }}>
                        {getAContent('cmp_vetonest.com_Xzm3u4t1uE') || "We've sent a verification code to"}
                        <br />
                        <strong style={{ color: '#000', fontSize: 15 }}>{email}</strong>
                    </p>

                    <InputCode
                        length={6}
                        label={getAContent('cmp_vetonest.com_code_label') || "Enter verification code"}
                        loading={loading}
                        onComplete={handleCodeComplete}
                        autoFocus
                    />

                    {displayCodeCorrect && (
                        <Alert
                            message={getAContent('cmp_vetonest.com_MnveaCfq6X') || "Code verified successfully!"}
                            type="success"
                            showIcon
                            style={{ marginTop: 16, textAlign: 'left' }}
                        />
                    )}
                    
                    {displayCodeIncorrect && (
                        <Alert
                            message={getAContent('cmp_vetonest.com_2NbkrLN1Nt') || "Invalid verification code"}
                            description={getAContent('cmp_vetonest.com_code_incorrect_details') || "Please check your code and try again."}
                            type="error"
                            showIcon
                            style={{ marginTop: 16, textAlign: 'left' }}
                        />
                    )}
                    
                    <div style={{ marginTop: 24 }}>
                        <span style={{ color: '#666', marginRight: 8 }}>
                            {getAContent('cmp_vetonest.com_didnt_receive_code') || "Didn't receive the code?"}
                        </span>
                        <Button 
                            type="link" 
                            onClick={handleResendCode}
                            style={{ padding: 0, color: '#000', fontWeight: 500 }}
                            disabled={resendCooldown > 0}
                        >
                            {resendCooldown > 0 
                                ? `${getAContent('cmp_vetonest.com_PlOAvkzjQx') || "Resend code"} (${resendCooldown}s)`
                                : (getAContent('cmp_vetonest.com_PlOAvkzjQx') || "Resend code")
                            }
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Main Password Reset Form */}
            <div className="sticky-stack">
                <Header />
                <Title title={getAContent('cmp_vetonest.com_Y9LbvGXMq2') || "Forgot Password"} />
            </div>

            <div style={{ minHeight: 'calc(100vh - 300px)', display: 'flex', alignItems: 'center', padding: '40px 0' }}>
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-xl-5 col-lg-6 col-md-8">
                            <div style={{ 
                                background: '#fff', 
                                borderRadius: 16, 
                                padding: '32px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                            }}>
                                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                                    <div style={{
                                        width: 64,
                                        height: 64,
                                        borderRadius: '50%',
                                        backgroundColor: '#FFF8E1',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: 16
                                    }}>
                                        <MailOutlined style={{ fontSize: 32, color: '#FFDE59' }} />
                                    </div>
                                    <h2 style={{ marginBottom: 8, fontSize: 24, fontWeight: 600 }}>
                                        {getAContent('cmp_vetonest.com_JwgqTDF9g7') || "Reset Password"}
                                    </h2>
                                    <p style={{ color: '#666', marginBottom: 0, fontSize: 14 }}>
                                        {getAContent('cmp_vetonest.com_reset_password_instruction') || 
                                         "Enter your email address and we'll send you a verification code to reset your password."}
                                    </p>
                                </div>

                                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                                    {formError && (
                                        <Form.Item>
                                            <Alert
                                                message={formError.message}
                                                description={formError.description}
                                                type={formError.type}
                                                showIcon
                                                closable
                                                onClose={() => setFormError(null)}
                                            />
                                        </Form.Item>
                                    )}

                                    <Form.Item
                                        label={getAContent('cmp_vetonest.com_4LbLKwutmz') || "Email Address"}
                                        name="email"
                                        rules={[
                                            { required: true, message: getAContent('cmp_vetonest.com_EjMb0Ci9C6') || "Please enter your email address" },
                                            {
                                                validator: (_, value) => {
                                                    if (value && !isValidEmail(value)) {
                                                        return Promise.reject(
                                                            getAContent('cmp_vetonest.com_GomedYOvSx') || "Please enter a valid email address"
                                                        );
                                                    }
                                                    return Promise.resolve();
                                                }
                                            }
                                        ]}
                                    >
                                        <Input
                                            id="pwForgotEmailInput"
                                            readOnly={!ready}
                                            autoComplete="email"
                                            size="large"
                                            placeholder={getAContent('cmp_vetonest.com_Xep3PSNstf') || "your@email.com"}
                                            style={{ height: 48 }}
                                            prefix={<MailOutlined style={{ color: '#999' }} />}
                                        />
                                    </Form.Item>

                                    <Form.Item>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            block
                                            size="large"
                                            disabled={sendingDisabled}
                                            style={{ 
                                                height: 48, 
                                                backgroundColor: '#000000', 
                                                color: '#fff',
                                                fontWeight: 500,
                                                border: 'none',
                                                marginTop: 10,
                                            }}
                                        >
                                            <Space>
                                                {loading && <Spin indicator={<LoadingOutlined spin style={{ color: '#fff' }} />} />}
                                                {getAContent('cmp_vetonest.com_f8Pqk3fJ2H') || "Send Reset Link"}
                                            </Space>
                                        </Button>
                                    </Form.Item>

                                    <div style={{ textAlign: 'center' }}>
                                        <Link to='/connexion' style={{ color: '#666' }}>
                                            <ArrowLeftOutlined /> {getAContent('cmp_vetonest.com_back_to_login') || "Back to Login"}
                                        </Link>
                                    </div>
                                </Form>
                            </div>

                            <div style={{ textAlign: 'center', marginTop: 24 }}>
                                <span style={{ color: '#666', marginRight: 8 }}>
                                    {getAContent('cmp_vetonest.com_5aIWA6DiGq') || "Already have an account?"}
                                </span>
                                <Link to='/connexion' className="text-primary">
                                    {getAContent('cmp_vonetest.com_J50yit0tKU') || "Sign in"}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
};

export default PasswordForgot;