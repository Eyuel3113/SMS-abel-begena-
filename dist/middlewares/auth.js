"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restrictTo = exports.protect = void 0;
const auth_1 = require("../utils/auth");
const prisma_1 = __importDefault(require("../utils/prisma"));
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return res.status(401).json({ status: 'error', message: 'Not authorized, no token' });
    }
    const decoded = (0, auth_1.verifyAccessToken)(token);
    if (!decoded) {
        return res.status(401).json({ status: 'error', message: 'Not authorized, invalid token' });
    }
    const user = await prisma_1.default.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, role: true, isActive: true }
    });
    if (!user || !user.isActive) {
        return res.status(401).json({ status: 'error', message: 'Not authorized, user not found or inactive' });
    }
    req.user = user;
    next();
};
exports.protect = protect;
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'error',
                message: 'You do not have permission to perform this action'
            });
        }
        next();
    };
};
exports.restrictTo = restrictTo;
//# sourceMappingURL=auth.js.map