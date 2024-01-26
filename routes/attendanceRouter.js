const { Router } = require("express");

const {
  getAttendance,
  checkIn,
  getAttendanceByDate,
  startOvertime,
  checkOut,
  getClockOutAttendanceById,
  getClockInAttendance,
  getWeeklyOvertimeByDate,
  getWeeklyBreakByDate,
  getAttendanceById,
  startBreak,
} = require("../controllers/attendanceController");
const {
  validateBreakTime,
  validateOvertimeTime,
  validateClockInTime,
} = require("../middleware/validateTime");
const {
  verifyUserCheckinToken,
  verifyUserOvertimeToken,
  verifyUserBreakToken,
} = require("../middleware/validateToken");

const attendanceRouter = Router();

attendanceRouter.route("/").get(getAttendance);
attendanceRouter.route("/:id").get(getAttendanceById);
attendanceRouter.route("/date/:id").get(getAttendanceByDate);
attendanceRouter.route("/clock-in/:id").get(getClockInAttendance).post(checkIn);
attendanceRouter
  .route("/clock-out/:id")
  .patch(verifyUserCheckinToken, checkOut);
// .get(getClockOutAttendanceById)
attendanceRouter
  .route("/break/:id")
  .get(getWeeklyBreakByDate)
  .post(
    validateBreakTime,
    verifyUserCheckinToken,
    verifyUserBreakToken,
    startBreak
  );

attendanceRouter
  .route("/overtime/:id")
  .get(getWeeklyOvertimeByDate)
  .post(
    validateOvertimeTime,
    verifyUserCheckinToken,
    verifyUserOvertimeToken,
    startOvertime
  );

module.exports = attendanceRouter;
