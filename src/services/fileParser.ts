import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export interface ParsedCVData {
  rawText: string;
  sections: {
    personalInfo?: any;
    objective?: string;
    experience?: any[];
    education?: any[];
    skills?: string[];
    languages?: string[];
  };
}

export const parsePDF = async (buffer: Buffer): Promise<ParsedCVData> => {
  try {
    const data = await pdfParse(buffer);
    const rawText = data.text;
    
    return {
      rawText,
      sections: extractSections(rawText)
    };
  } catch (error) {
    throw new Error(`PDF parsing failed: ${error}`);
  }
};

export const parseDocx = async (buffer: Buffer): Promise<ParsedCVData> => {
  try {
    const result = await mammoth.extractRawText({ buffer });
    const rawText = result.value;
    
    return {
      rawText,
      sections: extractSections(rawText)
    };
  } catch (error) {
    throw new Error(`DOCX parsing failed: ${error}`);
  }
};

// Basic text analysis to extract sections
const extractSections = (text: string) => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  const sections: any = {
    personalInfo: {},
    objective: '',
    experience: [],
    education: [],
    skills: [],
    languages: []
  };

  // Extract email
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const emailMatch = text.match(emailRegex);
  if (emailMatch) {
    sections.personalInfo.email = emailMatch[0];
  }

  // Extract phone
  const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/;
  const phoneMatch = text.match(phoneRegex);
  if (phoneMatch) {
    sections.personalInfo.phone = phoneMatch[0];
  }

  // Extract skills (look for skills section)
  const skillsSection = findSection(lines, ['skills', 'competencies', 'technical skills']);
  if (skillsSection.length > 0) {
    sections.skills = skillsSection;
  }

  // Extract experience (look for experience section)
  const experienceSection = findSection(lines, ['experience', 'work experience', 'employment', 'professional experience']);
  if (experienceSection.length > 0) {
    sections.experience = experienceSection;
  }

  // Extract education (look for education section)
  const educationSection = findSection(lines, ['education', 'academic background', 'qualifications']);
  if (educationSection.length > 0) {
    sections.education = educationSection;
  }

  return sections;
};

const findSection = (lines: string[], keywords: string[]): string[] => {
  const sectionLines: string[] = [];
  let inSection = false;
  let sectionFound = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    
    // Check if this line is a section header
    if (keywords.some(keyword => line.includes(keyword))) {
      inSection = true;
      sectionFound = true;
      continue;
    }
    
    // Check if we hit another section header (stop collecting)
    if (inSection && isLikelyHeader(line)) {
      break;
    }
    
    // Collect lines if we're in the section
    if (inSection && lines[i].length > 0) {
      sectionLines.push(lines[i]);
    }
  }

  return sectionLines;
};

const isLikelyHeader = (line: string): boolean => {
  const headers = [
    'objective', 'summary', 'experience', 'education', 'skills', 
    'languages', 'certifications', 'projects', 'awards', 'interests'
  ];
  
  return headers.some(header => 
    line.includes(header) && line.length < 50
  );
};