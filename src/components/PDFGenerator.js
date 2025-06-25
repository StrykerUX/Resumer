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

      // Create canvas from HTML
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight
      });

      // Calculate PDF dimensions
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('portrait', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Calculate scaling to fit content on page
      const ratio = Math.min(pdfWidth / (imgWidth * 0.264583), pdfHeight / (imgHeight * 0.264583));
      const finalWidth = imgWidth * 0.264583 * ratio;
      const finalHeight = imgHeight * 0.264583 * ratio;
      
      // Center the content
      const x = (pdfWidth - finalWidth) / 2;
      const y = 10; // Small top margin

      pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
      
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