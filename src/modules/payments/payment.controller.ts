import { Response } from 'express';
import { z } from 'zod';
import prisma from '../../utils/prisma';
import { PaymentStatus } from '@prisma/client';
import { AuthRequest } from '../../middlewares/auth';

const paymentSchema = z.object({
    studentId: z.string(),
    amount: z.number().positive(),
    status: z.nativeEnum(PaymentStatus),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
});

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
export const recordPayment = async (req: AuthRequest, res: Response) => {
    try {
        const { studentId, amount, status, date } = paymentSchema.parse(req.body);
        const userId = req.user!.id;

        const student = await prisma.student.findUnique({ where: { id: studentId } });
        if (!student) return res.status(404).json({ status: 'error', message: 'Student not found' });

        const payment = await prisma.payment.create({
            data: {
                studentId,
                amount,
                status,
                date: new Date(date),
                recordedBy: userId
            }
        });

        res.status(201).json({ status: 'success', data: payment });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ status: 'error', message: 'Validation error', errors: error.issues });
        }
        res.status(500).json({ status: 'error', message: error.message });
    }
};

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
export const getStudentPayments = async (req: AuthRequest, res: Response) => {
    const { studentId } = req.params;
    try {
        const payments = await prisma.payment.findMany({
            where: { studentId: String(studentId) },
            orderBy: { date: 'desc' }
        });
        res.status(200).json({ status: 'success', data: payments });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

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
export const getPaymentReports = async (req: AuthRequest, res: Response) => {
    try {
        const { status, month, year } = req.query;
        let where: any = {};
        if (status) where.status = status as PaymentStatus;
        if (month && year) {
            where.date = {
                gte: new Date(Number(year), Number(month) - 1, 1),
                lte: new Date(Number(year), Number(month), 0)
            };
        }

        const payments = await prisma.payment.findMany({
            where,
            include: {
                student: { select: { fullName: true, studentId: true, grade: true } }
            },
            orderBy: { date: 'desc' }
        });

        res.status(200).json({ status: 'success', data: payments });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
