import { Router } from 'express';
import { createStudent, listStudents, listActiveStudents, getStudent, updateStudent, deleteStudent, toggleStudentStatus } from './student.controller';
import { protect, restrictTo } from '../../middlewares/auth';

const router = Router();

router.use(protect);

router.post('/', restrictTo('ADMIN'), createStudent);
router.get('/', listStudents);
router.get('/active', listActiveStudents);
router.get('/:id', getStudent);
router.patch('/:id', restrictTo('ADMIN'), updateStudent);
router.patch('/:id/toggle-status', restrictTo('ADMIN'), toggleStudentStatus);
router.delete('/:id', restrictTo('ADMIN'), deleteStudent);

export default router;
