import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../../utils/prisma';
import bcrypt from 'bcrypt';
import { generateAccessToken, generateRefreshToken, verifyAccessToken } from '../../utils/auth';

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string()
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = loginSchema.parse(req.body);

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
        }

        const accessToken = generateAccessToken({ id: user.id, role: user.role });
        const refreshToken = generateRefreshToken({ id: user.id, role: user.role });

        res.status(200).json({
            status: 'success',
            data: {
                user: { id: user.id, email: user.email, role: user.role },
                accessToken,
                refreshToken
            }
        });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ status: 'error', message: 'Validation error', errors: error.issues });
        }
        res.status(500).json({ status: 'error', message: error.message });
    }
};

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token: { type: string }
 *     responses:
 *       200:
 *         description: Token refreshed
 *       400:
 *         description: Token required
 */
export const refreshToken = async (req: Request, res: Response) => {
    // Basic implementation for rotation
    const { token } = req.body;
    if (!token) return res.status(400).json({ status: 'error', message: 'Token required' });
    // Verify and rotate... (simplified for now)
    res.status(200).json({ status: 'success', message: 'Token refreshed' });
};

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: User logout
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
export const logout = async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(400).json({ status: 'error', message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyAccessToken(token);

        if (decoded) {
            // Save to blacklist with expiration
            await prisma.tokenBlacklist.create({
                data: {
                    token,
                    expiresAt: new Date(decoded.exp * 1000)
                }
            });
        }

        res.status(200).json({ status: 'success', message: 'Logged out successfully' });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
