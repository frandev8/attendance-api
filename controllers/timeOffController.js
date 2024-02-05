const { timeOffDB, isTimeOffFormValid } = require("../models/timeOffDB");
const { employeeDB } = require("../models/employeeDB");
const asyncHandler = require("express-async-handler");
const {
  doesDepartEarly,
  doesArriveLate,
  filterDateByRange,
} = require("../utils/date");
const { response } = require("express");

const getTimeOff = asyncHandler(async (req, res) => {
  const { accepted, pending, filter: filteredDate } = req.query;

  const timeOff = await timeOffDB.find().lean();

  if (!timeOff.length) {
    return res.status(400).type("json").send({ msg: "No timeOff found!" });
  }

  if (accepted) {
    const targetDate = new Date(filteredDate); // Set the target date

    targetDate.setHours(0, 0, 0, 0);

    const approvedTimeOff = await timeOffDB.find({ status: "approved" }).exec();

    if (!approvedTimeOff.length) {
      return res.status(400).type("json").send({ msg: "No time-off found!" });
    }

    const filterTimeOffPromise = filterDateByRange(
      approvedTimeOff,
      targetDate,
      "startDate",
      "endDate"
    );

    const filterTimeOff = await Promise.all(filterTimeOffPromise);

    const adjustFilterTimeOffPromise = filterTimeOff.map(async (timeOff) => {
      const employee = await employeeDB.findById(timeOff.userId);
      // const avatar = await avatarDB.findOne({ clientId: timeOff.userId });

      return {
        ...timeOff,
        firstname: employee?.firstname,
        // avatarUrl: avatar ? avatar?.myFile : undefined,
      };
    });

    const adjustFilterTimeOff = await Promise.all(adjustFilterTimeOffPromise);

    return res.status(200).json(adjustFilterTimeOff);
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

        return {
          ...timeOff,
          username: employee?.username,
          firstname: employee?.firstname,
          lastname: employee?.lastname,
        };
      }
    );
    const modifiedPendingTimeOff = await Promise.all(
      modifiedPendingTimeOffPromises
    );

    return res.status(200).json(modifiedPendingTimeOff);
  }

  if (filteredDate) {
    const targetDate = new Date(filteredDate); // Set the target date

    const approvedTimeOff = await timeOffDB.find({ status: "approved" }).exec();

    if (!approvedTimeOff.length) {
      return res.status(400).type("json").send({ msg: "No time-off found!" });
    }

    console.log("target date", targetDate);

    const filterTimeOffPromise = filterDateByRange(
      approvedTimeOff,
      targetDate,
      "startDate",
      "endDate"
    );

    const filterTimeOff = await Promise.all(filterTimeOffPromise);

    console.log(filterTimeOff, "filtered time-Off", approvedTimeOff);

    const adjustFilterTimeOffPromise = filterTimeOff.map(async (timeOff) => {
      const employee = await employeeDB.findById(timeOff.userId);
      // const avatar = await avatarDB.findOne({ clientId: timeOff.userId });

      return {
        ...timeOff,
        firstname: employee?.firstname,
        // avatarUrl: avatar ? avatar?.myFile : undefined,
      };
    });

    const adjustFilterTimeOff = await Promise.all(adjustFilterTimeOffPromise);

    return res.status(200).json(adjustFilterTimeOff);
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
 * @desc delete attendance
 * @route Post /user
 * @access Public
 */

const deleteTimeOff = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const timeOff = await timeOffDB.findById(id).lean();

    if (!timeOff.length) {
      return res.status(400).type("json").send({ msg: "No timeOff found!" });
    }

    const deletedTimeOff = await timeOffDB.deleteOne(id);

    res.status(200).json({ msg: "TimeOff successfully deleted" });
  } catch (e) {
    console.log();
  }
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
  deleteTimeOff,
  getTimeOff,
  getTimeOffById,
};
