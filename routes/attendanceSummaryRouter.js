const { Router } = require("express");
const {
  acceptAttendance,
  rejectAttendance,
  getAttendanceById,
  getAttendanceSummary,
} = require("../controllers/attendanceSummaryController");

const attendanceSummaryRouter = Router();

attendanceSummaryRouter.route("/").get(getAttendanceSummary);
attendanceSummaryRouter.route("/:id").get(getAttendanceById);
attendanceSummaryRouter.route("/:id/accept").post(acceptAttendance);
attendanceSummaryRouter.route("/:id/reject").post(rejectAttendance);

module.exports = attendanceSummaryRouter;
