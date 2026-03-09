import { Request, Response } from 'express';
/**
 * @swagger
 * /users/teachers:
 *   post:
 *     summary: Create a new teacher
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, firstName, lastName, teacherId]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               teacherId: { type: string }
 *               phone: { type: string }
 *               specialization: { type: string }
 *     responses:
 *       201:
 *         description: Teacher created
 */
export declare const createTeacher: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @swagger
 * /users/teachers:
 *   get:
 *     summary: List all teachers
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of teachers
 */
export declare const listTeachers: (req: Request, res: Response) => Promise<void>;
/**
 * @swagger
 * /users/teachers/{id}:
 *   patch:
 *     summary: Update teacher profile or status
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isActive: { type: boolean }
 *               specialization: { type: string }
 *     responses:
 *       200:
 *         description: Teacher updated
 *       404:
 *         description: Teacher not found
 */
export declare const updateTeacher: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
