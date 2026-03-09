import { Request, Response } from 'express';
import { AuthRequest } from '../../middlewares/auth';
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
export declare const recordAttendance: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
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
export declare const getAttendanceSummary: (req: Request, res: Response) => Promise<void>;
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
export declare const checkIn: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
