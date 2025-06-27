import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { generatePreviewHTML } from '../services/pdfGenerator';

const prisma = new PrismaClient();

export const getPreview = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { generationId } = req.params;

    let cvData;

    if (generationId) {
      // Get specific generation
      const generation = await prisma.generation.findFirst({
        where: {
          id: generationId,
          userId
        }
      });

      if (!generation) {
        return res.status(404).json({
          error: 'Generation not found'
        });
      }

      cvData = (generation.optimizedData as any)?.optimization?.optimizedCV;
    } else {
      // Get original CV
      const cv = await prisma.cV.findFirst({
        where: { userId }
      });

      if (!cv || !cv.parsedData) {
        return res.status(404).json({
          error: 'No CV data found'
        });
      }

      cvData = cv.parsedData;
    }

    if (!cvData) {
      return res.status(404).json({
        error: 'No CV data available for preview'
      });
    }

    const htmlContent = generatePreviewHTML(cvData);
    
    res.setHeader('Content-Type', 'text/html');
    res.send(htmlContent);

  } catch (error) {
    console.error('Preview error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const downloadCV = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { generationId } = req.params;
    const { format = 'html' } = req.query;

    let cvData;
    let filename = 'CV';

    if (generationId) {
      // Get specific generation
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

      cvData = (generation.optimizedData as any)?.optimization?.optimizedCV;
      filename = generation.cv.originalFilename?.replace(/\.[^/.]+$/, '') || 'CV-Optimized';
    } else {
      // Get original CV
      const cv = await prisma.cV.findFirst({
        where: { userId }
      });

      if (!cv || !cv.parsedData) {
        return res.status(404).json({
          error: 'No CV data found'
        });
      }

      cvData = cv.parsedData;
      filename = cv.originalFilename?.replace(/\.[^/.]+$/, '') || 'CV';
    }

    if (!cvData) {
      return res.status(404).json({
        error: 'No CV data available for download'
      });
    }

    const htmlContent = generatePreviewHTML(cvData);

    if (format === 'html') {
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.html"`);
      res.send(htmlContent);
    } else {
      // For now, we'll return HTML. PDF generation would require additional libraries
      res.status(501).json({
        error: 'PDF generation not yet implemented',
        message: 'Use format=html for now, or open the preview in browser and print to PDF',
        previewUrl: `/api/cv/preview${generationId ? `/${generationId}` : ''}`
      });
    }

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};