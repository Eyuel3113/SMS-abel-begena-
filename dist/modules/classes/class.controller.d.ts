import { Request, Response } from 'express';
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
export declare const createClass: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
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
export declare const listClasses: (req: Request, res: Response) => Promise<void>;
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
export declare const createSchedule: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
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
export declare const listSchedules: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
