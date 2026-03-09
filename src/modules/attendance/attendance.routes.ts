import { Router, Request, Response, NextFunction } from 'express';
import { recordAttendance, getAttendanceSummary, checkIn } from './attendance.controller';
import { protect, AuthRequest } from '../../middlewares/auth';

const router = Router();

router.use(protect);

router.post('/', (req: Request, res: Response, next: NextFunction) => recordAttendance(req as AuthRequest, res).catch(next));
router.post('/check-in', checkIn);
router.get('/summary', getAttendanceSummary);

export default router;
