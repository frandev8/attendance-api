const { timeOffDB, isTimeOffFormValid } = require("../models/timeOffDB");
const { employeeDB } = require("../models/employeeDB");
const asyncHandler = require("express-async-handler");
const { verifyClockInToken } = require("../utils/verifyClockInToken");
const { doesDepartEarly, doesArriveLate } = require("../utils/checkTimeStatus");
const { response } = require("express");

const getTimeOff = asyncHandler(async (req, res) => {
  const { accepted, pending } = req.query;

  const timeOff = await timeOffDB.find().lean();

  if (!timeOff.length) {
    return res.status(400).type("json").send({ msg: "No timeOff found!" });
  }

  if (accepted) {
    const approvedTimeOff = await timeOffDB.find({ status: "approved" }).lean();

    if (!approvedTimeOff.length) {
      return res
        .status(400)
        .type("json")
        .send({ msg: "No approved time-off found!" });
    }

    return res.status(200).json(approvedTimeOff);
  }

  if (pending) {
    const pendingTimeOff = await timeOffDB.find({ status: "pending" }).lean();

    if (!pendingTimeOff.length) {
      return res
        .status(400)
        .type("json")
        .send({ msg: "No pending time-off found!" });
    }

    const modifiedPendingTimeOffPromises = pendingTimeOff.map(
      async (timeOff) => {
        const employee = await employeeDB.findById(timeOff.userId);

        return { ...timeOff, username: employee.username };
      }
    );
    const modifiedPendingTimeOff = await Promise.all(
      modifiedPendingTimeOffPromises
    );

    return res.status(200).json(modifiedPendingTimeOff);
  }

  res.status(200).json(timeOff);
});

const getTimeOffById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.query;

  const timeOff = await timeOffDB.find({ userId: id }).lean();

  if (!timeOff.length) {
    return res.status(400).type("json").send({ msg: "No timeOff found!" });
  }

  if (status === "approved") {
    const approved = timeOff.filter((leave) => leave.status === "approved");

    return res.status(200).json(approved);
  }
  res.status(200).json(timeOff);
});

/**
 * @desc create new timeOff
 * @route Post / timeOff
 * @access public
 */
const createNewTimeOff = asyncHandler(async (req, res) => {
  const { type, startDate, endDate, reason } = req.body;
  const { id } = req.params;
  try {
    const { error } = isTimeOffFormValid({ type, startDate, endDate, reason });
    if (error) {
      return res.status(404).json({ msg: error.details[0].message });
    }

    // create new timeOff
    const timeOff = await timeOffDB.create({
      userId: id,
      type,
      startDate,
      endDate,
      reason,
    });

    // success
    res.status(201).json({
      msg: `Time-off created!`,
    });
  } catch (e) {
    console.log(e.message);
    res.status(500).json({ msg: "internal server error" });
  }
  // res.status(200).json(attendance);
});

/**
 * @desc accept attendance
 * @route Post /admin
 * @access Private
 */
const endorseTimeOff = asyncHandler(async (req, res) => {
  const { action } = req.query;
  const { timeOffId, adminId } = req.body;

  console.log("called");

  try {
    const timeOff = await timeOffDB.findById(timeOffId).exec();

    if (!timeOff) {
      res.status(401).type("json").send({ msg: "Unauthorized time-off id" });
    }

    if (action === "accept") {
      console.log("accepted");
      timeOff.status = "approved";
      timeOff.adminId = adminId;
      await timeOff.save();

      return res.status(200).json({ msg: "Successful request" });
    }

    if (action === "decline") {
      timeOff.status = "rejected";
      timeOff.adminId = adminId;
      await timeOff.save();

      return res.status(200).json({ msg: "Successful request" });
    }

    res.status(400).json({ msg: "bad request" });
  } catch (e) {
    console.log(e.message);
    res.status(500).json({ msg: "internal server error" });
  }
});

module.exports = {
  createNewTimeOff,
  endorseTimeOff,
  getTimeOff,
  getTimeOffById,
};
