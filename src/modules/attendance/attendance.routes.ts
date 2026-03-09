import { Router, Request, Response, NextFunction } from 'express';
import { recordAttendance, getAttendanceSummary } from './attendance.controller';
import { protect, AuthRequest } from '../../middlewares/auth';

const router = Router();

router.use(protect);

router.post('/', (req: Request, res: Response, next: NextFunction) => recordAttendance(req as AuthRequest, res).catch(next));
router.get('/summary', getAttendanceSummary);

export default router;
