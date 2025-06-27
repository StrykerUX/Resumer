import { Router } from 'express';
import { uploadCV, getParsedData } from '../controllers/uploadController';
import { getRecommendations } from '../controllers/recommendationController';
import { getPreview, downloadCV } from '../controllers/downloadController';
import { authenticateToken } from '../middleware/auth';
import { uploadMiddleware } from '../middleware/upload';

const router = Router();

// All CV routes require authentication
router.use(authenticateToken);

router.post('/upload', uploadMiddleware.single('cv'), uploadCV);
router.get('/parsed-data', getParsedData);
router.get('/recommendations', getRecommendations);
router.get('/preview', getPreview);
router.get('/preview/:generationId', getPreview);
router.get('/download', downloadCV);
router.get('/download/:generationId', downloadCV);

export default router;