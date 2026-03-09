import { Router } from 'express';
import { generateAttendanceReport, generatePaymentReport } from './report.controller';
import { protect, restrictTo } from '../../middlewares/auth';

const router = Router();

router.use(protect);
router.use(restrictTo('ADMIN'));

router.get('/attendance', generateAttendanceReport);
router.get('/payments', generatePaymentReport);

export default router;
