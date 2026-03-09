import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth';
/**
 * @swagger
 * /payments:
 *   post:
 *     summary: Record a payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentId: { type: string }
 *               amount: { type: number }
 *               status: { type: string, enum: [PAID, PARTIALLY_PAID, UNPAID] }
 *               date: { type: string }
 *     responses:
 *       201:
 *         description: Payment recorded
 */
export declare const recordPayment: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @swagger
 * /payments/student/{studentId}:
 *   get:
 *     summary: Get payment history for a student
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of payments
 */
export declare const getStudentPayments: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * @swagger
 * /payments/reports:
 *   get:
 *     summary: Get payment reports with filters
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PAID, PARTIALLY_PAID, UNPAID] }
 *       - in: query
 *         name: month
 *         schema: { type: integer }
 *       - in: query
 *         name: year
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Payment report data
 */
export declare const getPaymentReports: (req: AuthRequest, res: Response) => Promise<void>;
