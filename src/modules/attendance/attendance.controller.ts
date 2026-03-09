import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../../utils/prisma';
import { AttendanceStatus } from '@prisma/client';
import { AuthRequest } from '../../middlewares/auth';

const attendanceSchema = z.object({
    scheduleId: z.string(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
    records: z.array(z.object({
        studentId: z.string(),
        status: z.nativeEnum(AttendanceStatus)
    }))
});

/**
 * @swagger
 * /attendance:
 *   post:
 *     summary: Record attendance
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               scheduleId: { type: string }
 *               date: { type: string }
 *               records:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     studentId: { type: string }
 *                     status: { type: string, enum: [PRESENT, LATE, ABSENT] }
 *     responses:
 *       200:
 *         description: Attendance recorded
 */
export const recordAttendance = async (req: AuthRequest, res: Response) => {
    try {
        const { scheduleId, date, records } = attendanceSchema.parse(req.body);
        const userId = req.user!.id;
        const role = req.user!.role;

        const schedule = await prisma.schedule.findUnique({
            where: { id: scheduleId },
            include: { teacher: true }
        });

        if (!schedule) {
            return res.status(404).json({ status: 'error', message: 'Schedule not found' });
        }

        if (role === 'TEACHER') {
            const teacher = await prisma.teacher.findUnique({ where: { userId } });
            if (!teacher || schedule.teacherId !== teacher.id) {
                return res.status(403).json({ status: 'error', message: 'Not authorized for this class' });
            }
        }

        const attendanceDate = new Date(date);
        const dayOfWeek = (attendanceDate.getUTCDay() || 7);
        if (schedule.dayOfWeek !== dayOfWeek) {
            return res.status(400).json({ status: 'error', message: 'Date mismatch' });
        }

        const results = await prisma.$transaction(async (tx: any) => {
            const ops = records.map(record =>
                tx.attendance.upsert({
                    where: {
                        studentId_scheduleId_date: {
                            studentId: record.studentId,
                            scheduleId,
                            date: attendanceDate
                        }
                    },
                    update: { status: record.status, recordedBy: userId },
                    create: {
                        studentId: record.studentId,
                        scheduleId,
                        status: record.status,
                        recordedBy: userId,
                        date: attendanceDate
                    }
                })
            );
            return Promise.all(ops);
        });

        res.status(200).json({ status: 'success', data: results });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ status: 'error', message: 'Validation error', errors: error.issues });
        }
        res.status(500).json({ status: 'error', message: error.message });
    }
};

/**
 * @swagger
 * /attendance/summary:
 *   get:
 *     summary: Get attendance summary/logs
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: scheduleId
 *         schema: { type: string }
 *       - in: query
 *         name: startDate
 *         schema: { type: string }
 *       - in: query
 *         name: endDate
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Attendance list
 */
export const getAttendanceSummary = async (req: Request, res: Response) => {
    try {
        const { scheduleId, startDate, endDate } = req.query;
        const where: any = {};
        if (scheduleId) where.scheduleId = String(scheduleId);
        if (startDate && endDate) {
            where.date = {
                gte: new Date(String(startDate)),
                lte: new Date(String(endDate))
            };
        }

        const attendance = await prisma.attendance.findMany({
            where,
            include: {
                student: { select: { firstName: true, lastName: true, studentId: true } },
                schedule: { include: { class: true } }
            },
            orderBy: { date: 'desc' }
        });

        res.status(200).json({ status: 'success', data: attendance });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
/**
 * @swagger
 * /attendance/check-in:
 *   post:
 *     summary: Fingerprint check-in for students
 *     description: Validates payment status and schedule before recording attendance
 *     tags: [Attendance]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *             properties:
 *               studentId:
 *                 type: string
 *                 description: The unique student ID (from fingerprint reader) (required)
 *     responses:
 *       200:
 *         description: Check-in successful - student is present
 *       403:
 *         description: Access denied - unpaid fees or not scheduled
 *       404:
 *         description: Student not found
 */
export const checkIn = async (req: Request, res: Response) => {
    try {
        const { studentId } = req.body;

        const student = await prisma.student.findUnique({
            where: { studentId },
            include: {
                payments: { orderBy: { date: 'desc' }, take: 1 }
            }
        });

        if (!student) {
            return res.status(404).json({ status: 'error', message: 'Student not found' });
        }

        // 1. Payment Check
        const latestPayment = student.payments[0];
        if (latestPayment && latestPayment.status === 'UNPAID') {
            return res.status(403).json({
                status: 'error',
                message: 'Access Denied: Unpaid fees',
                studentName: `${student.firstName} ${student.lastName}`
            });
        }

        // 2. Schedule Check
        const now = new Date();
        const dayOfWeek = (now.getUTCDay() || 7);
        const currentTime = `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}`;

        // Find all classes for this grade and section (could be different shifts)
        const studentClasses = await prisma.class.findMany({
            where: {
                grade: student.grade,
                section: student.section
            },
            include: {
                schedules: {
                    where: { dayOfWeek }
                }
            }
        });

        // Flatten all schedules and find one that matches the current time
        const allSchedules = studentClasses.flatMap(c => c.schedules);
        const activeSchedule = allSchedules.find(s =>
            currentTime >= s.startTime && currentTime <= s.endTime
        );

        if (!activeSchedule) {
            return res.status(403).json({
                status: 'error',
                message: 'Access Denied: Not your shift time',
                currentTime,
                studentName: `${student.firstName} ${student.lastName}`
            });
        }

        // 3. Record Attendance
        const attendance = await prisma.attendance.upsert({
            where: {
                studentId_scheduleId_date: {
                    studentId: student.id,
                    scheduleId: activeSchedule.id,
                    date: new Date(now.toISOString().split('T')[0])
                }
            },
            update: { status: 'PRESENT' },
            create: {
                studentId: student.id,
                scheduleId: activeSchedule.id,
                status: 'PRESENT',
                recordedBy: 'SYSTEM', // System recorded
                date: new Date(now.toISOString().split('T')[0])
            }
        });

        res.status(200).json({
            status: 'success',
            message: 'Access Granted: Welcome!',
            studentName: `${student.firstName} ${student.lastName}`,
            attendance
        });

    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
