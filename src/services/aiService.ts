import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export interface JobAnalysis {
  keyRequirements: string[];
  skillsRequired: string[];
  experienceLevel: string;
  industryKeywords: string[];
  companyCulture: string;
  roleType: string;
}

export interface CVOptimization {
  optimizedCV: any;
  changes: string[];
  matchScore: number;
  reasoning: string;
}

export const analyzeJobOffer = async (jobDescription: string): Promise<JobAnalysis> => {
  try {
    const prompt = `
Analyze this job description and extract key information:

Job Description:
${jobDescription}

Please provide a detailed analysis in the following JSON format:
{
  "keyRequirements": ["requirement1", "requirement2", ...],
  "skillsRequired": ["skill1", "skill2", ...],
  "experienceLevel": "entry/mid/senior",
  "industryKeywords": ["keyword1", "keyword2", ...],
  "companycultura": "description of company culture",
  "roleType": "technical/managerial/creative/sales/etc"
}

Focus on extracting the most important elements that would be relevant for CV optimization.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert recruiter and career coach. Analyze job descriptions thoroughly and extract key information that would be useful for CV optimization."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
    });

    const analysis = JSON.parse(response.choices[0].message.content || '{}');
    return analysis;

  } catch (error) {
    console.error('Job analysis error:', error);
    throw new Error('Failed to analyze job description');
  }
};

export const optimizeCV = async (
  originalCV: any,
  jobAnalysis: JobAnalysis,
  jobDescription: string
): Promise<CVOptimization> => {
  try {
    const prompt = `
You are an expert recruiter and career coach. Your task is to optimize a CV to maximize the probability of getting hired for a specific job position.

ORIGINAL CV DATA:
${JSON.stringify(originalCV, null, 2)}

JOB DESCRIPTION:
${jobDescription}

JOB ANALYSIS:
${JSON.stringify(jobAnalysis, null, 2)}

INSTRUCTIONS:
1. Analyze the original CV and the job requirements
2. Optimize the CV to better match the job requirements while maintaining authenticity
3. Reorder sections and experiences to highlight most relevant information first
4. Adjust descriptions using keywords from the job posting
5. Emphasize achievements and experiences that match the job requirements
6. DO NOT invent or fabricate any experience - only reorganize and rephrase existing information
7. Make the CV appear naturally tailored for this specific position

Provide your response in this exact JSON format:
{
  "optimizedCV": {
    // The complete optimized CV structure with all sections
  },
  "changes": [
    "List of specific changes made",
    "Each change explained clearly"
  ],
  "matchScore": 85, // Score from 0-100 indicating how well the optimized CV matches the job
  "reasoning": "Explanation of the optimization strategy and why these changes improve the match"
}

Make sure the optimized CV looks natural and not obviously tailored. The goal is to present the candidate's existing experience in the best possible light for this specific role.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert CV optimizer. Your goal is to help candidates present their existing experience in the best possible way for specific job opportunities while maintaining complete authenticity."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.4,
    });

    const optimization = JSON.parse(response.choices[0].message.content || '{}');
    return optimization;

  } catch (error) {
    console.error('CV optimization error:', error);
    throw new Error('Failed to optimize CV');
  }
};