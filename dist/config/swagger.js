"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const path_1 = __importDefault(require("path"));
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Smart School Management System API',
            version: '1.0.0',
            description: 'API documentation for Abel Begena School SMS',
        },
        servers: [
            {
                url: '/api',
                description: 'Relative API Path'
            },
            {
                url: 'http://localhost:3000/api',
                description: 'Local development server'
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                Student: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        studentId: { type: 'string' },
                        fullName: { type: 'string' },
                        grade: { type: 'string' },
                        section: { type: 'string' },
                        shift: { type: 'string', enum: ['MORNING', 'AFTERNOON'] },
                        enrollmentStatus: { type: 'string' }
                    }
                },
                Login: {
                    type: 'object',
                    properties: {
                        email: { type: 'string' },
                        password: { type: 'string' }
                    }
                }
            }
        },
    },
    // Scan BOTH .ts (local) and .js (Vercel) files using process.cwd()
    apis: [
        path_1.default.join(process.cwd(), 'src/modules/**/*.controller.{ts,js}'),
        path_1.default.join(process.cwd(), 'src/modules/**/*.routes.{ts,js}'),
        path_1.default.join(process.cwd(), 'src/index.{ts,js}'),
        // Also scan dist if it exists
        path_1.default.join(process.cwd(), 'dist/modules/**/*.controller.js'),
        path_1.default.join(process.cwd(), 'dist/modules/**/*.routes.js'),
        path_1.default.join(process.cwd(), 'dist/index.js'),
    ],
};
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(options);
//# sourceMappingURL=swagger.js.map