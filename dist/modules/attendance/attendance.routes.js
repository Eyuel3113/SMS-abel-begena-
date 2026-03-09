"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const attendance_controller_1 = require("./attendance.controller");
const auth_1 = require("../../middlewares/auth");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router.post('/', (req, res, next) => (0, attendance_controller_1.recordAttendance)(req, res).catch(next));
router.post('/check-in', attendance_controller_1.checkIn);
router.get('/summary', attendance_controller_1.getAttendanceSummary);
exports.default = router;
//# sourceMappingURL=attendance.routes.js.map