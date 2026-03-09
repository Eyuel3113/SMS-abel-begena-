import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

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
        path.resolve(__dirname, '../modules/**/*.controller.ts'),
        path.resolve(__dirname, '../modules/**/*.routes.ts'),
    ],
};

export const swaggerSpec = swaggerJsdoc(options);
