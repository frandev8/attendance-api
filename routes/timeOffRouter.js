const { Router } = require("express");
const {
  getConfirmedTimeOff,
  createNewTimeOff,
  acceptTimeOff,
  rejectTimeOff,
  getTimeOff,
  getTimeOffById,
} = require("../controllers/timeOffController");

const timeOffRouter = Router();

timeOffRouter.route("/").get(getTimeOff);
timeOffRouter.route("/:id").get(getTimeOffById);
timeOffRouter.route("/new").post(createNewTimeOff);
timeOffRouter.route("/confirmed").get(getConfirmedTimeOff);
timeOffRouter.route("/:id/accept").post(acceptTimeOff);
timeOffRouter.route("/:id/reject").post(rejectTimeOff);

module.exports = timeOffRouter;
