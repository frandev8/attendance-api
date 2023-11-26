const { Router } = require("express");
const {
  getConfirmedTimeOff,
  createNewTimeOff,
  acceptTimeOff,
  rejectTimeOff,
  getTimeOff,
} = require("../controllers/timeOffController");

const timeOffRouter = Router();

timeOffRouter.route("/").get(getTimeOff);
timeOffRouter.route("/confirmed").get(getConfirmedTimeOff);
timeOffRouter.route("/create").post(createNewTimeOff);
timeOffRouter.route("/:id/accept").post(acceptTimeOff);
timeOffRouter.route("/:id/reject").post(rejectTimeOff);

module.exports = timeOffRouter;
