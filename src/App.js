import React from 'react';
import CVTemplate from './components/CVTemplate';
import PDFGenerator from './components/PDFGenerator';
import { cvData } from './data/cvData';
import './styles/cv.css';

function App() {
  return (
    <div className="App">
      <div style={{ 
        padding: '20px', 
        maxWidth: '900px', 
        margin: '0 auto',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '30px',
          padding: '30px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <h1 style={{ 
            margin: '0 0 15px 0', 
            fontSize: '28px',
            fontWeight: '300',
            letterSpacing: '1px',
            color: '#1a1a1a'
          }}>
            CV RESUMER
          </h1>
          <p style={{ 
            margin: '0 0 25px 0', 
            fontSize: '16px', 
            color: '#4a4a4a',
            fontWeight: '400'
          }}>
            Elegant, ATS-optimized resume for WordPress & Elementor Web Designer
          </p>
          
          <PDFGenerator 
            targetId="cv-content" 
            filename="Abraham_Almazan_CV_Web_Designer_WordPress_Elementor" 
          />
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          overflow: 'hidden'
        }}>
          <CVTemplate data={cvData} />
        </div>

        <div style={{
          marginTop: '30px',
          padding: '25px',
          backgroundColor: '#f8f9fa',
          borderRadius: '12px',
          fontSize: '14px',
          border: '1px solid #e9ecef'
        }}>
          <h3 style={{ 
            margin: '0 0 15px 0',
            fontSize: '18px',
            fontWeight: '400',
            color: '#2a2a2a'
          }}>
            Design & ATS Optimizations
          </h3>
          <ul style={{ 
            margin: '0', 
            paddingLeft: '20px',
            lineHeight: '1.6',
            color: '#4a4a4a'
          }}>
            <li>Elegant minimalist design demonstrating visual hierarchy expertise</li>
            <li>WordPress & Elementor Pro skills prominently featured</li>
            <li>C1 English certification and bilingual capabilities highlighted</li>
            <li>Project management tools (ClickUp) experience included</li>
            <li>Responsive design and usability competencies showcased</li>
            <li>Service-based website experience emphasized</li>
            <li>Central Time availability clearly stated</li>
            <li>ATS-compatible structure with sophisticated typography</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;