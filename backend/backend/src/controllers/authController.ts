import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { hashPassword, verifyPassword } from '../utils/password';
import { AuthRequest } from '../middleware/auth';
import { 
  registerSchema, 
  loginSchema, 
  createValidationResponse,
  sanitizeEmail,
  sanitizeString 
} from '../utils/validation';
import { logAuthEvent, SecurityEvent } from '../utils/securityLogger';

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
  try {
    // Validate input data with Zod
    const validationResult = registerSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json(createValidationResponse(validationResult.error));
    }

    const { email: rawEmail, password, name: rawName } = validationResult.data;
    
    // Sanitize inputs
    const email = sanitizeEmail(rawEmail);
    const name = sanitizeString(rawName);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({ 
        error: 'User already exists with this email' 
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        credits: 3, // Free tier starts with 3 credits
        plan: 'free'
      },
      select: {
        id: true,
        email: true,
        credits: true,
        plan: true,
        createdAt: true
      }
    });

    // Generate access token (15 minutes) and refresh token (7 days)
    const accessToken = jwt.sign(
      { userId: user.id, type: 'access' },
      process.env.JWT_SECRET as string,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    // Log successful registration
    logAuthEvent(SecurityEvent.REGISTER_SUCCESS, req, user.id, user.email);

    res.status(201).json({
      message: 'User registered successfully',
      user,
      accessToken,
      refreshToken
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Log failed registration attempt
    logAuthEvent(SecurityEvent.REGISTER_FAILURE, req, undefined, email, error.message);
    
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    // Validate input data with Zod
    const validationResult = loginSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json(createValidationResponse(validationResult.error));
    }

    const { email: rawEmail, password } = validationResult.data;
    
    // Sanitize email
    const email = sanitizeEmail(rawEmail);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Log failed login attempt
      logAuthEvent(SecurityEvent.LOGIN_FAILURE, req, undefined, email, 'User not found');
      
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash);

    if (!isValidPassword) {
      // Log failed login attempt
      logAuthEvent(SecurityEvent.LOGIN_FAILURE, req, user.id, email, 'Invalid password');
      
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    // Generate access token (15 minutes) and refresh token (7 days)
    const accessToken = jwt.sign(
      { userId: user.id, type: 'access' },
      process.env.JWT_SECRET as string,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    // Log successful login
    logAuthEvent(SecurityEvent.LOGIN_SUCCESS, req, user.id, user.email);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        credits: user.credits,
        plan: user.plan,
        createdAt: user.createdAt
      },
      accessToken,
      refreshToken
    });

  } catch (error) {
    console.error('Login error:', error);
    
    // Log failed login attempt due to server error
    logAuthEvent(SecurityEvent.LOGIN_FAILURE, req, undefined, email, error.message);
    
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        credits: true,
        plan: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken, 
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET!
    ) as { userId: string; type: string };

    if (decoded.type !== 'refresh') {
      return res.status(401).json({ error: 'Invalid token type' });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        credits: true,
        plan: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      { userId: user.id, type: 'access' },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );

    res.json({
      accessToken: newAccessToken,
      user
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};