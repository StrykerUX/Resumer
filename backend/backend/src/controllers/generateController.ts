import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { analyzeJobOffer, optimizeCV } from '../services/aiService';
import { deductCredits } from '../middleware/credits';
import { jobDescriptionSchema, createValidationResponse, sanitizeString } from '../utils/validation';

const prisma = new PrismaClient();

export const analyzeJob = async (req: AuthRequest, res: Response) => {
  try {
    // Validate input data with Zod
    const validationResult = jobDescriptionSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json(createValidationResponse(validationResult.error));
    }

    const { jobDescription: rawJobDescription } = validationResult.data;
    
    // Sanitize input
    const jobDescription = sanitizeString(rawJobDescription);

    // Analyze the job description
    const analysis = await analyzeJobOffer(jobDescription);

    res.json({
      message: 'Job description analyzed successfully',
      analysis,
      next_step: 'Use /api/generate/adapt-cv to optimize your CV for this job'
    });

  } catch (error) {
    console.error('Analyze job error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze job description',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const adaptCV = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { jobDescription } = req.body;

    if (!jobDescription || jobDescription.trim().length < 50) {
      return res.status(400).json({
        error: 'Job description is required and must be at least 50 characters long'
      });
    }

    // Get user's CV
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
        error: 'No CV found. Please upload a CV first.'
      });
    }

    // Analyze job description
    const jobAnalysis = await analyzeJobOffer(jobDescription);

    // Optimize CV using AI
    const optimization = await optimizeCV(cv.parsedData, jobAnalysis, jobDescription);

    // Create a new generation record
    const generation = await prisma.generation.create({
      data: {
        userId,
        cvId: cv.id,
        jobDescription,
        optimizedData: {
          jobAnalysis: jobAnalysis as any,
          optimization: optimization as any,
          originalCV: cv.parsedData,
          timestamp: new Date().toISOString()
        } as any,
        creditsUsed: 1,
        status: 'completed',
        completedAt: new Date()
      }
    });

    // Deduct credits after successful generation
    const remainingCredits = await deductCredits(userId, 1);

    res.json({
      message: 'CV successfully adapted for the job position',
      generationId: generation.id,
      jobAnalysis,
      optimizedCV: optimization.optimizedCV,
      changes: optimization.changes,
      matchScore: optimization.matchScore,
      reasoning: optimization.reasoning,
      creditsUsed: 1,
      remainingCredits,
      previewUrl: `/api/cv/preview/${generation.id}`,
      downloadUrl: `/api/cv/download/${generation.id}`
    });

  } catch (error) {
    console.error('Adapt CV error:', error);
    res.status(500).json({ 
      error: 'Failed to adapt CV',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getGeneration = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { generationId } = req.params;

    const generation = await prisma.generation.findFirst({
      where: {
        id: generationId,
        userId
      },
      include: {
        cv: {
          select: {
            originalFilename: true
          }
        }
      }
    });

    if (!generation) {
      return res.status(404).json({
        error: 'Generation not found'
      });
    }

    res.json({
      message: 'Generation retrieved successfully',
      generation: {
        id: generation.id,
        status: generation.status,
        createdAt: generation.createdAt,
        completedAt: generation.completedAt,
        creditsUsed: generation.creditsUsed,
        originalFilename: generation.cv.originalFilename,
        optimizedData: generation.optimizedData
      }
    });

  } catch (error) {
    console.error('Get generation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserGenerations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const generations = await prisma.generation.findMany({
      where: { userId },
      include: {
        cv: {
          select: {
            originalFilename: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      message: 'Generations retrieved successfully',
      count: generations.length,
      generations: generations.map(gen => ({
        id: gen.id,
        status: gen.status,
        createdAt: gen.createdAt,
        completedAt: gen.completedAt,
        creditsUsed: gen.creditsUsed,
        originalFilename: gen.cv.originalFilename,
        hasOptimizedData: !!gen.optimizedData
      }))
    });

  } catch (error) {
    console.error('Get user generations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};