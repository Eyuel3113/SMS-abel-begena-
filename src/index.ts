import dotenv from 'dotenv';
// Load environment variables as early as possible
dotenv.config();

import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { errorHandler } from './middlewares/error';

const app: Express = express();
const port = process.env.PORT || 3000;

// Swagger
const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css";
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { customCssUrl: CSS_URL }));

// Security Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('dev'));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        message: 'Too many requests, please try again later.'
    }
});
app.use('/api', limiter);

// Routes
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/user.routes';
import studentRoutes from './modules/students/student.routes';
import classRoutes from './modules/classes/class.routes';
import attendanceRoutes from './modules/attendance/attendance.routes';
import paymentRoutes from './modules/payments/payment.routes';
import reportRoutes from './modules/reports/report.routes';

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api', classRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);

// Health Check
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'success',
        message: 'Smart School Management System API is healthy',
        timestamp: new Date().toISOString()
    });
});

// Global Error Handler
app.use(errorHandler);

// Server Start
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`[server]: Server is running at http://localhost:${port}`);
        console.log(`[server]: API Docs: http://localhost:${port}/api-docs`);
    });
}

export default app;
