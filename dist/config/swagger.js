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
                url: 'http://localhost:3000/api',
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
    // Use absolute paths to avoid glob issues on Windows
    apis: [
        path_1.default.resolve(__dirname, '../modules/**/*.controller.ts'),
        path_1.default.resolve(__dirname, '../modules/**/*.routes.ts'),
    ],
};
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(options);
//# sourceMappingURL=swagger.js.map