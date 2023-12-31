const { Router } = require("express");
const {
  createNewTimeOff,
  endorseTimeOff,
  getTimeOff,
  getTimeOffById,
} = require("../controllers/timeOffController");

const timeOffRouter = Router();

timeOffRouter.route("/").get(getTimeOff);
timeOffRouter.route("/endorse").post(endorseTimeOff);
timeOffRouter.route("/:id").get(getTimeOffById);
timeOffRouter.route("/new/:id").post(createNewTimeOff);

module.exports = timeOffRouter;
