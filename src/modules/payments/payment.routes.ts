import { Router } from 'express';
import { recordPayment, getStudentPayments, getPaymentReports } from './payment.controller';
import { protect, restrictTo } from '../../middlewares/auth';

const router = Router();

router.use(protect);

// Only ADMIN can record payments
router.post('/', restrictTo('ADMIN'), recordPayment);
router.get('/student/:studentId', getStudentPayments);
router.get('/reports', restrictTo('ADMIN'), getPaymentReports);

export default router;
