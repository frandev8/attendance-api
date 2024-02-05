const { Router } = require("express");

const {
  getAttendance,
  checkIn,
  getAttendanceByDate,
  startOvertime,
  checkOut,
  getClockOutAttendanceById,
  getAutoClockOutAttendanceById,
  getClockInAttendance,
  getWeeklyOvertimeByDate,
  getAutoEndOvertimeAttendanceById,
  getAutoEndBreakAttendanceById,
  getWeeklyBreakByDate,
  getAttendanceById,
  startBreak,
} = require("../controllers/attendanceController");
const {
  validateClockInTime,
  validateBreakTime,
  validateOvertimeTime,
} = require("../middleware/validateTime");
const {
  verifyUserCheckinToken,
  verifyUserOvertimeToken,
  verifyUserBreakToken,
  verifyUserCheckoutToken,
} = require("../middleware/validateToken");

const attendanceRouter = Router();

attendanceRouter.route("/").get(getAttendance);
attendanceRouter.route("/:id").get(getAttendanceById);
attendanceRouter.route("/date/:id").get(getAttendanceByDate);
attendanceRouter
  .route("/clock-in/:id")
  .get(getClockInAttendance)
  .post(validateClockInTime, checkIn);
attendanceRouter
  .route("/auto/clock-out/:id")
  .get(getAutoClockOutAttendanceById);
attendanceRouter
  .route("/clock-out/:id")
  .patch(/**  validateClockInTime,*/ verifyUserCheckinToken, checkOut)
  .get(getClockOutAttendanceById);
attendanceRouter.route("/auto/break/:id").get(getAutoEndBreakAttendanceById);
attendanceRouter.route("/break/:id").get(getWeeklyBreakByDate).post(
  // validateBreakTime,
  verifyUserCheckinToken,
  verifyUserBreakToken,
  startBreak
);

attendanceRouter
  .route("/auto/overtime/:id")
  .get(getAutoEndOvertimeAttendanceById);
attendanceRouter
  .route("/overtime/:id")
  .get(getWeeklyOvertimeByDate)
  .post(
    validateOvertimeTime,
    verifyUserCheckoutToken,
    verifyUserOvertimeToken,
    startOvertime
  );

module.exports = attendanceRouter;
