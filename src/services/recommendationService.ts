interface CVData {
  rawText?: string;
  sections?: any;
  personalInfo?: any;
  experience?: any[];
  education?: any[];
  skills?: string[];
  languages?: string[];
}

interface Recommendation {
  type: 'critical' | 'important' | 'suggestion';
  category: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
}

export const generateRecommendations = (cvData: CVData): Recommendation[] => {
  const recommendations: Recommendation[] = [];
  const { rawText = '', sections = {}, personalInfo = {} } = cvData;

  // 1. Contact Information Analysis
  if (!personalInfo.email) {
    recommendations.push({
      type: 'critical',
      category: 'Contact Info',
      title: 'Missing Email Address',
      description: 'Add a professional email address to ensure recruiters can contact you.',
      impact: 'high'
    });
  }

  if (!personalInfo.phone) {
    recommendations.push({
      type: 'important',
      category: 'Contact Info',
      title: 'Missing Phone Number',
      description: 'Include a phone number for direct contact opportunities.',
      impact: 'medium'
    });
  }

  // 2. Length Analysis
  const wordCount = rawText.split(/\s+/).length;
  if (wordCount < 150) {
    recommendations.push({
      type: 'critical',
      category: 'Content Length',
      title: 'CV Too Short',
      description: 'Your CV appears too brief. Aim for 300-600 words to adequately showcase your experience.',
      impact: 'high'
    });
  } else if (wordCount > 800) {
    recommendations.push({
      type: 'important',
      category: 'Content Length',
      title: 'CV Too Long',
      description: 'Consider condensing your CV. Recruiters prefer concise, focused content.',
      impact: 'medium'
    });
  }

  // 3. Skills Section Analysis
  const skillsText = sections.skills?.join(' ') || '';
  if (!skillsText || skillsText.length < 10) {
    recommendations.push({
      type: 'important',
      category: 'Skills',
      title: 'Missing or Weak Skills Section',
      description: 'Add a comprehensive skills section with relevant technical and soft skills.',
      impact: 'high'
    });
  }

  // 4. Action Verbs Analysis
  const actionVerbs = [
    'achieved', 'managed', 'led', 'developed', 'created', 'implemented', 
    'improved', 'increased', 'reduced', 'launched', 'delivered', 'designed',
    'built', 'established', 'optimized', 'streamlined', 'coordinated'
  ];
  
  const hasActionVerbs = actionVerbs.some(verb => 
    rawText.toLowerCase().includes(verb)
  );

  if (!hasActionVerbs) {
    recommendations.push({
      type: 'important',
      category: 'Content Quality',
      title: 'Use Strong Action Verbs',
      description: 'Start bullet points with action verbs like "achieved", "managed", "developed" to show impact.',
      impact: 'medium'
    });
  }

  // 5. Quantifiable Achievements Analysis
  const hasNumbers = /\d+%|\d+\+|\$\d+|\d+ years|\d+ months/.test(rawText);
  if (!hasNumbers) {
    recommendations.push({
      type: 'important',
      category: 'Achievements',
      title: 'Add Quantifiable Results',
      description: 'Include numbers, percentages, or metrics to demonstrate your achievements and impact.',
      impact: 'high'
    });
  }

  // 6. Professional Summary Analysis
  const hasSummary = rawText.toLowerCase().includes('summary') || 
                    rawText.toLowerCase().includes('objective') ||
                    rawText.toLowerCase().includes('profile');
  
  if (!hasSummary) {
    recommendations.push({
      type: 'suggestion',
      category: 'Structure',
      title: 'Add Professional Summary',
      description: 'Include a brief professional summary at the top to quickly communicate your value proposition.',
      impact: 'medium'
    });
  }

  // 7. Experience Section Analysis
  const experienceText = sections.experience?.join(' ') || '';
  if (!experienceText || experienceText.length < 50) {
    recommendations.push({
      type: 'critical',
      category: 'Experience',
      title: 'Insufficient Work Experience Details',
      description: 'Expand your work experience section with more detailed job descriptions and achievements.',
      impact: 'high'
    });
  }

  // 8. Education Section Analysis
  const educationText = sections.education?.join(' ') || '';
  if (!educationText || educationText.length < 20) {
    recommendations.push({
      type: 'important',
      category: 'Education',
      title: 'Missing Education Information',
      description: 'Include your educational background with degrees, institutions, and graduation dates.',
      impact: 'medium'
    });
  }

  // 9. Keyword Density Analysis
  const commonBusinessKeywords = [
    'project', 'team', 'leadership', 'management', 'analysis', 'strategy',
    'client', 'customer', 'solution', 'process', 'results', 'collaboration'
  ];

  const keywordCount = commonBusinessKeywords.filter(keyword =>
    rawText.toLowerCase().includes(keyword)
  ).length;

  if (keywordCount < 3) {
    recommendations.push({
      type: 'suggestion',
      category: 'Keywords',
      title: 'Include More Business Keywords',
      description: 'Add relevant industry keywords to improve ATS (Applicant Tracking System) compatibility.',
      impact: 'medium'
    });
  }

  // 10. Format Consistency Check
  const hasInconsistentDates = /\d{4}-\d{4}/.test(rawText) && /\d{2}\/\d{4}/.test(rawText);
  if (hasInconsistentDates) {
    recommendations.push({
      type: 'suggestion',
      category: 'Formatting',
      title: 'Standardize Date Formats',
      description: 'Use consistent date formatting throughout your CV (e.g., "2020-2023" or "Jan 2020 - Mar 2023").',
      impact: 'low'
    });
  }

  // Sort recommendations by priority
  return recommendations.sort((a, b) => {
    const priorityOrder = { critical: 3, important: 2, suggestion: 1 };
    return priorityOrder[b.type] - priorityOrder[a.type];
  });
};

export const calculateCVScore = (recommendations: Recommendation[]): number => {
  const maxScore = 100;
  let deductions = 0;

  recommendations.forEach(rec => {
    switch (rec.type) {
      case 'critical':
        deductions += rec.impact === 'high' ? 20 : 15;
        break;
      case 'important':
        deductions += rec.impact === 'high' ? 15 : 10;
        break;
      case 'suggestion':
        deductions += rec.impact === 'medium' ? 5 : 3;
        break;
    }
  });

  return Math.max(0, maxScore - deductions);
};