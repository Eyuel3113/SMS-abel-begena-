"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteStudent = exports.updateStudent = exports.getStudent = exports.listStudents = exports.createStudent = void 0;
const zod_1 = require("zod");
const prisma_1 = __importDefault(require("../../utils/prisma"));
const client_1 = require("@prisma/client");
const studentSchema = zod_1.z.object({
    studentId: zod_1.z.string(),
    fullName: zod_1.z.string(),
    grade: zod_1.z.string(),
    section: zod_1.z.string(),
    shift: zod_1.z.nativeEnum(client_1.Shift),
    enrollmentStatus: zod_1.z.string().optional()
});
/**
 * @swagger
 * /students:
 *   post:
 *     summary: Create a new student
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Student'
 *     responses:
 *       201:
 *         description: Student created
 */
const createStudent = async (req, res) => {
    try {
        const data = studentSchema.parse(req.body);
        const existing = await prisma_1.default.student.findUnique({ where: { studentId: data.studentId } });
        if (existing) {
            return res.status(400).json({ status: 'error', message: 'Student ID already exists' });
        }
        const student = await prisma_1.default.student.create({ data });
        res.status(201).json({ status: 'success', data: student });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ status: 'error', message: 'Validation error', errors: error.issues });
        }
        res.status(500).json({ status: 'error', message: error.message });
    }
};
exports.createStudent = createStudent;
/**
 * @swagger
 * /students:
 *   get:
 *     summary: List students with pagination and filters
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: grade
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of students
 */
const listStudents = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, grade, section, shift } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);
        const where = {
            deletedAt: null,
            ...(grade && { grade: String(grade) }),
            ...(section && { section: String(section) }),
            ...(shift && { shift: shift }),
            ...(search && {
                OR: [
                    { fullName: { contains: String(search), mode: 'insensitive' } },
                    { studentId: { contains: String(search), mode: 'insensitive' } }
                ]
            })
        };
        const [students, total] = await Promise.all([
            prisma_1.default.student.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
            prisma_1.default.student.count({ where })
        ]);
        res.status(200).json({
            status: 'success',
            data: {
                students,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(total / take)
                }
            }
        });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
exports.listStudents = listStudents;
/**
 * @swagger
 * /students/{id}:
 *   get:
 *     summary: Get student by ID
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Student details
 *       404:
 *         description: Student not found
 */
const getStudent = async (req, res) => {
    const { id } = req.params;
    try {
        const student = await prisma_1.default.student.findUnique({ where: { id: String(id) } });
        if (!student || student.deletedAt) {
            return res.status(404).json({ status: 'error', message: 'Student not found' });
        }
        res.status(200).json({ status: 'success', data: student });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
exports.getStudent = getStudent;
/**
 * @swagger
 * /students/{id}:
 *   patch:
 *     summary: Update a student
 *     tags: [Students]
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
 *             $ref: '#/components/schemas/Student'
 *     responses:
 *       200:
 *         description: Student updated
 *       404:
 *         description: Student not found
 */
const updateStudent = async (req, res) => {
    const { id } = req.params;
    try {
        const data = studentSchema.partial().parse(req.body);
        const updated = await prisma_1.default.student.update({
            where: { id: String(id) },
            data
        });
        res.status(200).json({ status: 'success', data: updated });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ status: 'error', message: 'Validation error', errors: error.issues });
        }
        res.status(500).json({ status: 'error', message: error.message });
    }
};
exports.updateStudent = updateStudent;
/**
 * @swagger
 * /students/{id}:
 *   delete:
 *     summary: Delete a student (soft delete)
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Student deleted
 *       404:
 *         description: Student not found
 */
const deleteStudent = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma_1.default.student.update({
            where: { id: String(id) },
            data: { deletedAt: new Date() }
        });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
exports.deleteStudent = deleteStudent;
//# sourceMappingURL=student.controller.js.map