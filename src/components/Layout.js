import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User, CreditCard, FileText, PlusCircle, History } from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: FileText },
    { path: '/create', label: 'Create CV', icon: PlusCircle },
    { path: '/history', label: 'History', icon: History },
    { path: '/credits', label: 'Credits', icon: CreditCard },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'white',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        padding: '0 20px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '70px'
        }}>
          {/* Logo */}
          <div
            onClick={() => navigate('/dashboard')}
            style={{
              fontSize: '24px',
              fontWeight: '300',
              letterSpacing: '1px',
              color: '#1a1a1a',
              cursor: 'pointer'
            }}
          >
            CV RESUMER
          </div>

          {/* Navigation */}
          <nav style={{ display: 'flex', gap: '30px' }}>
            {navItems.map(({ path, label, icon: Icon }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'none',
                  border: 'none',
                  fontSize: '14px',
                  color: location.pathname === path ? '#4a90e2' : '#666',
                  cursor: 'pointer',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  transition: 'all 0.2s',
                  fontWeight: location.pathname === path ? '500' : '400'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f8f9fa';
                  e.target.style.color = '#4a90e2';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = location.pathname === path ? '#4a90e2' : '#666';
                }}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </nav>

          {/* User Menu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {/* Credits Display */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#e8f5e8',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '14px',
              color: '#2e7d32'
            }}>
              <CreditCard size={14} />
              {user?.credits || 0} credits
            </div>

            {/* User Info */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px',
              borderRadius: '8px',
              backgroundColor: '#f8f9fa'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#4a90e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                {user?.email?.charAt(0).toUpperCase() || <User size={16} />}
              </div>
              <div style={{ fontSize: '14px', color: '#333' }}>
                {user?.email}
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'none',
                border: '1px solid #ddd',
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '14px',
                color: '#666',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#ff4757';
                e.target.style.color = '#ff4757';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#ddd';
                e.target.style.color = '#666';
              }}
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '30px 20px'
      }}>
        {children}
      </main>
    </div>
  );
};

export default Layout;