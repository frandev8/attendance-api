const { attendanceDB } = require("../models/attendanceDB");
const { employeeDB } = require("../models/employeeDB");
const { attendanceSummaryDB } = require("../models/attendanceSummaryDB");
const { autoClockOutDB } = require("../models/autoClockOutDB");
const asyncHandler = require("express-async-handler");
const { verifyClockInToken } = require("../utils/verifyClockInToken");
const { response } = require("express");
const jwt = require("jsonwebtoken");
const checkIfWeekend = require("../utils/checkIfWeekend");
/**
 * @desc Get all attendance
 * @route Get/attendance
 * @access public
 */
const getAttendance = asyncHandler(async (req, res) => {
  const { pending } = req.query;

  const attendances = await attendanceDB.find({}).lean();

  if (!attendances.length) {
    return res.status(400).type("json").send({ msg: "No attendance found!" });
  }

  if (pending) {
    const pendingAttendance = attendances.filter(
      (attendance) => attendance.status === "pending"
    );

    if (!pendingAttendance) {
      return res
        .status(400)
        .type("json")
        .send({ msg: "No pending attendance found!" });
    }
    return res.status(200).json(pendingAttendance);
  }

  res.status(200).json(attendances);
});

/**
 * @desc Get auto clock out attendance by id
 * @route Get/attendance
 * @access public
 */
const getClockOutAttendanceById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const attendance = await attendanceDB
    .find({ userId: id, status: "confirmed" })
    .lean();

  if (!attendance.length) {
    return res.status(400).type("json").send({ msg: "No attendance found!" });
  }

  const autoClockOutAttend = await autoClockOutDB
    .find({ userId: id, status: "confirmed" })
    .lean();

  const autoClockOutIdList = autoClockOutAttend.map((autoAttendance) =>
    autoAttendance.attendanceId.toString()
  );

  const clockOutAttendance = attendance.filter((attend) => {
    return !autoClockOutIdList.includes(attend._id.toString());
  });

  res.status(200).json(clockOutAttendance);
});

/**
 * @desc Get attendance by id
 * @route Get/attendance
 * @access public
 */
const getAttendanceById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { approved, rejected } = req.query;

  const attendance = await attendanceDB.find({ userId: id }).lean();

  if (!attendance.length) {
    return res.status(400).type("json").send({ msg: "No attendance found!" });
  }

  if (approved) {
    const approvedAttendance = attendance.filter(
      (att) => att.status === "confirmed"
    );

    return res.status(200).json(approvedAttendance);
  }

  if (rejected) {
    const approvedAttendance = attendance.filter(
      (att) => att.status === "rejected" && !checkIfWeekend(att.clockInTime)
    );

    return res.status(200).json(approvedAttendance);
  }

  res.status(200).json(attendance);
});

/**
 * @desc clock in
 * @route Post /users
 * @access Private
 */
const checkIn = asyncHandler(async (req, res) => {
  const { clockInTime } = req.body;
  const { id } = req.params;

  try {
    const employee = await employeeDB.findById(id).exec();

    if (!employee) {
      return res.status(401).type("json").send({ msg: "Unauthorize user" });
    }

    employee.lastCheckInDate = new Date(clockInTime);
    employee.save();

    const attendance = await attendanceDB.create({
      userId: employee._id,
      clockInTime: new Date(clockInTime),
    });

    const token = attendance.generateCheckinAuthToken();

    // attendance created
    res.status(201).json({ clockInToken: token, attendance: attendance });
  } catch (e) {
    console.log(e.message);
    res.status(500).json({ msg: "internal server error" });
  }
});

/**
 * @desc clock out
 * @route Post /users
 * @access Private
 */

const checkOut = asyncHandler(async (req, res) => {
  const { clockOutTime } = req.body;
  const authorizationHeader = req.headers.authorization;

  const token = authorizationHeader.substring(7);

  try {
    const attendanceId = verifyClockInToken(token).id;

    const attendance = await attendanceDB.findById(attendanceId).exec();

    if (!attendance) {
      return res
        .status(401)
        .type("json")
        .send({ msg: "Unauthorized attendance token" });
    }

    attendance.clockOutTime = new Date(clockOutTime);
    attendance.save();

    res.status(200).json({
      msg: "clock out successful",
      clockOutTime: attendance.clockOutTime,
    });
  } catch (e) {
    console.log(e.message);
    res.status(500).json({ msg: "internal server error" });
  }
});

/**
 * @desc break attendance
 * @route Post / user
 * @access Public
 */
const startBreak = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { breakTime } = req.body;
  const { mode } = req.query;

  if (!id || !mode) {
    return res.status(401).type("json").send({
      msg: "Unauthorized failed. Require userId and mode",
    });
  }
  const attendanceId = req.user.attendanceId;

  const attendance = await attendanceDB
    .find({ _id: attendanceId, userId: id })
    .exec();

  if (!attendance.length) {
    return res.status(400).type("json").send({ msg: "No attendance found!" });
  }

  if (mode === "start") {
    attendance[0].breakStartTime = breakTime;
    const token = attendance.generateBreakAuthToken();

    return res.status(200).json({
      msg: "break started successful",
      breakToken: token,
    });
  }

  if (mode === "end") {
    attendance[0].breakEndTime = breakTime;

    return res.status(200).json({
      msg: "break ended successful",
    });
  }
});

/**
 * @desc overtime attendance
 * @route Post / user
 * @access Public
 */
const startOvertime = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { overtimeTime } = req.body;
  const { mode } = req.query;

  if (!id || !mode) {
    return res.status(401).type("json").send({
      msg: "Unauthorized failed. Require userId and mode",
    });
  }
  const attendanceId = req.user.attendanceId;

  const attendance = await attendanceDB
    .find({ _id: attendanceId, userId: id })
    .exec();

  if (!attendance.length) {
    return res.status(400).type("json").send({ msg: "No attendance found!" });
  }

  if (mode === "start") {
    attendance[0].overtimeStartTime = overtimeTime;
    const token = attendance.generateOvertimeAuthToken();

    return res.status(200).json({
      msg: "break started successful",
      breakToken: token,
    });
  }

  if (mode === "end") {
    attendance[0].overtimeEndTime = overtimeTime;
  }

  res.status(200).json({
    msg: "break successful",
  });
});

module.exports = {
  getAttendance,
  checkIn,
  checkOut,
  getClockOutAttendanceById,
  startBreak,
  startOvertime,
  getAttendanceById,
};
