import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/auth';
import prisma from '../utils/prisma';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        role: string;
    };
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ status: 'error', message: 'Not authorized, no token' });
    }

    // Check if token is blacklisted
    const blacklisted = await prisma.tokenBlacklist.findUnique({
        where: { token }
    });

    if (blacklisted) {
        return res.status(401).json({ status: 'error', message: 'Token revoked' });
    }

    const decoded = verifyAccessToken(token);

    if (!decoded) {
        return res.status(401).json({ status: 'error', message: 'Not authorized, invalid token' });
    }

    const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, role: true, isActive: true }
    });

    if (!user || !user.isActive) {
        return res.status(401).json({ status: 'error', message: 'Not authorized, user not found or inactive' });
    }

    req.user = user;
    next();
};

export const restrictTo = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'error',
                message: 'You do not have permission to perform this action'
            });
        }
        next();
    };
};
