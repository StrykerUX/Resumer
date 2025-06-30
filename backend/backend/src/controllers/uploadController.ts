import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { parsePDF, parseDocx } from '../services/fileParser';

const prisma = new PrismaClient();

export const uploadCV = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        error: 'No file uploaded'
      });
    }

    let parsedData;
    
    try {
      // Parse file based on type
      if (file.mimetype === 'application/pdf') {
        parsedData = await parsePDF(file.buffer);
      } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        parsedData = await parseDocx(file.buffer);
      } else {
        return res.status(400).json({
          error: 'Unsupported file type'
        });
      }
    } catch (parseError) {
      console.error('File parsing error:', parseError);
      return res.status(400).json({
        error: 'Failed to parse the uploaded file'
      });
    }

    // Check if user already has a CV
    let cv = await prisma.cV.findFirst({
      where: { userId }
    });

    if (cv) {
      // Update existing CV
      cv = await prisma.cV.update({
        where: { id: cv.id },
        data: {
          originalFilename: file.originalname,
          parsedData: {
            ...parsedData,
            uploadedAt: new Date().toISOString()
          }
        }
      });
    } else {
      // Create new CV
      cv = await prisma.cV.create({
        data: {
          userId,
          originalFilename: file.originalname,
          parsedData: {
            ...parsedData,
            uploadedAt: new Date().toISOString()
          }
        }
      });
    }

    res.json({
      message: 'CV uploaded and parsed successfully',
      cvId: cv.id,
      filename: file.originalname,
      parsedData: parsedData.sections,
      rawTextLength: parsedData.rawText.length
    });

  } catch (error) {
    console.error('Upload CV error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getParsedData = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const cv = await prisma.cV.findFirst({
      where: { userId },
      select: {
        id: true,
        originalFilename: true,
        parsedData: true,
        createdAt: true
      }
    });

    if (!cv) {
      return res.status(404).json({
        error: 'No CV found'
      });
    }

    res.json({
      message: 'Parsed CV data retrieved successfully',
      cvId: cv.id,
      filename: cv.originalFilename,
      data: cv.parsedData,
      createdAt: cv.createdAt
    });

  } catch (error) {
    console.error('Get parsed data error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};