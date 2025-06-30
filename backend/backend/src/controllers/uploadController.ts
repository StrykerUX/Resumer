import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { parsePDF, parseDocx } from '../services/fileParser';
import { validateFileContent, getFileSizeLimit } from '../middleware/upload';
import { logFileEvent, SecurityEvent } from '../utils/securityLogger';

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

    // Get user info for plan-based validation
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true, credits: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Check file size based on user plan
    const maxFileSize = getFileSizeLimit(user.plan);
    if (file.size > maxFileSize) {
      const maxSizeMB = Math.floor(maxFileSize / (1024 * 1024));
      
      // Log file upload failure
      logFileEvent(SecurityEvent.FILE_UPLOAD_FAILURE, req, userId, file.originalname, file.size, 
        `File size exceeds limit for ${user.plan} plan`);
      
      return res.status(400).json({
        error: `File size exceeds limit for ${user.plan} plan (${maxSizeMB}MB maximum)`
      });
    }

    // Validate file content by magic bytes
    if (!validateFileContent(file.buffer, file.mimetype)) {
      // Log suspicious file
      logFileEvent(SecurityEvent.SUSPICIOUS_FILE, req, userId, file.originalname, file.size, 
        'File content does not match expected format');
      
      return res.status(400).json({
        error: 'File content does not match expected format. Possible file corruption or spoofing.'
      });
    }

    // Basic malware check - scan for suspicious patterns
    const suspiciousPatterns = [
      /\x00\x00\x00\x00/g, // NULL bytes (common in malware)
      /<script/gi,          // Script tags
      /javascript:/gi,      // JavaScript protocol
      /vbscript:/gi,        // VBScript protocol
      /\\x[0-9a-f]{2}/gi    // Hex escape sequences
    ];

    const fileContent = file.buffer.toString('binary');
    const hasSuspiciousContent = suspiciousPatterns.some(pattern => 
      pattern.test(fileContent.substring(0, 1024)) // Check first 1KB
    );

    if (hasSuspiciousContent) {
      // Log suspicious file with malware patterns
      logFileEvent(SecurityEvent.SUSPICIOUS_FILE, req, userId, file.originalname, file.size, 
        'File contains suspicious patterns that may indicate malware');
      
      return res.status(400).json({
        error: 'File contains suspicious content and cannot be processed'
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