const { Router } = require("express");
const {
  acceptAttendance,
  rejectAttendance,
  getAttendance,
  getPendingAttendance,
  getAttendanceById,
  getAbsenceAttendance,
  getOnTimeAttendance,
  getEarlyDepartureAttendance,
  getLateAttendance,
} = require("../controllers/attendanceSummaryController");

const attendanceSummaryRouter = Router();

attendanceSummaryRouter.route("/pending").get(getPendingAttendance);
attendanceSummaryRouter.route("/onTime").get(getOnTimeAttendance);
attendanceSummaryRouter.route("/absent").get(getAbsenceAttendance);
attendanceSummaryRouter
  .route("/early-departure")
  .get(getEarlyDepartureAttendance);
attendanceSummaryRouter.route("/late").get(getLateAttendance);
attendanceSummaryRouter.route("/").get(getAttendance);
attendanceSummaryRouter.route("/:id").get(getAttendanceById);
attendanceSummaryRouter.route("/:id/accept").post(acceptAttendance);
attendanceSummaryRouter.route("/:id/reject").post(rejectAttendance);

module.exports = attendanceSummaryRouter;
