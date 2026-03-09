"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaymentReports = exports.getStudentPayments = exports.recordPayment = void 0;
const zod_1 = require("zod");
const prisma_1 = __importDefault(require("../../utils/prisma"));
const client_1 = require("@prisma/client");
const paymentSchema = zod_1.z.object({
    studentId: zod_1.z.string(),
    amount: zod_1.z.number().positive(),
    status: zod_1.z.nativeEnum(client_1.PaymentStatus),
    date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
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
const recordPayment = async (req, res) => {
    try {
        const { studentId, amount, status, date } = paymentSchema.parse(req.body);
        const userId = req.user.id;
        const student = await prisma_1.default.student.findUnique({ where: { id: studentId } });
        if (!student)
            return res.status(404).json({ status: 'error', message: 'Student not found' });
        const payment = await prisma_1.default.payment.create({
            data: {
                studentId,
                amount,
                status,
                date: new Date(date),
                recordedBy: userId
            }
        });
        res.status(201).json({ status: 'success', data: payment });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ status: 'error', message: 'Validation error', errors: error.issues });
        }
        res.status(500).json({ status: 'error', message: error.message });
    }
};
exports.recordPayment = recordPayment;
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
const getStudentPayments = async (req, res) => {
    const { studentId } = req.params;
    try {
        const payments = await prisma_1.default.payment.findMany({
            where: { studentId: String(studentId) },
            orderBy: { date: 'desc' }
        });
        res.status(200).json({ status: 'success', data: payments });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
exports.getStudentPayments = getStudentPayments;
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
const getPaymentReports = async (req, res) => {
    try {
        const { status, month, year } = req.query;
        let where = {};
        if (status)
            where.status = status;
        if (month && year) {
            where.date = {
                gte: new Date(Number(year), Number(month) - 1, 1),
                lte: new Date(Number(year), Number(month), 0)
            };
        }
        const payments = await prisma_1.default.payment.findMany({
            where,
            include: {
                student: { select: { firstName: true, lastName: true, studentId: true, grade: true } }
            },
            orderBy: { date: 'desc' }
        });
        res.status(200).json({ status: 'success', data: payments });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
exports.getPaymentReports = getPaymentReports;
//# sourceMappingURL=payment.controller.js.map