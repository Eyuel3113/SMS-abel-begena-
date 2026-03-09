import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../../utils/prisma';

const studentSchema = z.object({
    studentId: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    grade: z.string(),
    section: z.string(),
    dateOfBirth: z.string().optional().transform(v => v ? new Date(v) : undefined),
    phone: z.string().optional(),
    address: z.string().optional(),
    enrollmentStatus: z.string().optional()
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
 *             type: object
 *             required:
 *               - studentId
 *               - firstName
 *               - lastName
 *               - grade
 *               - section
 *             properties:
 *               studentId:
 *                 type: string
 *                 description: Unique student identifier (required)
 *               firstName:
 *                 type: string
 *                 description: Student's first name (required)
 *               lastName:
 *                 type: string
 *                 description: Student's last name (required)
 *               grade:
 *                 type: string
 *                 description: Student's grade level (required)
 *               section:
 *                 type: string
 *                 description: Student's section (required)
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *                 description: Date of birth (optional, format YYYY-MM-DD)
 *               phone:
 *                 type: string
 *                 nullable: true
 *                 description: Phone number (optional)
 *               address:
 *                 type: string
 *                 nullable: true
 *                 description: Home address (optional)
 *               enrollmentStatus:
 *                 type: string
 *                 description: Enrollment status (optional, defaults to ACTIVE)
 *     responses:
 *       201:
 *         description: Student created successfully
 *       400:
 *         description: Validation error or Student ID already exists
 */



export const createStudent = async (req: Request, res: Response) => {
    try {
        const data = studentSchema.parse(req.body);

        const existing = await prisma.student.findUnique({ where: { studentId: data.studentId } });
        if (existing) {
            return res.status(400).json({ status: 'error', message: 'Student ID already exists' });
        }

        const student = await prisma.student.create({
            data: {
                ...data,
                dateOfBirth: data.dateOfBirth
            }
        });

        res.status(201).json({ status: 'success', data: student });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ status: 'error', message: 'Validation error', errors: error.issues });
        }
        res.status(500).json({ status: 'error', message: error.message });
    }
};

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
export const listStudents = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 10, search, grade, section, shift } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);

        const where: any = {
            deletedAt: null,
            ...(grade && { grade: String(grade) }),
            ...(section && { section: String(section) }),
            ...(search && {
                OR: [
                    { firstName: { contains: String(search), mode: 'insensitive' } },
                    { lastName: { contains: String(search), mode: 'insensitive' } },
                    { studentId: { contains: String(search), mode: 'insensitive' } }
                ]
            })
        };

        const [students, total] = await Promise.all([
            prisma.student.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
            prisma.student.count({ where })
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
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

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
export const getStudent = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const student = await prisma.student.findUnique({ where: { id: String(id) } });
        if (!student || student.deletedAt) {
            return res.status(404).json({ status: 'error', message: 'Student not found' });
        }
        res.status(200).json({ status: 'success', data: student });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

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
export const updateStudent = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const data = studentSchema.partial().parse(req.body);
        const updated = await prisma.student.update({
            where: { id: String(id) },
            data
        });
        res.status(200).json({ status: 'success', data: updated });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ status: 'error', message: 'Validation error', errors: error.issues });
        }
        res.status(500).json({ status: 'error', message: error.message });
    }
};

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
export const deleteStudent = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.student.update({
            where: { id: String(id) },
            data: { deletedAt: new Date() }
        });
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
