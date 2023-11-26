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
 * @desc Get unconfirmed attendance
 * @route Get / attendance
 * @access public
 */
const getPendingAttendance = asyncHandler(async (req, res) => {
  const { id } = req.params;

 
  const attendance = await attendanceDB.find({ status: "pending" }).lean();

  if (!attendance.length) {
    return res.status(400).type("json").send({ msg: "No attendance found!" });
  }

  res.status(200).json(attendance);
});

/**
 * @desc Get absent attendance
 * @route Get / attendance
 * @access private
 */
const getAbsenceAttendance = asyncHandler(async (req, res) => {
  // const { id } = req.params;

  const totalAbsent = await attendanceSummaryDB.find({ isAbsent: true }).lean();

  if (!totalAbsent.length) {
    return res.status(400).type("json").send("No absent attendance found!");
  }

  const weekdayAbsent = [...totalAbsent].filter((absent) => {
    const date = absent.confirmationTime;

    const isDateWeekend = checkIfWeekend(date);

    return !isDateWeekend;
  });

  res.status(200).json({ absent: weekdayAbsent });
});

/**
 * @desc Get late attendance
 * @route Get / attendance
 * @access private
 */
const getLateAttendance = asyncHandler(async (req, res) => {
  // const { id } = req.params;

  const totalLate = await attendanceSummaryDB.find({ arriveLate: true }).lean();

  if (!totalLate.length) {
    return res.status(400).type("json").send("No late found!");
  }

  res.status(200).json({ late: totalLate });
});

/**
 * @desc Get early departure attendance
 * @route Get / attendance
 * @access private
 */
const getEarlyDepartureAttendance = asyncHandler(async (req, res) => {
  // const { id } = req.params;

  const earlyDepart = await attendanceSummaryDB
    .find({ departEarly: true })
    .lean();

  if (!earlyDepart.length) {
    return res.status(400).type("json").send("No depart early found!");
  }

  res.status(200).json({ early: earlyDepart });
});

/**
 * @desc Get on-time attendance
 * @route Get / attendance
 * @access private
 */
const getOnTimeAttendance = asyncHandler(async (req, res) => {
  // const { id } = req.params;

  const onTimeAttendance = await attendanceSummaryDB
    .find({ onTime: true })
    .lean();

  if (!onTimeAttendance.length) {
    return res.status(400).type("json").send("No on time found!");
  }

  res.status(200).json({ onTime: onTimeAttendance });
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
  getLateAttendance,
  getAbsenceAttendance,
  getPendingAttendance,
  getEarlyDepartureAttendance,
  getOnTimeAttendance,
};
