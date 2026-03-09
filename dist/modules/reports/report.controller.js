"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePaymentReport = exports.generateAttendanceReport = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const pdfkit_1 = __importDefault(require("pdfkit"));
/**
 * @swagger
 * /reports/attendance:
 *   get:
 *     summary: Generate attendance PDF report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: scheduleId
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: PDF file
 *         content:
 *           application/pdf:
 *             schema: { type: string, format: binary }
 */
const generateAttendanceReport = async (req, res) => {
    try {
        const { startDate, endDate, scheduleId } = req.query;
        const attendance = await prisma_1.default.attendance.findMany({
            where: {
                ...(scheduleId && { scheduleId: String(scheduleId) }),
                date: {
                    gte: new Date(String(startDate)),
                    lte: new Date(String(endDate))
                }
            },
            include: {
                student: { select: { firstName: true, lastName: true, studentId: true } },
                schedule: { include: { class: true } }
            },
            orderBy: { date: 'asc' }
        });
        const doc = new pdfkit_1.default();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=attendance_report.pdf`);
        doc.pipe(res);
        doc.fontSize(20).text('Attendance Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Period: ${startDate} to ${endDate}`);
        doc.moveDown();
        attendance.forEach((record) => {
            doc.text(`${record.date.toISOString().split('T')[0]} - ${record.student.firstName} ${record.student.lastName} (${record.student.studentId}): ${record.status}`);
        });
        doc.end();
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
exports.generateAttendanceReport = generateAttendanceReport;
/**
 * @swagger
 * /reports/payments:
 *   get:
 *     summary: Generate payment PDF report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: year
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: PDF file
 *         content:
 *           application/pdf:
 *             schema: { type: string, format: binary }
 */
const generatePaymentReport = async (req, res) => {
    try {
        const { month, year } = req.query;
        const gte = new Date(Number(year), Number(month) - 1, 1);
        const lte = new Date(Number(year), Number(month), 0);
        const payments = await prisma_1.default.payment.findMany({
            where: {
                date: { gte, lte }
            },
            include: {
                student: true
            },
            orderBy: { date: 'asc' }
        });
        const doc = new pdfkit_1.default();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=payment_report.pdf`);
        doc.pipe(res);
        doc.fontSize(20).text('Payment Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Period: ${month}/${year}`);
        doc.moveDown();
        let total = 0;
        payments.forEach((p) => {
            doc.text(`${p.date.toISOString().split('T')[0]} - ${p.student.firstName} ${p.student.lastName}: ${p.amount} ETB (${p.status})`);
            total += p.amount;
        });
        doc.moveDown();
        doc.fontSize(14).text(`Total Collected: ${total} ETB`, { align: 'right' });
        doc.end();
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
exports.generatePaymentReport = generatePaymentReport;
//# sourceMappingURL=report.controller.js.map