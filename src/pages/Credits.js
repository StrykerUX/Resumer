import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CreditCard, Zap, CheckCircle, Star } from 'lucide-react';

const Credits = () => {
  const { user } = useAuth();

  const plans = [
    {
      name: 'Starter Pack',
      credits: 5,
      price: 9.99,
      description: 'Perfect for job seekers',
      features: [
        'AI-powered CV optimization',
        'Job-specific adaptations',
        'ATS-compatible formatting',
        'PDF downloads'
      ],
      popular: false
    },
    {
      name: 'Professional',
      credits: 15,
      price: 24.99,
      description: 'Best value for active job hunters',
      features: [
        'Everything in Starter',
        'Priority AI processing',
        'Advanced recommendations',
        'Multiple template options',
        'Email support'
      ],
      popular: true
    },
    {
      name: 'Premium',
      credits: 30,
      price: 44.99,
      description: 'For career professionals',
      features: [
        'Everything in Professional',
        'Unlimited revisions',
        'Personal branding advice',
        'LinkedIn profile optimization',
        'Priority support'
      ],
      popular: false
    }
  ];

  const usageHistory = [];

  return (
    <div>
      <div style={{
        marginBottom: '30px'
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '300',
          color: '#1a1a1a',
          margin: '0 0 10px 0'
        }}>
          Credits & Billing
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#666',
          margin: 0
        }}>
          Manage your credits and upgrade your plan
        </p>
      </div>

      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '30px',
        marginBottom: '30px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '30px'
      }}>
        <div style={{
          textAlign: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#4a90e2',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 15px auto',
            fontSize: '32px',
            fontWeight: '600'
          }}>
            {user?.credits || 0}
          </div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '500',
            color: '#1a1a1a',
            margin: '0 0 5px 0'
          }}>
            Available Credits
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#666',
            margin: 0
          }}>
            Current plan: {user?.plan || 'Free'}
          </p>
        </div>

        <div style={{
          textAlign: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#28a745',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 15px auto'
          }}>
            <Zap size={32} />
          </div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '500',
            color: '#1a1a1a',
            margin: '0 0 5px 0'
          }}>
            Credits Used
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#666',
            margin: 0
          }}>
            {3 - (user?.credits || 0)} this month
          </p>
        </div>

        <div style={{
          textAlign: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#ffc107',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 15px auto'
          }}>
            <CreditCard size={32} />
          </div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '500',
            color: '#1a1a1a',
            margin: '0 0 5px 0'
          }}>
            Next Billing
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#666',
            margin: 0
          }}>
            Free plan
          </p>
        </div>
      </div>

      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '30px',
        marginBottom: '30px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '400',
          color: '#1a1a1a',
          margin: '0 0 20px 0',
          textAlign: 'center'
        }}>
          Purchase Credits
        </h2>
        <p style={{
          fontSize: '16px',
          color: '#666',
          margin: '0 0 40px 0',
          textAlign: 'center'
        }}>
          Choose a credit package that works for you
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '25px'
        }}>
          {plans.map((plan, index) => (
            <div
              key={index}
              style={{
                border: plan.popular ? '2px solid #4a90e2' : '1px solid #e9ecef',
                borderRadius: '12px',
                padding: '30px',
                position: 'relative',
                backgroundColor: plan.popular ? '#f8fcff' : '#fff',
                transition: 'all 0.2s'
              }}
            >
              {plan.popular && (
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: '#4a90e2',
                  color: 'white',
                  padding: '5px 20px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <Star size={12} />
                  POPULAR
                </div>
              )}

              <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#1a1a1a',
                  margin: '0 0 10px 0'
                }}>
                  {plan.name}
                </h3>
                <div style={{
                  fontSize: '36px',
                  fontWeight: '700',
                  color: '#4a90e2',
                  margin: '0 0 5px 0'
                }}>
                  ${plan.price}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#666',
                  margin: '0 0 10px 0'
                }}>
                  {plan.credits} credits
                </div>
                <p style={{
                  fontSize: '14px',
                  color: '#666',
                  margin: 0
                }}>
                  {plan.description}
                </p>
              </div>

              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: '0 0 30px 0'
              }}>
                {plan.features.map((feature, featureIndex) => (
                  <li
                    key={featureIndex}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginBottom: '10px',
                      fontSize: '14px',
                      color: '#333'
                    }}
                  >
                    <CheckCircle size={16} color="#28a745" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                style={{
                  width: '100%',
                  backgroundColor: plan.popular ? '#4a90e2' : 'transparent',
                  color: plan.popular ? 'white' : '#4a90e2',
                  border: plan.popular ? 'none' : '1px solid #4a90e2',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Purchase Credits
              </button>
            </div>
          ))}
        </div>
      </div>

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
          Usage History
        </h2>

        {usageHistory.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#666'
          }}>
            <CreditCard size={48} color="#ddd" style={{ margin: '0 auto 15px auto', display: 'block' }} />
            <p style={{ margin: 0 }}>No usage history yet. Start creating CVs to see your activity here.</p>
          </div>
        ) : (
          <div>
            {/* Usage history table would go here */}
          </div>
        )}
      </div>
    </div>
  );
};

export default Credits;