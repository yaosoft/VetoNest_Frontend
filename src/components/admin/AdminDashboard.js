// src/components/Admin/AdminDashboard.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Row, Col, message, Avatar, Spin } from "antd";
import { 
  UserOutlined, 
  SafetyOutlined
} from "@ant-design/icons";
import HeaderDashboard from "../HeaderDashboard";
import Footer from "../Footer";
import Title from "../Title";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin is logged in
    const isAdminLoggedIn = localStorage.getItem('admin_logged_in');
    const storedAdminData = localStorage.getItem('admin_data');
    
    if (!isAdminLoggedIn || isAdminLoggedIn !== 'true' || !storedAdminData) {
      message.error('Accès non autorisé. Veuillez vous connecter.');
      navigate('/admin/login');
      return;
    }
    
    const parsedData = JSON.parse(storedAdminData);
    if (parsedData.profileTypeId !== 3) {
      message.error('Accès non autorisé. Droits administrateur requis.');
      navigate('/admin/login');
      return;
    }
    
    setAdminData(parsedData);
    setLoading(false);
  }, [navigate]);

  if (loading) {
    return (
      <>
        <HeaderDashboard />
        <div style={{
          minHeight: 'calc(100vh - 200px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Spin size="large" />
          <span style={{ marginLeft: 16 }}>Chargement...</span>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <div className="sticky-stack">
        <HeaderDashboard />
        <Title title="Tableau de bord administrateur" />
      </div>

      <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Welcome Header without Logout Button */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '32px', 
          flexWrap: 'wrap', 
          gap: '16px',
          background: '#fff',
          padding: '24px',
          borderRadius: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 600 }}>
              Bienvenue, {adminData?.firstName || adminData?.username}
            </h1>
            <p style={{ color: '#666', marginTop: '8px', marginBottom: 0 }}>
              Panneau d'administration
            </p>
          </div>
          <div>
            <Avatar 
              icon={<UserOutlined />} 
              style={{ backgroundColor: '#FFDE59', color: '#333' }}
            />
          </div>
        </div>

        {/* Admin Info Card */}
        <Card 
          title={
            <span>
              <SafetyOutlined style={{ marginRight: '8px', color: '#FFDE59' }} />
              Informations administrateur
            </span>
          }
          style={{ borderRadius: '12px' }}
        >
          <Row gutter={[24, 16]}>
            <Col xs={24} sm={12}>
              <p><strong>Nom d'utilisateur :</strong> {adminData?.username}</p>
              <p><strong>Email :</strong> {adminData?.email}</p>
            </Col>
            <Col xs={24} sm={12}>
              <p><strong>Nom complet :</strong> {adminData?.firstName} {adminData?.lastName}</p>
              <p><strong>Rôle :</strong> <span style={{ color: '#FFDE59', fontWeight: 600 }}>Administrateur</span></p>
            </Col>
          </Row>
        </Card>
      </div>

      <Footer />
    </>
  );
};

export default AdminDashboard;