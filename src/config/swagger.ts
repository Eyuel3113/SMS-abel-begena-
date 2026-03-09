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
        path.join(process.cwd(), 'src/modules/**/*.controller.{ts,js}'),
        path.join(process.cwd(), 'src/modules/**/*.routes.{ts,js}'),
        path.join(process.cwd(), 'src/index.{ts,js}'),
        // Also scan dist if it exists
        path.join(process.cwd(), 'dist/modules/**/*.controller.js'),
        path.join(process.cwd(), 'dist/modules/**/*.routes.js'),
        path.join(process.cwd(), 'dist/index.js'),
    ],
};

export const swaggerSpec = swaggerJsdoc(options);
