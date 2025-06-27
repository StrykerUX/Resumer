export interface CVTemplate {
  personalInfo?: {
    fullName?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    website?: string;
  };
  objective?: string;
  experience?: any[];
  education?: any[];
  skills?: string[];
  languages?: string[];
}

export const generateHTMLFromCV = (cvData: CVTemplate): string => {
  const {
    personalInfo = {},
    objective = '',
    experience = [],
    education = [],
    skills = [],
    languages = []
  } = cvData;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CV - ${personalInfo.fullName || 'Resume'}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            background: white;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #2c3e50;
            padding-bottom: 20px;
        }
        
        .header h1 {
            color: #2c3e50;
            font-size: 2.2em;
            margin-bottom: 10px;
            font-weight: bold;
        }
        
        .contact-info {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 15px;
            margin-top: 10px;
        }
        
        .contact-item {
            background: #ecf0f1;
            padding: 5px 10px;
            border-radius: 5px;
            font-size: 0.9em;
        }
        
        .section {
            margin-bottom: 25px;
        }
        
        .section h2 {
            color: #2c3e50;
            font-size: 1.3em;
            margin-bottom: 15px;
            padding-bottom: 5px;
            border-bottom: 1px solid #bdc3c7;
        }
        
        .objective {
            font-style: italic;
            color: #555;
            margin-bottom: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-left: 4px solid #3498db;
        }
        
        .experience-item, .education-item {
            margin-bottom: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 5px;
        }
        
        .experience-item h3, .education-item h3 {
            color: #2c3e50;
            margin-bottom: 5px;
            font-size: 1.1em;
        }
        
        .experience-item .company, .education-item .institution {
            color: #7f8c8d;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .experience-item .date, .education-item .date {
            color: #95a5a6;
            font-size: 0.9em;
            margin-bottom: 10px;
        }
        
        .skills-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 10px;
        }
        
        .skill-item {
            background: #3498db;
            color: white;
            padding: 8px 12px;
            border-radius: 20px;
            text-align: center;
            font-size: 0.9em;
        }
        
        .languages-list {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }
        
        .language-item {
            background: #e74c3c;
            color: white;
            padding: 6px 12px;
            border-radius: 15px;
            font-size: 0.9em;
        }
        
        .list-item {
            margin-bottom: 8px;
            padding-left: 15px;
            position: relative;
        }
        
        .list-item:before {
            content: "•";
            color: #3498db;
            font-weight: bold;
            position: absolute;
            left: 0;
        }
        
        @media print {
            body {
                padding: 20px;
            }
            
            .header {
                margin-bottom: 20px;
            }
            
            .section {
                margin-bottom: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${personalInfo.fullName || 'Your Name'}</h1>
        <div class="contact-info">
            ${personalInfo.email ? `<div class="contact-item">📧 ${personalInfo.email}</div>` : ''}
            ${personalInfo.phone ? `<div class="contact-item">📞 ${personalInfo.phone}</div>` : ''}
            ${personalInfo.location ? `<div class="contact-item">📍 ${personalInfo.location}</div>` : ''}
            ${personalInfo.linkedin ? `<div class="contact-item">🔗 ${personalInfo.linkedin}</div>` : ''}
            ${personalInfo.website ? `<div class="contact-item">🌐 ${personalInfo.website}</div>` : ''}
        </div>
    </div>

    ${objective ? `
    <div class="section">
        <div class="objective">
            ${objective}
        </div>
    </div>
    ` : ''}

    ${experience.length > 0 ? `
    <div class="section">
        <h2>Professional Experience</h2>
        ${experience.map(exp => `
            <div class="experience-item">
                <h3>${exp.title || exp.position || 'Position'}</h3>
                <div class="company">${exp.company || 'Company'}</div>
                <div class="date">${exp.startDate || ''} ${exp.endDate ? '- ' + exp.endDate : '- Present'}</div>
                ${exp.description ? `<div class="list-item">${exp.description}</div>` : ''}
                ${exp.achievements ? exp.achievements.map((achievement: string) => `
                    <div class="list-item">${achievement}</div>
                `).join('') : ''}
            </div>
        `).join('')}
    </div>
    ` : ''}

    ${education.length > 0 ? `
    <div class="section">
        <h2>Education</h2>
        ${education.map(edu => `
            <div class="education-item">
                <h3>${edu.degree || edu.title || 'Degree'}</h3>
                <div class="institution">${edu.institution || edu.school || 'Institution'}</div>
                <div class="date">${edu.startDate || ''} ${edu.endDate ? '- ' + edu.endDate : ''}</div>
                ${edu.description ? `<div class="list-item">${edu.description}</div>` : ''}
            </div>
        `).join('')}
    </div>
    ` : ''}

    ${skills.length > 0 ? `
    <div class="section">
        <h2>Skills</h2>
        <div class="skills-grid">
            ${skills.map(skill => `
                <div class="skill-item">${skill}</div>
            `).join('')}
        </div>
    </div>
    ` : ''}

    ${languages.length > 0 ? `
    <div class="section">
        <h2>Languages</h2>
        <div class="languages-list">
            ${languages.map(lang => `
                <div class="language-item">${lang}</div>
            `).join('')}
        </div>
    </div>
    ` : ''}
</body>
</html>`;
};

export const generatePreviewHTML = (cvData: any): string => {
  // Extract CV data from either optimizedCV or parsedData structure
  let templateData: CVTemplate;

  if (cvData.optimizedCV) {
    // This is from AI optimization
    templateData = cvData.optimizedCV;
  } else if (cvData.sections) {
    // This is from parsed data
    templateData = cvData.sections;
  } else {
    // Direct CV data
    templateData = cvData;
  }

  return generateHTMLFromCV(templateData);
};