import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../../utils/prisma';
import bcrypt from 'bcrypt';

const createTeacherSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    firstName: z.string(),
    lastName: z.string(),
    teacherId: z.string(),
    phone: z.string().optional(),
    specialization: z.string().optional()
});

const updateTeacherSchema = z.object({
    isActive: z.boolean().optional(),
    specialization: z.string().optional()
});

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
export const createTeacher = async (req: Request, res: Response) => {
    try {
        const data = createTeacherSchema.parse(req.body);

        const existing = await prisma.user.findUnique({ where: { email: data.email } });
        if (existing) {
            return res.status(400).json({ status: 'error', message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        const result = await prisma.$transaction(async (tx: any) => {
            const user = await tx.user.create({
                data: {
                    email: data.email,
                    password: hashedPassword,
                    role: 'TEACHER'
                }
            });

            const teacher = await tx.teacher.create({
                data: {
                    userId: user.id,
                    teacherId: data.teacherId,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    phone: data.phone,
                    specialization: data.specialization
                }
            });

            return { user, teacher };
        });

        res.status(201).json({ status: 'success', data: result });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ status: 'error', message: 'Validation error', errors: error.issues });
        }
        res.status(500).json({ status: 'error', message: error.message });
    }
};

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
export const listTeachers = async (req: Request, res: Response) => {
    try {
        const teachers = await prisma.teacher.findMany({
            include: {
                user: {
                    select: { email: true, isActive: true }
                }
            }
        });
        res.status(200).json({ status: 'success', data: teachers });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

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
export const updateTeacher = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const { isActive, specialization } = updateTeacherSchema.parse(req.body);

        const teacher = await prisma.teacher.findUnique({
            where: { id: String(id) },
            include: { user: true }
        });

        if (!teacher) {
            return res.status(404).json({ status: 'error', message: 'Teacher not found' });
        }

        await prisma.$transaction(async (tx: any) => {
            if (specialization !== undefined) {
                await tx.teacher.update({
                    where: { id: String(id) },
                    data: { specialization }
                });
            }

            if (isActive !== undefined) {
                await tx.user.update({
                    where: { id: teacher.userId },
                    data: { isActive }
                });
            }
        });

        res.status(200).json({ status: 'success', message: 'Teacher updated successfully' });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ status: 'error', message: 'Validation error', errors: error.issues });
        }
        res.status(500).json({ status: 'error', message: error.message });
    }
};
