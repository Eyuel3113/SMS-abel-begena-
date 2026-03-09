"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const class_controller_1 = require("./class.controller");
const auth_1 = require("../../middlewares/auth");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
// Classes
router.post('/classes', (0, auth_1.restrictTo)('ADMIN'), class_controller_1.createClass);
router.get('/classes', class_controller_1.listClasses);
// Schedules
router.post('/schedules', (0, auth_1.restrictTo)('ADMIN'), class_controller_1.createSchedule);
router.get('/schedules', class_controller_1.listSchedules);
exports.default = router;
//# sourceMappingURL=class.routes.js.map