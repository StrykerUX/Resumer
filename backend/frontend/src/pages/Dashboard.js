import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, FileText, Upload, Zap, Download, Clock, CreditCard } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats] = useState({
    totalCVs: 0,
    creditsUsed: 0,
    lastGenerated: null
  });

  const quickActions = [
    {
      icon: Upload,
      title: 'Upload CV',
      description: 'Upload your existing CV and get recommendations',
      action: () => navigate('/create'),
      color: '#4a90e2'
    },
    {
      icon: Zap,
      title: 'AI Adaptation',
      description: 'Adapt your CV to a specific job posting',
      action: () => navigate('/create?step=job'),
      color: '#7b68ee'
    },
    {
      icon: FileText,
      title: 'Create from Scratch',
      description: 'Build a new CV with our guided form',
      action: () => navigate('/create?step=form'),
      color: '#28a745'
    }
  ];

  return (
    <div>
      {/* Welcome Section */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '30px',
        marginBottom: '30px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '300',
          color: '#1a1a1a',
          margin: '0 0 10px 0'
        }}>
          Welcome back!
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#666',
          margin: '0 0 20px 0'
        }}>
          Ready to create your next professional CV? Let's get started.
        </p>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginTop: '25px'
        }}>
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '10px',
            border: '1px solid #e9ecef'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '8px'
            }}>
              <CreditCard size={20} color="#4a90e2" />
              <span style={{ fontSize: '14px', color: '#666' }}>Available Credits</span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a1a' }}>
              {user?.credits || 0}
            </div>
          </div>

          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '10px',
            border: '1px solid #e9ecef'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '8px'
            }}>
              <FileText size={20} color="#28a745" />
              <span style={{ fontSize: '14px', color: '#666' }}>CVs Generated</span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a1a' }}>
              {stats.totalCVs}
            </div>
          </div>

          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '10px',
            border: '1px solid #e9ecef'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '8px'
            }}>
              <Clock size={20} color="#ffc107" />
              <span style={{ fontSize: '14px', color: '#666' }}>Last Activity</span>
            </div>
            <div style={{ fontSize: '16px', fontWeight: '500', color: '#1a1a1a' }}>
              {stats.lastGenerated || 'No activity yet'}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '30px',
        marginBottom: '30px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '400',
          color: '#1a1a1a',
          margin: '0 0 20px 0'
        }}>
          Quick Actions
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          {quickActions.map((action, index) => (
            <div
              key={index}
              onClick={action.action}
              style={{
                border: '1px solid #e9ecef',
                borderRadius: '10px',
                padding: '25px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: '#fff'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = action.color;
                e.target.style.boxShadow = `0 4px 20px ${action.color}20`;
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#e9ecef';
                e.target.style.boxShadow = 'none';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                marginBottom: '15px'
              }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '10px',
                  backgroundColor: `${action.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <action.icon size={24} color={action.color} />
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '500',
                  color: '#1a1a1a',
                  margin: 0
                }}>
                  {action.title}
                </h3>
              </div>
              <p style={{
                fontSize: '14px',
                color: '#666',
                margin: 0,
                lineHeight: '1.5'
              }}>
                {action.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Get Started Guide */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '30px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '400',
          color: '#1a1a1a',
          margin: '0 0 20px 0'
        }}>
          How it works
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '25px'
        }}>
          {[
            {
              step: '1',
              title: 'Upload or Create',
              description: 'Upload your existing CV or fill out our guided form to create one from scratch.'
            },
            {
              step: '2',
              title: 'Get Recommendations',
              description: 'Our AI analyzes your CV and provides intelligent recommendations for improvement.'
            },
            {
              step: '3',
              title: 'Adapt to Jobs',
              description: 'Paste a job description and let our AI adapt your CV to match the requirements.'
            },
            {
              step: '4',
              title: 'Download & Apply',
              description: 'Download your optimized, ATS-compatible CV and start applying with confidence.'
            }
          ].map((step, index) => (
            <div key={index} style={{
              textAlign: 'center',
              padding: '20px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#4a90e2',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 15px auto',
                fontSize: '18px',
                fontWeight: '600'
              }}>
                {step.step}
              </div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '500',
                color: '#1a1a1a',
                margin: '0 0 10px 0'
              }}>
                {step.title}
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#666',
                margin: 0,
                lineHeight: '1.5'
              }}>
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div style={{
          textAlign: 'center',
          marginTop: '30px'
        }}>
          <button
            onClick={() => navigate('/create')}
            style={{
              backgroundColor: '#4a90e2',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#3a80d2'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#4a90e2'}
          >
            <PlusCircle size={18} />
            Create Your First CV
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;