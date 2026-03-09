# Smart School Management System (SMS) Backend

This is the production-ready backend API for Abel Begena School SMS.

## Tech Stack
- Node.js & TypeScript
- Express.js
- PostgreSQL
- Prisma ORM
- Swagger for Documentation
- Zod for Validation
- JWT for Authentication

## Setup Instructions

1. **Clone the repository**
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Configure Environment Variables**
   Create a `.env` file from the provided template.
4. **Database Migration**
   ```bash
   npx prisma migrate dev
   ```
5. **Seed Default Data**
   ```bash
   npm run seed
   ```
6. **Start Development Server**
   ```bash
   npm run dev
   ```

## API Documentation
Once the server is running, access Swagger UI at:
`http://localhost:3000/api-docs`

## Features
- RBAC (ADMIN, TEACHER)
- User Management (Teacher CRUD)
- Student Management (CRUD + Pagination + Search)
- Class & Schedule Management (Shift & Conflict Prevention)
- Attendance Management (Daily/Weekly/Monthly)
- Payment Tracking (Admin restricted)
- PDF Reports Generation
# SMS-abel-begena-
