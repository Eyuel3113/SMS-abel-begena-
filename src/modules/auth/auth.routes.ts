import { Router } from 'express';
import { login, refreshToken, logout } from './auth.controller';
import { protect } from '../../middlewares/auth';

const router = Router();

router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', protect, logout);

export default router;
