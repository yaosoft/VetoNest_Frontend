import React, { useState, useContext } from "react";
import { useNavigate, useParams, Link } from 'react-router-dom';
import { AuthContext } from "../../context/AuthProvider";
import { SiteContext } from "../../context/site";
import { Space, Spin, Button, message, Form, Input } from 'antd';
import { LoadingOutlined, LockOutlined, ArrowLeftOutlined, CheckCircleOutlined } from '@ant-design/icons';
import Header from '../Header';
import Footer from '../Footer';
import Title from '../Title';

const PasswordForgotReset = () => {
    // The code and userId that used to arrive in the URL decided nothing: the
    // server never saw them. Authorisation is the reset token instead.
    const { code, userId } = useParams();
    const { isValidPassword } = useContext(AuthContext);
    const { getAContent, siteLocale, updatePassword, passwordResetToken, setPasswordResetToken } = useContext(SiteContext);
    
    const [loading, setLoading] = useState(false);
    const [sendingDisabled, setSendingDisabled] = useState(false);
    const [resetSuccess, setResetSuccess] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();
    
    const isFrench = siteLocale?.startsWith('fr');
    
    // Password validation
    const validatePassword = (_, value) => {
        if (!value) {
            return Promise.reject(
                getAContent('cmp_vetonest.com_7cAD5u6fyj') || 
                (isFrench ? "Le mot de passe est requis" : "Password is required")
            );
        }
        const validation = isValidPassword(value);
        if (validation !== true) {
            return Promise.reject(
                getAContent('cmp_vetonest.com_UcvWQuFUwO') || 
                (isFrench 
                    ? "Le mot de passe doit contenir 6 à 100 caractères, des lettres majuscules et minuscules, et au moins un chiffre."
                    : "Password must be 6 to 100 characters long, uppercase and lowercase letters, and at least one number.")
            );
        }
        return Promise.resolve();
    };
    
    // Confirm password validation
    const validateConfirmPassword = (_, value) => {
        if (!value) {
            return Promise.reject(
                isFrench ? "Veuillez confirmer votre mot de passe" : "Please confirm your password"
            );
        }
        if (value !== form.getFieldValue('newPassword')) {
            return Promise.reject(
                isFrench ? "Les mots de passe ne correspondent pas" : "Passwords do not match"
            );
        }
        return Promise.resolve();
    };
    
    // Handle form submission
    const handleSubmit = async (values) => {
        setLoading(true);
        setSendingDisabled(true);
        
        try {
            // The token identifies the account; there is nothing here for a
            // caller to point at someone else's.
            const result = await updatePassword({
                password: values.newPassword,
                resetToken: passwordResetToken,
            });

            if (result && result.success) {
                setPasswordResetToken('');
                setResetSuccess(true);
                message.success(
                    isFrench 
                        ? "Votre mot de passe a été réinitialisé avec succès !"
                        : "Your password has been successfully reset!"
                );
                
                // Redirect to login page after 3 seconds
                setTimeout(() => {
                    navigate('/connexion');
                }, 3000);
            } else {
                message.error(
                    isFrench
                        ? "Code de vérification invalide ou expiré. Veuillez recommencer le processus."
                        : "Invalid or expired verification code. Please restart the process."
                );
            }
        } catch (error) {
            console.error("Password reset error:", error);
            message.error(
                isFrench
                    ? "Une erreur s'est produite. Veuillez réessayer plus tard."
                    : "An error occurred. Please try again later."
            );
        } finally {
            setLoading(false);
            setSendingDisabled(false);
        }
    };
    
    // If reset is successful, show success message
    if (resetSuccess) {
        return (
            <>
                <div className="sticky-stack">
                    <Header />
                    <Title title={isFrench ? "Mot de passe réinitialisé" : "Password Reset"} />
                </div>
                
                <div style={{ minHeight: 'calc(100vh - 300px)', display: 'flex', alignItems: 'center', padding: '40px 0' }}>
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-xl-5 col-lg-6 col-md-8">
                                <div style={{ 
                                    background: '#fff', 
                                    borderRadius: 16, 
                                    padding: '48px 32px',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                    textAlign: 'center'
                                }}>
                                    <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a', marginBottom: 24 }} />
                                    <h2 style={{ marginBottom: 16 }}>
                                        {isFrench ? "Mot de passe réinitialisé !" : "Password Reset Successfully!"}
                                    </h2>
                                    <p style={{ color: '#666', marginBottom: 32 }}>
                                        {isFrench 
                                            ? "Votre mot de passe a été modifié. Vous allez être redirigé vers la page de connexion."
                                            : "Your password has been changed. You will be redirected to the login page."}
                                    </p>
                                    <Button 
                                        type="primary"
                                        onClick={() => navigate('/connexion')}
                                        style={{ 
                                            backgroundColor: '#000000', 
                                            color: '#fff',
                                            height: 48,
                                            padding: '0 32px'
                                        }}
                                    >
                                        {isFrench ? "Se connecter" : "Sign In"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <Footer />
            </>
        );
    }
    
    return (
        <>
            <div className="sticky-stack">
                <Header />
                <Title title={isFrench ? "Réinitialisation du mot de passe" : "Reset Password"} />
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
                                        <LockOutlined style={{ fontSize: 32, color: '#FFDE59' }} />
                                    </div>
                                    <h2 style={{ marginBottom: 8, fontSize: 24, fontWeight: 600 }}>
                                        {isFrench ? "Nouveau mot de passe" : "New Password"}
                                    </h2>
                                    <p style={{ color: '#666', marginBottom: 0, fontSize: 14 }}>
                                        {isFrench 
                                            ? "Veuillez créer un nouveau mot de passe pour votre compte."
                                            : "Please create a new password for your account."}
                                    </p>
                                </div>
                                
                                <Form
                                    form={form}
                                    layout="vertical"
                                    onFinish={handleSubmit}
                                >
                                    <Form.Item
                                        label={isFrench ? "Nouveau mot de passe" : "New Password"}
                                        name="newPassword"
                                        rules={[{ validator: validatePassword }]}
                                    >
                                        <Input.Password
                                            size="large"
                                            placeholder={isFrench ? "Entrez votre nouveau mot de passe" : "Enter your new password"}
                                            style={{ height: 48 }}
                                            prefix={<LockOutlined style={{ color: '#999' }} />}
                                        />
                                    </Form.Item>
                                    
                                    <Form.Item
                                        label={isFrench ? "Confirmer le mot de passe" : "Confirm Password"}
                                        name="confirmPassword"
                                        dependencies={['newPassword']}
                                        rules={[{ validator: validateConfirmPassword }]}
                                    >
                                        <Input.Password
                                            size="large"
                                            placeholder={isFrench ? "Confirmez votre nouveau mot de passe" : "Confirm your new password"}
                                            style={{ height: 48 }}
                                            prefix={<LockOutlined style={{ color: '#999' }} />}
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
                                                {isFrench ? "Réinitialiser le mot de passe" : "Reset Password"}
                                            </Space>
                                        </Button>
                                    </Form.Item>
                                    
                                    <div style={{ textAlign: 'center' }}>
                                        <Link to='/connexion' style={{ color: '#666' }}>
                                            <ArrowLeftOutlined /> {isFrench ? "Retour à la connexion" : "Back to Login"}
                                        </Link>
                                    </div>
                                </Form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <Footer />
        </>
    );
};

export default PasswordForgotReset;