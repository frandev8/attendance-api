const { attendanceDB } = require("../models/attendanceDB");
const { employeeDB } = require("../models/employeeDB");
const { attendanceSummaryDB } = require("../models/attendanceSummaryDB");
const asyncHandler = require("express-async-handler");
const { verifyClockInToken } = require("../utils/verifyClockInToken");
const { doesDepartEarly, doesArriveLate } = require("../utils/checkTimeStatus");
const checkIfWeekend = require("../utils/checkIfWeekend");

const getAttendance = asyncHandler(async (req, res) => {
  const attendance = await attendanceDB.find({}).lean();

  if (!attendance.length) {
    return res.status(400).type("json").send({ msg: "No attendance found!" });
  }

  res.status(200).json(attendance);
});

const getAttendanceSummary = asyncHandler(async (req, res) => {
  const { late, onTime, earlyDeparture, absent } = req.query;

  const attendanceSummary = await attendanceSummaryDB.find().lean();

  if (!attendanceSummary.length) {
    return res
      .status(400)
      .type("json")
      .send({ msg: "No attendance summary found!" });
  }

  if (late) {
    const lateResult = attendanceSummary.filter(
      (summary) => summary.arriveLate
    );

    if (!lateResult) {
      return res.status(400).type("json").send({ msg: "No late found!" });
    }

    return res.status(200).json(lateResult);
  }

  if (onTime) {
    const onTimeResult = attendanceSummary.filter((summary) => summary.onTime);

    if (!onTimeResult) {
      return res.status(400).type("json").send({ msg: "No on time found!" });
    }
    return res.status(200).json(onTimeResult);
  }

  if (earlyDeparture) {
    const earlyDepartResult = attendanceSummary.filter(
      (summary) => summary.departEarly
    );
    if (!earlyDepartResult) {
      return res
        .status(400)
        .type("json")
        .send({ msg: "No on early departure found!" });
    }

    return res.status(200).json(earlyDepartResult);
  }

  if (absent) {
    const absentResult = attendanceSummary.filter(
      (summary) => summary.isAbsent
    );

    const weekdayAbsent = absentResult.filter((absent) => {
      const date = absent.confirmationTime;

      const isDateWeekend = checkIfWeekend(date);

      return !isDateWeekend;
    });

    if (!weekdayAbsent) {
      return res.status(400).type("json").send({ msg: "No on absent found!" });
    }

    return res.status(200).json(weekdayAbsent);
  }

  res.status(200).json(attendanceSummary);
});

/**
 * @desc Get attendance by id
 * @route Get/attendance
 * @access public
 */
const getAttendanceById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const attendance = await attendanceDB.find({ userId: id }).lean();

  if (!attendance.length) {
    return res.status(400).type("json").send({ msg: "No attendance found!" });
  }

  res.status(200).json(attendance);
});

/**
 * @desc accept attendance
 * @route Post /admin
 * @access Private
 */
const acceptAttendance = asyncHandler(async (req, res) => {
  const { attendanceId } = req.body;

  const userId = "654acbf48626cf74c1d45549" || req.user.userId;

  try {
    const employee = await employeeDB.findById(userId).exec();

    if (!employee) {
      return res.status(401).type("json").send({ msg: "bad request" });
    }

    const attendance = await attendanceDB.findById(attendanceId).exec();
    if (!attendance) {
      return res.status(401).type("json").send({ msg: "bad request" });
    }

    // console.log(attendance.clockInTime, "control in");
    // console.log(attendance.clockOutTime, "control out");

    const attendanceSummary = await attendanceSummaryDB.create({
      userId: employee._id,
      attendanceId: attendance._id,
      confirmationTime: new Date(),
      reason: "attendance record verified",
      status: "confirmed",
      departEarly: doesDepartEarly(attendance.clockOutTime),
      arriveLate: doesArriveLate(attendance.clockInTime),
      onTime: !doesArriveLate(attendance.clockInTime),
    });

    await attendanceSummary.save();

    attendance.status = "confirmed";
    await attendance.save();

    // attendance created
    res.status(201).json({ message: "attendance confirmed successful" });
  } catch (e) {
    console.log(e.message);
    res.status(500).json({ msg: "internal server error" });
  }
});

/**
 * @desc reject attendance
 * @route Post /admin *
 * @access Private
 */

const rejectAttendance = asyncHandler(async (req, res) => {
  const { attendanceId } = req.body;

  const userId = "654acbf48626cf74c1d45549" || req.user.id;

  try {
    const employee = await employeeDB.findById(userId).lean();

    if (!employee) {
      return res.status(401).type("json").send({ msg: "bad request" });
    }

    const attendance = await attendanceDB.findById(attendanceId).exec();
    if (!attendance) {
      return res.status(401).type("json").send({ msg: "bad request" });
    }

    await attendanceSummaryDB.create({
      userId: employee._id,
      attendanceId: attendance._id,
      confirmationTime: new Date(),
      reason: "bad attendance record",
      status: "rejected",
      departEarly: doesDepartEarly(attendance.clockOutTime),
      arriveLate: doesArriveLate(attendance.clockInTime),
      onTime: !doesArriveLate(attendance.clockInTime),
    });

    attendance.status = "rejected";
    await attendance.save();

    // attendance created
    res.status(201).json({ message: "attendance rejected" });
  } catch (e) {
    res.status(500).json({ msg: "internal server error" });
  }
});

module.exports = {
  acceptAttendance,
  rejectAttendance,
  getAttendance,
  getAttendanceById,
  getAttendanceSummary,
};
