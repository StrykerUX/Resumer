import { Router } from 'express';
import { analyzeJob, adaptCV, getGeneration, getUserGenerations } from '../controllers/generateController';
import { authenticateToken } from '../middleware/auth';
import { checkCredits } from '../middleware/credits';

const router = Router();

// All generate routes require authentication
router.use(authenticateToken);

// Analyze job description (free operation)
router.post('/analyze-job', analyzeJob);

// Adapt CV using AI (requires 1 credit)
router.post('/adapt-cv', checkCredits(1), adaptCV);

// Get specific generation
router.get('/:generationId', getGeneration);

// Get user's generations history
router.get('/', getUserGenerations);

export default router;