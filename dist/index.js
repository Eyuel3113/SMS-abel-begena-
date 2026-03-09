"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables as early as possible
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = require("./config/swagger");
const error_1 = require("./middlewares/error");
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Swagger
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec));
// Security Middlewares
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Logging
app.use((0, morgan_1.default)('dev'));
// Rate Limiting
const limiter = (0, express_rate_limit_1.default)({
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
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const user_routes_1 = __importDefault(require("./modules/users/user.routes"));
const student_routes_1 = __importDefault(require("./modules/students/student.routes"));
const class_routes_1 = __importDefault(require("./modules/classes/class.routes"));
const attendance_routes_1 = __importDefault(require("./modules/attendance/attendance.routes"));
const payment_routes_1 = __importDefault(require("./modules/payments/payment.routes"));
const report_routes_1 = __importDefault(require("./modules/reports/report.routes"));
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/students', student_routes_1.default);
app.use('/api', class_routes_1.default);
app.use('/api/attendance', attendance_routes_1.default);
app.use('/api/payments', payment_routes_1.default);
app.use('/api/reports', report_routes_1.default);
// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Smart School Management System API is healthy',
        timestamp: new Date().toISOString()
    });
});
// Global Error Handler
app.use(error_1.errorHandler);
// Server Start
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
    console.log(`[server]: API Docs: http://localhost:${port}/api-docs`);
});
exports.default = app;
//# sourceMappingURL=index.js.map