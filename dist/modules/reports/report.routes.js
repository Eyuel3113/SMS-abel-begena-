"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const report_controller_1 = require("./report.controller");
const auth_1 = require("../../middlewares/auth");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router.use((0, auth_1.restrictTo)('ADMIN'));
router.get('/attendance', report_controller_1.generateAttendanceReport);
router.get('/payments', report_controller_1.generatePaymentReport);
exports.default = router;
//# sourceMappingURL=report.routes.js.map