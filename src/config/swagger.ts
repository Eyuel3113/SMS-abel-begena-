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

export const swaggerSpec = swaggerJsdoc(options);
