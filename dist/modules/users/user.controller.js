"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTeacher = exports.listTeachers = exports.createTeacher = void 0;
const zod_1 = require("zod");
const prisma_1 = __importDefault(require("../../utils/prisma"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const createTeacherSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    firstName: zod_1.z.string(),
    lastName: zod_1.z.string(),
    teacherId: zod_1.z.string(),
    phone: zod_1.z.string().optional(),
    specialization: zod_1.z.string().optional()
});
const updateTeacherSchema = zod_1.z.object({
    isActive: zod_1.z.boolean().optional(),
    specialization: zod_1.z.string().optional()
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
const createTeacher = async (req, res) => {
    try {
        const data = createTeacherSchema.parse(req.body);
        const existing = await prisma_1.default.user.findUnique({ where: { email: data.email } });
        if (existing) {
            return res.status(400).json({ status: 'error', message: 'Email already exists' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(data.password, 10);
        const result = await prisma_1.default.$transaction(async (tx) => {
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
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ status: 'error', message: 'Validation error', errors: error.issues });
        }
        res.status(500).json({ status: 'error', message: error.message });
    }
};
exports.createTeacher = createTeacher;
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
const listTeachers = async (req, res) => {
    try {
        const teachers = await prisma_1.default.teacher.findMany({
            include: {
                user: {
                    select: { email: true, isActive: true }
                }
            }
        });
        res.status(200).json({ status: 'success', data: teachers });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
exports.listTeachers = listTeachers;
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
const updateTeacher = async (req, res) => {
    const { id } = req.params;
    try {
        const { isActive, specialization } = updateTeacherSchema.parse(req.body);
        const teacher = await prisma_1.default.teacher.findUnique({
            where: { id: String(id) },
            include: { user: true }
        });
        if (!teacher) {
            return res.status(404).json({ status: 'error', message: 'Teacher not found' });
        }
        await prisma_1.default.$transaction(async (tx) => {
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
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ status: 'error', message: 'Validation error', errors: error.issues });
        }
        res.status(500).json({ status: 'error', message: error.message });
    }
};
exports.updateTeacher = updateTeacher;
//# sourceMappingURL=user.controller.js.map