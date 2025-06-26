import React from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const PDFGenerator = ({ targetId = 'cv-content', filename = 'Abraham_Almazan_CV_Web_Designer' }) => {
  const generatePDF = async () => {
    const element = document.getElementById(targetId);
    
    if (!element) {
      alert('CV content not found!');
      return;
    }

    try {
      // Set loading state
      const button = document.querySelector('.pdf-download-btn');
      const originalText = button.textContent;
      button.textContent = 'Generating PDF...';
      button.disabled = true;

      // Create canvas from HTML with optimized settings
      const canvas = await html2canvas(element, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight,
        letterRendering: true,
        logging: false
      });

      // Progressive compression to ensure file size under 5MB
      let imgData;
      let quality = 0.85;
      const maxSizeMB = 5;
      
      do {
        imgData = canvas.toDataURL('image/jpeg', quality);
        
        // Estimate file size (base64 to bytes approximation)
        const estimatedSizeBytes = (imgData.length * 3) / 4;
        const estimatedSizeMB = estimatedSizeBytes / (1024 * 1024);
        
        console.log(`PDF Quality: ${Math.round(quality * 100)}%, Estimated size: ${estimatedSizeMB.toFixed(2)}MB`);
        
        if (estimatedSizeMB <= maxSizeMB) {
          break;
        }
        
        quality -= 0.1;
        
        if (quality < 0.3) {
          console.warn('Minimum quality reached, proceeding with current compression');
          break;
        }
      } while (true);
      
      // Create PDF with dynamic height to fit all content
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Convert pixels to mm
      const pdfWidth = imgWidth * 0.264583;
      const pdfHeight = imgHeight * 0.264583;
      
      // Create PDF with custom dimensions to fit content
      const pdf = new jsPDF('portrait', 'mm', [pdfWidth, pdfHeight]);
      
      // Add image to fill entire PDF
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      
      // Save the PDF
      pdf.save(`${filename}.pdf`);

      // Reset button state
      button.textContent = originalText;
      button.disabled = false;
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
      
      // Reset button state
      const button = document.querySelector('.pdf-download-btn');
      button.textContent = 'Download CV as PDF';
      button.disabled = false;
    }
  };

  return (
    <div className="pdf-generator">
      <button 
        onClick={generatePDF}
        className="pdf-download-btn"
        style={{
          padding: '15px 35px',
          fontSize: '14px',
          fontWeight: '500',
          backgroundColor: '#1a1a1a',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          margin: '20px 0',
          display: 'block',
          marginLeft: 'auto',
          marginRight: 'auto',
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          transition: 'all 0.3s ease',
          boxShadow: '0 2px 10px rgba(0,0,0,0.15)'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#2a2a2a';
          e.target.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = '#1a1a1a';
          e.target.style.transform = 'translateY(0)';
        }}
      >
        Download CV as PDF
      </button>
      <p style={{ 
        textAlign: 'center', 
        fontSize: '13px', 
        color: '#5a5a5a',
        margin: '10px 0',
        fontWeight: '400'
      }}>
        Generate your elegantly designed, ATS-optimized resume
      </p>
    </div>
  );
};

export default PDFGenerator;