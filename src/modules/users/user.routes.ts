import { Router } from 'express';
import { createTeacher, listTeachers, updateTeacher } from './user.controller';
import { protect, restrictTo } from '../../middlewares/auth';

const router = Router();

// Only ADMIN can manage teachers
router.use(protect);
router.use(restrictTo('ADMIN'));

router.post('/teachers', createTeacher);
router.get('/teachers', listTeachers);
router.patch('/teachers/:id', updateTeacher);

export default router;
