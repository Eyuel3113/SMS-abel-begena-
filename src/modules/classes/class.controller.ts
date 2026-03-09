import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../../utils/prisma';
import { Shift } from '@prisma/client';

const classSchema = z.object({
    name: z.string(),
    grade: z.string(),
    section: z.string(),
    shift: z.nativeEnum(Shift)
});

const scheduleSchema = z.object({
    classId: z.string(),
    teacherId: z.string(),
    dayOfWeek: z.number().min(1).max(7),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
});

/**
 * @swagger
 * /classes:
 *   post:
 *     summary: Create a new class
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               grade: { type: string }
 *               section: { type: string }
 *               shift: { type: string, enum: [MORNING, AFTERNOON] }
 *     responses:
 *       201:
 *         description: Class created
 */
export const createClass = async (req: Request, res: Response) => {
    try {
        const data = classSchema.parse(req.body);
        const newClass = await prisma.class.create({ data });
        res.status(201).json({ status: 'success', data: newClass });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ status: 'error', message: 'Validation error', errors: error.issues });
        }
        res.status(500).json({ status: 'error', message: error.message });
    }
};

/**
 * @swagger
 * /classes:
 *   get:
 *     summary: List all classes
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of classes
 */
export const listClasses = async (req: Request, res: Response) => {
    try {
        const classes = await prisma.class.findMany({
            where: { deletedAt: null }
        });
        res.status(200).json({ status: 'success', data: classes });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

/**
 * @swagger
 * /schedules:
 *   post:
 *     summary: Create a new schedule
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               classId: { type: string }
 *               teacherId: { type: string }
 *               dayOfWeek: { type: integer, minimum: 1, maximum: 7 }
 *               startTime: { type: string, example: "08:00" }
 *               endTime: { type: string, example: "09:00" }
 *     responses:
 *       201:
 *         description: Schedule created
 */
export const createSchedule = async (req: Request, res: Response) => {
    try {
        const data = scheduleSchema.parse(req.body);

        // Conflict prevention: check if teacher is already assigned at this time on this day
        const teacherConflict = await prisma.schedule.findFirst({
            where: {
                teacherId: data.teacherId,
                dayOfWeek: data.dayOfWeek,
                deletedAt: null,
                OR: [
                    {
                        AND: [
                            { startTime: { lte: data.startTime } },
                            { endTime: { gt: data.startTime } }
                        ]
                    },
                    {
                        AND: [
                            { startTime: { lt: data.endTime } },
                            { endTime: { gte: data.endTime } }
                        ]
                    }
                ]
            }
        });

        if (teacherConflict) {
            return res.status(400).json({ status: 'error', message: 'Teacher has a conflicting schedule' });
        }

        // Conflict prevention: check if class is already occupied at this time on this day
        const classConflict = await prisma.schedule.findFirst({
            where: {
                classId: data.classId,
                dayOfWeek: data.dayOfWeek,
                deletedAt: null,
                OR: [
                    {
                        AND: [
                            { startTime: { lte: data.startTime } },
                            { endTime: { gt: data.startTime } }
                        ]
                    },
                    {
                        AND: [
                            { startTime: { lt: data.endTime } },
                            { endTime: { gte: data.endTime } }
                        ]
                    }
                ]
            }
        });

        if (classConflict) {
            return res.status(400).json({ status: 'error', message: 'Class has a conflicting schedule' });
        }

        const schedule = await prisma.schedule.create({ data });
        res.status(201).json({ status: 'success', data: schedule });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ status: 'error', message: 'Validation error', errors: error.issues });
        }
        res.status(500).json({ status: 'error', message: error.message });
    }
};

/**
 * @swagger
 * /schedules:
 *   get:
 *     summary: List schedules with optional filters
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: teacherId
 *         schema: { type: string }
 *       - in: query
 *         name: classId
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of schedules
 */
export const listSchedules = async (req: Request, res: Response) => {
    try {
        const { teacherId, classId } = req.query;
        const { role, id: userId } = (req as any).user;

        const where: any = {
            deletedAt: null,
            ...(teacherId && { teacherId: String(teacherId) }),
            ...(classId && { classId: String(classId) })
        };

        // Teachers can only see their own schedules unless admin
        if (role === 'TEACHER') {
            const teacher = await prisma.teacher.findUnique({ where: { userId } });
            if (!teacher) return res.status(404).json({ status: 'error', message: 'Teacher profile not found' });
            where.teacherId = teacher.id;
        }

        const schedules = await prisma.schedule.findMany({
            where,
            include: {
                class: true,
                teacher: {
                    include: {
                        user: {
                            select: { email: true }
                        }
                    }
                }
            },
            orderBy: [
                { dayOfWeek: 'asc' },
                { startTime: 'asc' }
            ]
        });

        res.status(200).json({ status: 'success', data: schedules });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
