import { Router } from 'express';
import { createClass, listClasses, createSchedule, listSchedules } from './class.controller';
import { protect, restrictTo } from '../../middlewares/auth';

const router = Router();

router.use(protect);

// Classes
router.post('/classes', restrictTo('ADMIN'), createClass);
router.get('/classes', listClasses);

// Schedules
router.post('/schedules', restrictTo('ADMIN'), createSchedule);
router.get('/schedules', listSchedules);

export default router;
