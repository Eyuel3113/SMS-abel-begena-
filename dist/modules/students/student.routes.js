"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const student_controller_1 = require("./student.controller");
const auth_1 = require("../../middlewares/auth");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router.post('/', (0, auth_1.restrictTo)('ADMIN'), student_controller_1.createStudent);
router.get('/', student_controller_1.listStudents);
router.get('/:id', student_controller_1.getStudent);
router.patch('/:id', (0, auth_1.restrictTo)('ADMIN'), student_controller_1.updateStudent);
router.delete('/:id', (0, auth_1.restrictTo)('ADMIN'), student_controller_1.deleteStudent);
exports.default = router;
//# sourceMappingURL=student.routes.js.map