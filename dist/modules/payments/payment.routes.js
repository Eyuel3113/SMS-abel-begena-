"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_controller_1 = require("./payment.controller");
const auth_1 = require("../../middlewares/auth");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
// Only ADMIN can record payments
router.post('/', (0, auth_1.restrictTo)('ADMIN'), payment_controller_1.recordPayment);
router.get('/student/:studentId', payment_controller_1.getStudentPayments);
router.get('/reports', (0, auth_1.restrictTo)('ADMIN'), payment_controller_1.getPaymentReports);
exports.default = router;
//# sourceMappingURL=payment.routes.js.map