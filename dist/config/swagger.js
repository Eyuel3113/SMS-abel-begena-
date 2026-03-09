"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
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
                        firstName: { type: 'string' },
                        lastName: { type: 'string' },
                        grade: { type: 'string' },
                        section: { type: 'string' },
                        dateOfBirth: { type: 'string', format: 'date' },
                        phone: { type: 'string' },
                        address: { type: 'string' },
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
    // SCAN everything in src and dist to be 100% sure
    apis: [
        './src/**/*.ts',
        './dist/**/*.js',
        './src/index.ts',
        './dist/index.js'
    ],
};
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(options);
//# sourceMappingURL=swagger.js.map