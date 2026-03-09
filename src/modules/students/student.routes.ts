import { Router } from 'express';
import { createStudent, listStudents, getStudent, updateStudent, deleteStudent } from './student.controller';
import { protect, restrictTo } from '../../middlewares/auth';

const router = Router();

router.use(protect);

router.post('/', restrictTo('ADMIN'), createStudent);
router.get('/', listStudents);
router.get('/:id', getStudent);
router.patch('/:id', restrictTo('ADMIN'), updateStudent);
router.delete('/:id', restrictTo('ADMIN'), deleteStudent);

export default router;
