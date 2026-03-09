import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);

    if (err.name === 'ZodError') {
        return res.status(400).json({
            status: 'error',
            message: 'Validation error',
            errors: err.errors
        });
    }

    if (err.code === 'P2002') {
        return res.status(400).json({
            status: 'error',
            message: 'Duplicate field value entered'
        });
    }

    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        status: 'error',
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};
