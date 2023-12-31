const { Router } = require("express");
const {
  getAttendance,
  checkIn,
  startOvertime,
  checkOut,
  getClockOutAttendanceById,
  getAttendanceById,
  startBreak,
} = require("../controllers/attendanceController");
const {
  validateBreakTime,
  validateOvertimeTime,
} = require("../middleware/validateTime");
const {
  verifyUserCheckinToken,
  verifyUserOvertimeToken,
  verifyUserBreakToken,
} = require("../middleware/validateToken");

const attendanceRouter = Router();

attendanceRouter.route("/").get(getAttendance);
attendanceRouter.route("/:id").get(getAttendanceById);
attendanceRouter.route("/clock-in/:id").post(checkIn);
attendanceRouter
  .route("/clock-out/:id")
  .get(getClockOutAttendanceById)
  .patch(checkOut);
attendanceRouter
  .route("/break/:id")
  .post(
    validateBreakTime,
    verifyUserCheckinToken,
    verifyUserBreakToken,
    startBreak
  );
attendanceRouter
  .route("/overtime/:id")
  .post(validateOvertimeTime, verifyUserOvertimeToken, startOvertime);

module.exports = attendanceRouter;
