"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshToken = exports.login = void 0;
const zod_1 = require("zod");
const prisma_1 = __importDefault(require("../../utils/prisma"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const auth_1 = require("../../utils/auth");
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string()
});
const login = async (req, res) => {
    try {
        const { email, password } = loginSchema.parse(req.body);
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user || !(await bcrypt_1.default.compare(password, user.password))) {
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
const refreshToken = async (req, res) => {
    // Basic implementation for rotation
    const { token } = req.body;
    if (!token)
        return res.status(400).json({ status: 'error', message: 'Token required' });
    // Verify and rotate... (simplified for now)
    res.status(200).json({ status: 'success', message: 'Token refreshed' });
};
exports.refreshToken = refreshToken;
//# sourceMappingURL=auth.controller.js.map