const { Router } = require("express");
const {
  endorseAttendance,
  getAttendanceById,
  getAttendanceSummary,
} = require("../controllers/attendanceSummaryController");

const attendanceSummaryRouter = Router();

attendanceSummaryRouter.route("/").get(getAttendanceSummary);
attendanceSummaryRouter.route("/:id").get(getAttendanceById);
attendanceSummaryRouter.route("/endorse").post(endorseAttendance);

module.exports = attendanceSummaryRouter;
