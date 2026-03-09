"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTeacher = exports.listTeachers = exports.createTeacher = void 0;
const zod_1 = require("zod");
const prisma_1 = __importDefault(require("../../utils/prisma"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const createTeacherSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    fullName: zod_1.z.string(),
    specialization: zod_1.z.string().optional()
});
const updateTeacherSchema = zod_1.z.object({
    isActive: zod_1.z.boolean().optional(),
    specialization: zod_1.z.string().optional()
});
const createTeacher = async (req, res) => {
    try {
        const data = createTeacherSchema.parse(req.body);
        const existing = await prisma_1.default.user.findUnique({ where: { email: data.email } });
        if (existing) {
            return res.status(400).json({ status: 'error', message: 'Email already exists' });
        }
        const hashedPassword = await bcrypt_1.default.hash(data.password, 10);
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
                    fullName: data.fullName,
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