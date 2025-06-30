import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Upload, FileText, Zap, ChevronRight, ChevronLeft } from 'lucide-react';

const CreateCV = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(searchParams.get('step') || 'method');

  const steps = {
    method: 'Choose Method',
    upload: 'Upload CV',
    form: 'Basic Information',
    job: 'Job Description',
    review: 'Review & Generate'
  };

  const stepOrder = ['method', 'upload', 'form', 'job', 'review'];

  const nextStep = () => {
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  const renderStepIndicator = () => (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '40px',
      gap: '20px'
    }}>
      {stepOrder.map((step, index) => {
        const isActive = step === currentStep;
        const isCompleted = stepOrder.indexOf(currentStep) > index;
        
        return (
          <div
            key={step}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: isActive ? '#4a90e2' : isCompleted ? '#28a745' : '#e9ecef',
              color: isActive || isCompleted ? 'white' : '#666',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              {index + 1}
            </div>
            <span style={{
              fontSize: '14px',
              color: isActive ? '#4a90e2' : isCompleted ? '#28a745' : '#666',
              fontWeight: isActive ? '500' : '400'
            }}>
              {steps[step]}
            </span>
            {index < stepOrder.length - 1 && (
              <ChevronRight size={16} color="#ccc" style={{ marginLeft: '10px' }} />
            )}
          </div>
        );
      })}
    </div>
  );

  const renderMethodSelection = () => (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '40px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      textAlign: 'center'
    }}>
      <h2 style={{
        fontSize: '24px',
        fontWeight: '400',
        color: '#1a1a1a',
        margin: '0 0 30px 0'
      }}>
        How would you like to create your CV?
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '25px',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {[
          {
            icon: Upload,
            title: 'Upload Existing CV',
            description: 'Upload your current CV (PDF or Word) and get AI-powered recommendations for improvement',
            action: () => setCurrentStep('upload'),
            color: '#4a90e2'
          },
          {
            icon: FileText,
            title: 'Create from Scratch',
            description: 'Fill out our guided form to build a professional CV from the ground up',
            action: () => setCurrentStep('form'),
            color: '#28a745'
          },
          {
            icon: Zap,
            title: 'Job-Specific Adaptation',
            description: 'Start with a job description and create a perfectly tailored CV using AI',
            action: () => setCurrentStep('job'),
            color: '#7b68ee'
          }
        ].map((method, index) => (
          <div
            key={index}
            onClick={method.action}
            style={{
              border: '2px solid #e9ecef',
              borderRadius: '12px',
              padding: '30px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              backgroundColor: '#fff'
            }}
          >
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '12px',
              backgroundColor: `${method.color}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto'
            }}>
              <method.icon size={30} color={method.color} />
            </div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '500',
              color: '#1a1a1a',
              margin: '0 0 15px 0'
            }}>
              {method.title}
            </h3>
            <p style={{
              fontSize: '15px',
              color: '#666',
              margin: 0,
              lineHeight: '1.6'
            }}>
              {method.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderUploadStep = () => (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '40px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      textAlign: 'center'
    }}>
      <h2 style={{
        fontSize: '24px',
        fontWeight: '400',
        color: '#1a1a1a',
        margin: '0 0 20px 0'
      }}>
        Upload Your CV
      </h2>
      <p style={{
        fontSize: '16px',
        color: '#666',
        margin: '0 0 30px 0'
      }}>
        Upload your current CV and we'll analyze it for improvements
      </p>
      
      <div style={{
        border: '2px dashed #ddd',
        borderRadius: '12px',
        padding: '60px 40px',
        backgroundColor: '#fafafa'
      }}>
        <Upload size={48} color="#999" style={{ margin: '0 auto 20px auto', display: 'block' }} />
        <p style={{ fontSize: '16px', color: '#666', margin: '0 0 10px 0' }}>
          Drag and drop your CV here or click to browse
        </p>
        <p style={{ fontSize: '14px', color: '#999', margin: 0 }}>
          Supports PDF and Word documents (max 10MB)
        </p>
      </div>
    </div>
  );

  const renderNavigation = () => {
    if (currentStep === 'method') return null;
    
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '30px'
      }}>
        <button
          onClick={prevStep}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '12px 20px',
            fontSize: '14px',
            color: '#666',
            cursor: 'pointer'
          }}
        >
          <ChevronLeft size={16} />
          Back
        </button>
        
        <button
          onClick={nextStep}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#4a90e2',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 20px',
            fontSize: '14px',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          Continue
          <ChevronRight size={16} />
        </button>
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'method':
        return renderMethodSelection();
      case 'upload':
        return renderUploadStep();
      default:
        return (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '40px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            textAlign: 'center'
          }}>
            <h2>Step: {steps[currentStep]}</h2>
            <p>This step is under development. Coming soon!</p>
          </div>
        );
    }
  };

  return (
    <div>
      <div style={{
        textAlign: 'center',
        marginBottom: '40px'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '300',
          color: '#1a1a1a',
          margin: '0 0 10px 0'
        }}>
          Create Your CV
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#666',
          margin: 0
        }}>
          Let's build your professional CV step by step
        </p>
      </div>

      {renderStepIndicator()}
      {renderCurrentStep()}
      {renderNavigation()}
    </div>
  );
};

export default CreateCV;