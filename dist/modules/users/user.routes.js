"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const auth_1 = require("../../middlewares/auth");
const router = (0, express_1.Router)();
// Only ADMIN can manage teachers
router.use(auth_1.protect);
router.use((0, auth_1.restrictTo)('ADMIN'));
router.post('/teachers', user_controller_1.createTeacher);
router.get('/teachers', user_controller_1.listTeachers);
router.patch('/teachers/:id', user_controller_1.updateTeacher);
exports.default = router;
//# sourceMappingURL=user.routes.js.map