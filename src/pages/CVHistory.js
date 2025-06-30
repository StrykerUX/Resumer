import React from 'react';
import { Download, Eye, Calendar, FileText } from 'lucide-react';

const CVHistory = () => {
  const cvHistory = [];

  const EmptyState = () => (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '60px 40px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      textAlign: 'center'
    }}>
      <FileText size={64} color="#ddd" style={{ margin: '0 auto 20px auto', display: 'block' }} />
      <h2 style={{
        fontSize: '24px',
        fontWeight: '400',
        color: '#1a1a1a',
        margin: '0 0 15px 0'
      }}>
        No CVs Generated Yet
      </h2>
      <p style={{
        fontSize: '16px',
        color: '#666',
        margin: '0 0 30px 0',
        maxWidth: '400px',
        marginLeft: 'auto',
        marginRight: 'auto'
      }}>
        Once you create your first CV, you'll be able to view, download, and manage all your generated CVs from here.
      </p>
      <button
        onClick={() => window.location.href = '/create'}
        style={{
          backgroundColor: '#4a90e2',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '12px 24px',
          fontSize: '16px',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'background-color 0.2s'
        }}
      >
        Create Your First CV
      </button>
    </div>
  );

  if (cvHistory.length === 0) {
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
            CV History
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#666',
            margin: 0
          }}>
            View and manage all your generated CVs
          </p>
        </div>
        
        <EmptyState />
      </div>
    );
  }

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
          CV History
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#666',
          margin: 0
        }}>
          View and manage all your generated CVs
        </p>
      </div>

      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '20px 30px',
          borderBottom: '1px solid #e9ecef',
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr',
          gap: '20px',
          fontSize: '14px',
          fontWeight: '600',
          color: '#666',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          <div>CV Name</div>
          <div>Created</div>
          <div>Type</div>
          <div>Actions</div>
        </div>

        {cvHistory.map((cv, index) => (
          <div
            key={index}
            style={{
              padding: '20px 30px',
              borderBottom: index < cvHistory.length - 1 ? '1px solid #f5f5f5' : 'none',
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr',
              gap: '20px',
              alignItems: 'center'
            }}
          >
            <div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '500',
                color: '#1a1a1a',
                margin: '0 0 5px 0'
              }}>
                {cv.name}
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#666',
                margin: 0
              }}>
                {cv.jobTitle || 'General CV'}
              </p>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              color: '#666'
            }}>
              <Calendar size={16} />
              {cv.createdAt}
            </div>
            
            <div>
              <span style={{
                backgroundColor: cv.type === 'ai-adapted' ? '#e8f5e8' : '#f0f8ff',
                color: cv.type === 'ai-adapted' ? '#2e7d32' : '#1976d2',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                {cv.type === 'ai-adapted' ? 'AI Adapted' : 'Standard'}
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              gap: '10px'
            }}>
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  backgroundColor: 'transparent',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  color: '#666',
                  cursor: 'pointer'
                }}
              >
                <Eye size={14} />
                Preview
              </button>
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  backgroundColor: '#4a90e2',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                <Download size={14} />
                Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CVHistory;