import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { generateRecommendations, calculateCVScore } from '../services/recommendationService';

const prisma = new PrismaClient();

export const getRecommendations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Get user's CV data
    const cv = await prisma.cV.findFirst({
      where: { userId },
      select: {
        id: true,
        parsedData: true,
        originalFilename: true
      }
    });

    if (!cv || !cv.parsedData) {
      return res.status(404).json({
        error: 'No CV data found. Please upload a CV first.'
      });
    }

    // Generate recommendations
    const recommendations = generateRecommendations(cv.parsedData as any);
    const score = calculateCVScore(recommendations);

    // Categorize recommendations
    const categorized = {
      critical: recommendations.filter(r => r.type === 'critical'),
      important: recommendations.filter(r => r.type === 'important'),
      suggestions: recommendations.filter(r => r.type === 'suggestion')
    };

    // Generate summary
    const summary = {
      totalRecommendations: recommendations.length,
      criticalIssues: categorized.critical.length,
      importantIssues: categorized.important.length,
      suggestions: categorized.suggestions.length,
      score: score,
      scoreGrade: getScoreGrade(score)
    };

    res.json({
      message: 'CV recommendations generated successfully',
      cvId: cv.id,
      filename: cv.originalFilename,
      summary,
      recommendations: categorized,
      nextSteps: getNextSteps(score, categorized)
    });

  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getScoreGrade = (score: number): string => {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Good';
  if (score >= 70) return 'Average';
  if (score >= 60) return 'Below Average';
  return 'Needs Improvement';
};

const getNextSteps = (score: number, categorized: any): string[] => {
  const steps: string[] = [];

  if (categorized.critical.length > 0) {
    steps.push('Address all critical issues first - these significantly impact your CV\'s effectiveness');
  }

  if (categorized.important.length > 0) {
    steps.push('Fix important issues to improve your CV\'s professional appeal');
  }

  if (score < 70) {
    steps.push('Consider using our AI optimization feature to adapt your CV for specific job opportunities');
  }

  if (categorized.suggestions.length > 0) {
    steps.push('Review suggestions for additional improvements');
  }

  if (steps.length === 0) {
    steps.push('Great job! Your CV looks good. Try our AI optimization for specific job applications');
  }

  return steps;
};