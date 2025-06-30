import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const saveBasicData = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const {
      personalInfo,
      objective,
      experience,
      education,
      skills,
      languages
    } = req.body;

    // Validate required fields
    if (!personalInfo || !personalInfo.fullName || !personalInfo.email) {
      return res.status(400).json({
        error: 'Personal info with full name and email are required'
      });
    }

    // Check if user already has a CV, update or create
    let cv = await prisma.cV.findFirst({
      where: { userId }
    });

    const basicData = {
      personalInfo: {
        fullName: personalInfo.fullName,
        email: personalInfo.email,
        phone: personalInfo.phone || '',
        location: personalInfo.location || '',
        linkedin: personalInfo.linkedin || '',
        website: personalInfo.website || ''
      },
      objective: objective || '',
      experience: experience || [],
      education: education || [],
      skills: skills || [],
      languages: languages || []
    };

    if (cv) {
      // Update existing CV
      cv = await prisma.cV.update({
        where: { id: cv.id },
        data: {
          parsedData: basicData
        }
      });
    } else {
      // Create new CV
      cv = await prisma.cV.create({
        data: {
          userId,
          parsedData: basicData
        }
      });
    }

    res.json({
      message: 'Basic CV data saved successfully',
      cvId: cv.id,
      data: basicData
    });

  } catch (error) {
    console.error('Save basic data error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getBasicData = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const cv = await prisma.cV.findFirst({
      where: { userId },
      select: {
        id: true,
        parsedData: true,
        originalFilename: true,
        createdAt: true
      }
    });

    if (!cv) {
      return res.json({
        message: 'No CV data found',
        data: null
      });
    }

    res.json({
      message: 'CV data retrieved successfully',
      cvId: cv.id,
      data: cv.parsedData,
      originalFilename: cv.originalFilename,
      createdAt: cv.createdAt
    });

  } catch (error) {
    console.error('Get basic data error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};