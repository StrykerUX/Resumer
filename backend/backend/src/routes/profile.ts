import { Router } from 'express';
import { saveBasicData, getBasicData } from '../controllers/profileController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All profile routes require authentication
router.use(authenticateToken);

router.post('/basic-data', saveBasicData);
router.get('/basic-data', getBasicData);

export default router;