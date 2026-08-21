// src/components/Admin/AdminRouteGuard.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spin, message } from 'antd';
import HeaderDashboard from '../HeaderDashboard';
import Footer from '../Footer';

const AdminRouteGuard = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAdminAuth = () => {
            const isAdminLoggedIn = localStorage.getItem('admin_logged_in');
            const adminData = localStorage.getItem('admin_data');
            const storedAdminData = adminData ? JSON.parse(adminData) : null;
            
            if (isAdminLoggedIn === 'true' && storedAdminData && storedAdminData.profileTypeId === 3) {
                setIsAdmin(true);
            } else {
                localStorage.removeItem('admin_logged_in');
                localStorage.removeItem('admin_data');
                localStorage.removeItem('admin_remember');
                localStorage.removeItem('admin_username');
                message.error('Session expirée. Veuillez vous reconnecter.');
                navigate('/admin/login');
            }
            setLoading(false);
        };
        
        checkAdminAuth();
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
                    <span style={{ marginLeft: 16 }}>Vérification des droits d'accès...</span>
                </div>
                <Footer />
            </>
        );
    }

    return isAdmin ? children : null;
};

export default AdminRouteGuard;