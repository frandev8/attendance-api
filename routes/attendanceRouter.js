const { Router } = require("express");
const {
  getAttendance,
  checkIn,
  checkOut,
  confirmAttendance,
  getAttendanceById,
} = require("../controllers/attendanceController");

const attendanceRouter = Router();

attendanceRouter.route("/").get(getAttendance);
attendanceRouter.route("/:id").get(getAttendanceById);

attendanceRouter.route("/clockIn").post(checkIn);
attendanceRouter.route("/clockOut").patch(checkOut);
attendanceRouter.route("/confirm").post(confirmAttendance);

module.exports = attendanceRouter;
