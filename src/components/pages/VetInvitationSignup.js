// src/components/VetInvitationSignup/VetInvitationSignup.js
import React, { useState, useEffect, useContext } from "react";
import { Form, Input, Button, Card, Spin, Result, message, Row, Col } from "antd";
import { LockOutlined, MailOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from 'react-router-dom';
import { SiteContext } from "../../context/site";

import Header from '../Header';
import Footer from '../Footer';
import Title from '../Title';

const VetInvitationSignup = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { checkVetInvitation, completeVetInvitation } = useContext(SiteContext);

    const [form] = Form.useForm();
    const [checking, setChecking] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [invitation, setInvitation] = useState(null); // { nom, prenom, phone, email }
    const [invalidReason, setInvalidReason] = useState(null);

    const token = new URLSearchParams(location.search).get('token');

    useEffect(() => {
        if (!token) {
            setInvalidReason("Ce lien d'invitation est incomplet.");
            setChecking(false);
            return;
        }

        (async () => {
            const data = await checkVetInvitation(token);
            if (data && data.valid) {
                setInvitation(data);
                form.setFieldsValue({ email: data.email || undefined });
            } else {
                setInvalidReason(data?.message || "Ce lien d'invitation n'est plus valide.");
            }
            setChecking(false);
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const handleSubmit = async (values) => {
        setSubmitting(true);
        try {
            const response = await completeVetInvitation({
                token,
                email: values.email,
                password: values.password,
            });

            if (response.success) {
                message.success('Votre compte a été créé avec succès !');
                navigate('/connexion');
            } else {
                message.error(response.message || "Impossible de créer le compte");
            }
        } catch (error) {
            console.error('Error completing signup:', error);
            message.error("Une erreur est survenue, veuillez réessayer");
        } finally {
            setSubmitting(false);
        }
    };

    if (checking) {
        return (
            <>
                <Header />
                <div style={{
                    minHeight: 'calc(100vh - 200px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <Spin size="large" />
                    <span style={{ marginLeft: 16 }}>Vérification de votre invitation...</span>
                </div>
                <Footer />
            </>
        );
    }

    if (invalidReason) {
        return (
            <>
                <Header />
                <div style={{ maxWidth: '600px', margin: '80px auto', padding: '0 20px' }}>
                    <Result
                        status="warning"
                        title="Lien d'invitation invalide"
                        subTitle={invalidReason}
                        extra={
                            <Button type="primary" onClick={() => navigate('/')}>
                                Retour à l'accueil
                            </Button>
                        }
                    />
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <div className="sticky-stack">
                <Header />
                <Title title="Créer votre compte vétérinaire" />
            </div>

            <div style={{ maxWidth: '520px', margin: '40px auto', padding: '0 20px 60px' }}>
                <Card style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                    <p style={{ color: '#666', marginBottom: '24px' }}>
                        Bienvenue {invitation?.prenom || ''} {invitation?.nom} ! Vous avez été ajouté(e)
                        comme vétérinaire sur VetoNest. Créez un mot de passe pour activer votre compte
                        et gérer votre profil.
                    </p>

                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                    >
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item label="Nom">
                                    <Input value={invitation?.nom} disabled prefix={<UserOutlined />} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Prénom">
                                    <Input value={invitation?.prenom} disabled prefix={<UserOutlined />} />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item label="Téléphone">
                            <Input value={invitation?.phone} disabled />
                        </Form.Item>

                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[
                                { required: true, message: 'Votre email est requis' },
                                { type: 'email', message: 'Adresse email invalide' },
                            ]}
                        >
                            <Input prefix={<MailOutlined />} placeholder="vous@exemple.com" />
                        </Form.Item>

                        <Form.Item
                            label="Mot de passe"
                            name="password"
                            rules={[
                                { required: true, message: 'Le mot de passe est requis' },
                                { min: 8, message: 'Au moins 8 caractères' },
                            ]}
                            hasFeedback
                        >
                            <Input.Password prefix={<LockOutlined />} placeholder="8 caractères minimum" />
                        </Form.Item>

                        <Form.Item
                            label="Confirmer le mot de passe"
                            name="passwordConfirm"
                            dependencies={['password']}
                            hasFeedback
                            rules={[
                                { required: true, message: 'Veuillez confirmer votre mot de passe' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('password') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Les mots de passe ne correspondent pas'));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password prefix={<LockOutlined />} placeholder="Retapez le mot de passe" />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={submitting}
                                block
                                style={{
                                    background: '#FFDE59',
                                    borderColor: '#FFDE59',
                                    color: '#333',
                                    fontWeight: 600,
                                    height: '44px',
                                    borderRadius: '8px',
                                }}
                            >
                                Créer mon compte
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </div>

            <Footer />
        </>
    );
};

export default VetInvitationSignup;