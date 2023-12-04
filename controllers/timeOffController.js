const { timeOffDB, isTimeOffFormValid } = require("../models/timeOffDB");
const asyncHandler = require("express-async-handler");
const { verifyClockInToken } = require("../utils/verifyClockInToken");
const { doesDepartEarly, doesArriveLate } = require("../utils/checkTimeStatus");

const getTimeOff = asyncHandler(async (req, res) => {
  const { approved, pending } = req.query;

  const timeOff = await timeOffDB.find().lean();

  if (!timeOff.length) {
    return res.status(400).type("json").send({ msg: "No timeOff found!" });
  }

  if (approved) {
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

    return res.status(200).json(pendingTimeOff);
  }

  res.status(200).json(timeOff);
});

const getTimeOffById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const timeOff = await timeOffDB.find({ userId: id }).lean();

  if (!timeOff.length) {
    return res.status(400).type("json").send({ msg: "No timeOff found!" });
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

  console.log("clicked");
  try {
    const { error } = isTimeOffFormValid({ type, startDate, endDate, reason });
    if (error) {
      return res.status(404).json({ msg: error.details[0].message });
    }

    // create new timeOff
    const timeOff = await timeOffDB.create({
      userId: "654acbf48626cf74c1d45549",
      type,
      startDate,
      endDate,
      reason,
    });

    // success
    res.status(201).json({
      msg: `Time-off created!`,
    });

    console.log("success");
  } catch (e) {
    console.log(e.message);
    res.status(500).json({ msg: "internal server error" });
  }
  // res.status(200).json(attendance);
});

/**
 * @desc Get attendance by id
 * @route Get/attendance
 * @access public
 */
const getConfirmedTimeOff = asyncHandler(async (req, res) => {
  // const { id } = req.params;
  // const attendance = await attendanceDB.find({ status: "pending" }).lean();
  // if (!attendance.length) {
  //   return res.status(400).type("json").send({ msg: "No attendance found!" });
  // }
  // res.status(200).json(attendance);
});

/**
 * @desc accept attendance
 * @route Post /admin
 * @access Private
 */
const acceptTimeOff = asyncHandler(async (req, res) => {
  // const { attendanceId } = req.body;
  // const userId = "654acbf48626cf74c1d45549" || req.user.userId;
  // try {
  //   const employee = await employeeDB.findById(userId).exec();
  //   if (!employee) {
  //     return res.status(401).type("json").send({ msg: "bad request" });
  //   }
  //   const attendance = await attendanceDB.findById(attendanceId).exec();
  //   if (!attendance) {
  //     return res.status(401).type("json").send({ msg: "bad request" });
  //   }
  //   // console.log(attendance.clockInTime, "control in");
  //   // console.log(attendance.clockOutTime, "control out");
  //   const attendanceSummary = await attendanceSummaryDB.create({
  //     userId: employee._id,
  //     attendanceId: attendance._id,
  //     confirmationTime: new Date(),
  //     reason: "attendance record verified",
  //     status: "confirmed",
  //     departEarly: doesDepartEarly(attendance.clockOutTime),
  //     arriveLate: doesArriveLate(attendance.clockInTime),
  //     onTime: !doesArriveLate(attendance.clockInTime),
  //   });
  //   await attendanceSummary.save();
  //   attendance.status = "confirmed";
  //   await attendance.save();
  //   // attendance created
  //   res.status(201).json({ message: "attendance confirmed successful" });
  // } catch (e) {
  //   console.log(e.message);
  //   res.status(500).json({ msg: "internal server error" });
  // }
});

/**
 * @desc reject timeOff
 * @route Post /admin
 * @access private
 */

const rejectTimeOff = asyncHandler(async (req, res) => {
  // const { attendanceId } = req.body;
  // const userId = "654acbf48626cf74c1d45549" || req.user.id;
  // try {
  //   const employee = await employeeDB.findById(userId).lean();
  //   if (!employee) {
  //     return res.status(401).type("json").send({ msg: "bad request" });
  //   }
  //   const attendance = await attendanceDB.findById(attendanceId).exec();
  //   if (!attendance) {
  //     return res.status(401).type("json").send({ msg: "bad request" });
  //   }
  //   await attendanceSummaryDB.create({
  //     userId: employee._id,
  //     attendanceId: attendance._id,
  //     confirmationTime: new Date(),
  //     reason: "bad attendance record",
  //     status: "rejected",
  //     departEarly: doesDepartEarly(attendance.clockOutTime),
  //     arriveLate: doesArriveLate(attendance.clockInTime),
  //     onTime: !doesArriveLate(attendance.clockInTime),
  //   });
  //   attendance.status = "rejected";
  //   await attendance.save();
  //   // attendance created
  //   res.status(201).json({ message: "attendance rejected" });
  // } catch (e) {
  //   res.status(500).json({ msg: "internal server error" });
  // }
});

module.exports = {
  getConfirmedTimeOff,
  createNewTimeOff,
  acceptTimeOff,
  rejectTimeOff,
  getTimeOff,
  getTimeOffById,
};
