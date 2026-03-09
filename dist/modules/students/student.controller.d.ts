import { Request, Response } from 'express';
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
export declare const createStudent: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
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
export declare const listStudents: (req: Request, res: Response) => Promise<void>;
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
export declare const getStudent: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
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
export declare const updateStudent: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
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
export declare const deleteStudent: (req: Request, res: Response) => Promise<void>;
