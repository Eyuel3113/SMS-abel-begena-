"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.refreshToken = exports.login = void 0;
const zod_1 = require("zod");
const prisma_1 = __importDefault(require("../../utils/prisma"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const auth_1 = require("../../utils/auth");
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string()
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
const login = async (req, res) => {
    try {
        const { email, password } = loginSchema.parse(req.body);
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user || !(await bcryptjs_1.default.compare(password, user.password))) {
            return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
        }
        const accessToken = (0, auth_1.generateAccessToken)({ id: user.id, role: user.role });
        const refreshToken = (0, auth_1.generateRefreshToken)({ id: user.id, role: user.role });
        res.status(200).json({
            status: 'success',
            data: {
                user: { id: user.id, email: user.email, role: user.role },
                accessToken,
                refreshToken
            }
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ status: 'error', message: 'Validation error', errors: error.issues });
        }
        res.status(500).json({ status: 'error', message: error.message });
    }
};
exports.login = login;
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
const refreshToken = async (req, res) => {
    // Basic implementation for rotation
    const { token } = req.body;
    if (!token)
        return res.status(400).json({ status: 'error', message: 'Token required' });
    // Verify and rotate... (simplified for now)
    res.status(200).json({ status: 'success', message: 'Token refreshed' });
};
exports.refreshToken = refreshToken;
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
const logout = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(400).json({ status: 'error', message: 'No token provided' });
        }
        const token = authHeader.split(' ')[1];
        const decoded = (0, auth_1.verifyAccessToken)(token);
        if (decoded) {
            // Save to blacklist with expiration
            await prisma_1.default.tokenBlacklist.create({
                data: {
                    token,
                    expiresAt: new Date(decoded.exp * 1000)
                }
            });
        }
        res.status(200).json({ status: 'success', message: 'Logged out successfully' });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
exports.logout = logout;
//# sourceMappingURL=auth.controller.js.map