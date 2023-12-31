const { attendanceDB } = require("../models/attendanceDB");
const { employeeDB } = require("../models/employeeDB");
const { adminDB } = require("../models/adminDB");
const { attendanceSummaryDB } = require("../models/attendanceSummaryDB");
const asyncHandler = require("express-async-handler");
const { verifyClockInToken } = require("../utils/verifyClockInToken");
const { doesDepartEarly, doesArriveLate } = require("../utils/checkTimeStatus");
const checkIfWeekend = require("../utils/checkIfWeekend");
const { autoClockOutDB } = require("../models/autoClockOutDB");

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
const endorseAttendance = asyncHandler(async (req, res) => {
  const { attendanceId, adminId, userId } = req.body;
  const { action } = req.query;

  try {
    const employee = await employeeDB.findById(userId).exec();

    if (!employee) {
      return res
        .status(401)
        .type("json")
        .send({ msg: "Unauthorized employee" });
    }

    const attendance = await attendanceDB.findById(attendanceId).exec();

    if (!attendance) {
      return res
        .status(401)
        .type("json")
        .send({ msg: "Unauthorized attendance" });
    }

    const admin = await adminDB.findById(adminId).exec();

    if (!admin) {
      return res.status(401).type("json").send({ msg: "Unauthorized admin" });
    }

  
    if (action === "accept") {


      const attendanceSummary = await attendanceSummaryDB.create({
        adminId: admin._id,
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

      const autoClockOut = await autoClockOutDB
        .find({
          attendanceId: attendance._id,
        })
        .exec();

      if (autoClockOut.length) {
        autoClockOut[0].status = "confirmed";

        await autoClockOut[0].save();
      }

      // attendance created
      return res
        .status(201)
        .json({ message: "attendance confirmed successful" });
    }

    if (action === "decline") {
      const declinedAttendance = await attendanceSummaryDB.create({
        adminId: admin._id,
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

      const autoClockOut = await autoClockOutDB
        .find({
          attendanceId: attendance._id,
        })
        .exec();

      if (autoClockOut.length) {
        autoClockOut[0].status = "rejected";

        await autoClockOut[0].save();
      }

      // attendance created
      return res.status(201).json({ message: "attendance rejected" });
    }

    res.status(400).json({ msg: "bad request" });
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

module.exports = {
  endorseAttendance,
  getAttendance,
  getAttendanceById,
  getAttendanceSummary,
};
