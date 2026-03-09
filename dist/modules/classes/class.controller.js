"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listSchedules = exports.createSchedule = exports.listClasses = exports.createClass = void 0;
const zod_1 = require("zod");
const prisma_1 = __importDefault(require("../../utils/prisma"));
const client_1 = require("@prisma/client");
const classSchema = zod_1.z.object({
    name: zod_1.z.string(),
    grade: zod_1.z.string(),
    section: zod_1.z.string(),
    shift: zod_1.z.nativeEnum(client_1.Shift)
});
const scheduleSchema = zod_1.z.object({
    classId: zod_1.z.string(),
    teacherId: zod_1.z.string(),
    dayOfWeek: zod_1.z.number().min(1).max(7),
    startTime: zod_1.z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    endTime: zod_1.z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
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
const createClass = async (req, res) => {
    try {
        const data = classSchema.parse(req.body);
        const newClass = await prisma_1.default.class.create({ data });
        res.status(201).json({ status: 'success', data: newClass });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ status: 'error', message: 'Validation error', errors: error.issues });
        }
        res.status(500).json({ status: 'error', message: error.message });
    }
};
exports.createClass = createClass;
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
const listClasses = async (req, res) => {
    try {
        const classes = await prisma_1.default.class.findMany({
            where: { deletedAt: null }
        });
        res.status(200).json({ status: 'success', data: classes });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
exports.listClasses = listClasses;
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
const createSchedule = async (req, res) => {
    try {
        const data = scheduleSchema.parse(req.body);
        // Conflict prevention: check if teacher is already assigned at this time on this day
        const teacherConflict = await prisma_1.default.schedule.findFirst({
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
        const classConflict = await prisma_1.default.schedule.findFirst({
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
        const schedule = await prisma_1.default.schedule.create({ data });
        res.status(201).json({ status: 'success', data: schedule });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ status: 'error', message: 'Validation error', errors: error.issues });
        }
        res.status(500).json({ status: 'error', message: error.message });
    }
};
exports.createSchedule = createSchedule;
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
const listSchedules = async (req, res) => {
    try {
        const { teacherId, classId } = req.query;
        const { role, id: userId } = req.user;
        const where = {
            deletedAt: null,
            ...(teacherId && { teacherId: String(teacherId) }),
            ...(classId && { classId: String(classId) })
        };
        // Teachers can only see their own schedules unless admin
        if (role === 'TEACHER') {
            const teacher = await prisma_1.default.teacher.findUnique({ where: { userId } });
            if (!teacher)
                return res.status(404).json({ status: 'error', message: 'Teacher profile not found' });
            where.teacherId = teacher.id;
        }
        const schedules = await prisma_1.default.schedule.findMany({
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
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
exports.listSchedules = listSchedules;
//# sourceMappingURL=class.controller.js.map