// src/components/Admin/AdminLogin.js
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Input, Button, Card, message, Alert, Spin } from "antd";
import { UserOutlined, LockOutlined, SafetyOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { API_CONFIG } from "../../config/api";
import Title from "../Title";
import Header from "../Header";
import Footer from "../Footer";

const BASE_API_URL = API_CONFIG.base_api_url;

const AdminLogin = () => {
  const [loading, setLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Check if already logged in as admin
  useEffect(() => {
    const storedAdmin = localStorage.getItem('admin_logged_in');
    const storedAdminData = localStorage.getItem('admin_data');
    
    if (storedAdmin === 'true' && storedAdminData) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  // Get stored login attempts
  useEffect(() => {
    const storedAttempts = localStorage.getItem('admin_login_attempts');
    const storedLockTime = localStorage.getItem('admin_login_lock_until');
    
    if (storedAttempts) {
      setLoginAttempts(parseInt(storedAttempts));
    }
    
    if (storedLockTime && new Date().getTime() < parseInt(storedLockTime)) {
      setIsLocked(true);
      const remainingTime = Math.ceil((parseInt(storedLockTime) - new Date().getTime()) / 60000);
      message.error(`Trop de tentatives échouées. Réessayez dans ${remainingTime} minutes.`);
      
      const timer = setTimeout(() => {
        setIsLocked(false);
        localStorage.removeItem('admin_login_attempts');
        localStorage.removeItem('admin_login_lock_until');
        setLoginAttempts(0);
      }, parseInt(storedLockTime) - new Date().getTime());
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleLogin = async (values) => {
    if (isLocked) {
      message.error('Compte temporairement verrouillé. Veuillez réessayer plus tard.');
      return;
    }

    setLoading(true);
    
    try {
      const { username, password, remember } = values;
      
      const url = `${BASE_API_URL}admin/login`;
      const loginData = { username, password };
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData)
      });
      
      const data = await response.json();
      
      if (response.ok && data.success === true) {
        const adminData = data.data;
        
        localStorage.setItem('admin_logged_in', 'true');
        localStorage.setItem('admin_data', JSON.stringify(adminData));
        
        if (remember) {
          localStorage.setItem('admin_remember', 'true');
          localStorage.setItem('admin_username', username);
        } else {
          localStorage.removeItem('admin_remember');
          localStorage.removeItem('admin_username');
        }
        
        localStorage.removeItem('admin_login_attempts');
        localStorage.removeItem('admin_login_lock_until');
        
        message.success('Bienvenue dans le panneau d\'administration');
        navigate('/admin/dashboard');
      } else {
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        localStorage.setItem('admin_login_attempts', newAttempts.toString());
        
        const remainingAttempts = 5 - newAttempts;
        
        if (newAttempts >= 5) {
          const lockUntil = new Date().getTime() + (15 * 60 * 1000);
          localStorage.setItem('admin_login_lock_until', lockUntil.toString());
          setIsLocked(true);
          message.error('Trop de tentatives échouées. Compte verrouillé pour 15 minutes.');
        } else {
          message.error(`Identifiants incorrects. ${remainingAttempts} tentative(s) restante(s).`);
        }
      }
    } catch (error) {
      console.error('Admin login error:', error);
      message.error('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const rememberedUsername = localStorage.getItem('admin_username');

  return (
    <>
      <div className="sticky-stack">
        <Header />
        <Title title="Connexion administrateur" />
      </div>

      <div className="admin-login-container" style={{
        minHeight: 'calc(100vh - 200px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
      }}>
        <Card
          style={{
            width: '100%',
            maxWidth: '450px',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}
          bodyStyle={{ padding: '32px' }}
        >
          {/* Logo/Brand */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '70px',
              height: '70px',
              background: '#FFDE59',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <SafetyOutlined style={{ fontSize: '36px', color: '#333' }} />
            </div>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600, color: '#fff' }}>
              Panneau d'administration
            </h2>
            <p style={{ color: '#aaa', marginTop: '8px' }}>
              Veuillez saisir vos identifiants administrateur
            </p>
          </div>

          {isLocked && (
            <Alert
              message="Compte temporairement verrouillé"
              description="Trop de tentatives de connexion échouées. Veuillez réessayer dans 15 minutes."
              type="error"
              showIcon
              style={{ marginBottom: '24px' }}
            />
          )}

          <Form
            form={form}
            name="admin_login"
            onFinish={handleLogin}
            layout="vertical"
            size="large"
            initialValues={{
              username: rememberedUsername || '',
            }}
          >
            <Form.Item
              name="username"
              label="Nom d'utilisateur"
              rules={[
                { required: true, message: 'Veuillez saisir votre nom d\'utilisateur' },
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#999' }} />}
                placeholder="admin"
                autoComplete="off"
                disabled={isLocked}
                size="large"
                style={{ borderRadius: '8px' }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Mot de passe"
              rules={[{ required: true, message: 'Veuillez saisir votre mot de passe' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#999' }} />}
                placeholder="••••••••"
                disabled={isLocked}
                size="large"
                style={{ borderRadius: '8px' }}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                disabled={isLocked}
                style={{
                  width: '100%',
                  background: '#FFDE59',
                  borderColor: '#FFDE59',
                  color: '#333',
                  fontWeight: 600,
                  height: '48px',
                  fontSize: '16px',
                  borderRadius: '8px'
                }}
              >
                Se connecter
              </Button>
            </Form.Item>

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <Link to="/" style={{ color: '#FFDE59' }}>
                <ArrowLeftOutlined /> Retour au site
              </Link>
            </div>

            {loginAttempts > 0 && loginAttempts < 5 && !isLocked && (
              <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: '#aaa' }}>
                ⚠️ {5 - loginAttempts} tentative(s) restante(s)
              </div>
            )}
          </Form>
        </Card>
      </div>

      <Footer />
    </>
  );
};

export default AdminLogin;