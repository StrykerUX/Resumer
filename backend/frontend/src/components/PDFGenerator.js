import React from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const PDFGenerator = ({ targetId = 'cv-content', filename = 'Abraham_Almazan_CV_Web_Designer' }) => {
  
  // Extract structured text from CV DOM for ATS compatibility
  const extractCVText = (element) => {
    const textData = {
      personalInfo: {},
      sections: []
    };

    // Extract personal information
    const header = element.querySelector('.cv-header');
    if (header) {
      textData.personalInfo.name = header.querySelector('.name')?.textContent || '';
      textData.personalInfo.title = header.querySelector('.title')?.textContent || '';
      
      const contactItems = header.querySelectorAll('.contact-item');
      textData.personalInfo.contact = Array.from(contactItems).map(item => item.textContent.trim());
    }

    // Extract sections in order
    const sections = element.querySelectorAll('.cv-section');
    sections.forEach(section => {
      const sectionTitle = section.querySelector('.section-title')?.textContent || '';
      const sectionData = { title: sectionTitle, content: [] };

      // Handle different section types
      if (sectionTitle.includes('SUMMARY')) {
        const summaryText = section.querySelector('.summary-text')?.textContent || '';
        sectionData.content.push(summaryText);
      } 
      else if (sectionTitle.includes('EXPERTISE')) {
        const skillCategories = section.querySelectorAll('.skills-category');
        skillCategories.forEach(category => {
          const categoryTitle = category.querySelector('.skills-subtitle')?.textContent || '';
          const skills = Array.from(category.querySelectorAll('.skill-item')).map(skill => skill.textContent.trim());
          sectionData.content.push(`${categoryTitle}: ${skills.join(', ')}`);
        });
      }
      else if (sectionTitle.includes('EXPERIENCE')) {
        const experiences = section.querySelectorAll('.experience-item');
        experiences.forEach(exp => {
          const jobTitle = exp.querySelector('.job-title')?.textContent || '';
          const company = exp.querySelector('.company')?.textContent || '';
          const period = exp.querySelector('.job-period')?.textContent || '';
          const location = exp.querySelector('.job-location')?.textContent || '';
          const achievements = Array.from(exp.querySelectorAll('.achievement-item')).map(item => item.textContent.trim());
          
          sectionData.content.push(`${jobTitle} | ${company} | ${period} | ${location}`);
          achievements.forEach(achievement => sectionData.content.push(`• ${achievement}`));
        });
      }
      else if (sectionTitle.includes('PROJECTS')) {
        const projects = section.querySelectorAll('.project-item');
        projects.forEach(project => {
          const projectName = project.querySelector('.project-name')?.textContent || '';
          const technologies = project.querySelector('.project-technologies')?.textContent || '';
          const description = project.querySelector('.project-description')?.textContent || '';
          
          sectionData.content.push(`${projectName} - Technologies: ${technologies}`);
          sectionData.content.push(description);
        });
      }
      else {
        // Generic section handling
        const items = section.querySelectorAll('li, .language-item, .certification-item');
        if (items.length > 0) {
          items.forEach(item => {
            sectionData.content.push(item.textContent.trim());
          });
        } else {
          // Fallback to all text content
          const textContent = section.textContent.replace(/\s+/g, ' ').trim();
          if (textContent) sectionData.content.push(textContent);
        }
      }

      textData.sections.push(sectionData);
    });

    return textData;
  };

  // Add invisible text layer over PDF image for ATS compatibility
  const addInvisibleTextLayer = (pdf, textData, pdfWidth, pdfHeight) => {
    // Set completely invisible text properties
    pdf.setTextColor(0, 0, 0, 0); // Completely transparent text
    pdf.setFontSize(0.1); // Extremely small font size
    
    // Position text outside visible area but still parseable
    const invisibleX = pdfWidth + 10; // Outside the visible PDF area
    let yPosition = 20;
    const lineHeight = 1;
    
    // Create a structured text dump for ATS parsing
    let fullText = '';
    
    // Add personal info
    if (textData.personalInfo.name) {
      fullText += textData.personalInfo.name + '\n';
    }
    if (textData.personalInfo.title) {
      fullText += textData.personalInfo.title + '\n';
    }
    
    // Add contact info
    textData.personalInfo.contact?.forEach(contact => {
      fullText += contact + '\n';
    });
    
    fullText += '\n';
    
    // Add sections
    textData.sections.forEach(section => {
      fullText += section.title + '\n';
      section.content.forEach(content => {
        fullText += content + '\n';
      });
      fullText += '\n';
    });
    
    // Split text into small chunks and place outside visible area
    const textLines = fullText.split('\n');
    textLines.forEach((line, index) => {
      if (line.trim()) {
        // Place text completely outside the visible area
        pdf.text(line, invisibleX, yPosition + (index * lineHeight));
      }
    });
  };

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

      // Extract text data before generating image for ATS compatibility
      const textData = extractCVText(element);
      console.log('Extracted CV text data:', textData);

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
      
      // Add invisible text layer for ATS compatibility
      addInvisibleTextLayer(pdf, textData, pdfWidth, pdfHeight);
      
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
        Generate your elegantly designed resume with invisible text layer for perfect ATS compatibility
      </p>
    </div>
  );
};

export default PDFGenerator;