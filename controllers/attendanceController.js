const { attendanceDB } = require("../models/attendanceDB");
const { employeeDB } = require("../models/employeeDB");
const { attendanceSummaryDB } = require("../models/attendanceSummaryDB");
const { autoClockOutDB } = require("../models/autoClockOutDB");
const asyncHandler = require("express-async-handler");

const { response } = require("express");
const jwt = require("jsonwebtoken");
const { checkIfWeekend, getStartAndEndDatesOfWeek } = require("../utils/date");

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

    const modifiedPendingAttendancePromises = pendingAttendance.map(
      async (attendance) => {
        const employee = await employeeDB.findById(attendance.userId);

        return {
          ...attendance,
          username: employee.username,
          firstname: employee.firstname,
          lastname: employee.lastname,
        };
      }
    );
    const modifiedPendingAttendance = await Promise.all(
      modifiedPendingAttendancePromises
    );

    return res.status(200).json(modifiedPendingAttendance);
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

const getAutoClockOutAttendanceById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const targetDate = new Date(); // Set the target date

  // Clear the time components to focus on the date only
  targetDate.setHours(0, 0, 0, 0);

  const attendance = await attendanceDB
    .find({
      userId: id,
      status: "pending",
      clockInTime: {
        $gte: targetDate, // Greater than or equal to the target date (start of day)
        $lt: new Date(targetDate.getTime() + 86400000), // Less than the next day (end of day)
      },
      clockOutTime: {
        $gte: targetDate, // Greater than or equal to the target date (start of day)
        $lt: new Date(targetDate.getTime() + 86400000), // Less than the next day (end of day)
      },
    })
    .limit(1)
    .lean();

  if (!attendance.length) {
    return res.status(400).type("json").send({ msg: "No attendance found!" });
  }

  // const token = attendance[0].generateCheckOutAuthToken();

  const response = { ...attendance[0], clockOutToken: "token" };

  res.status(200).json(response);
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
 * @desc Get attendance by date
 * @route Get/attendance
 * @access public
 */

const getAttendanceByDate = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { match: matchDate } = req.query;


  if (matchDate) {
    const targetDate = new Date(matchDate); // Set the target date

    // Clear the time components to focus on the date only
    targetDate.setHours(0, 0, 0, 0);

    const attendance = await attendanceDB
      .findOne({
        userId: id,
        clockInTime: {
          $gte: targetDate, // Greater than or equal to the target date (start of day)
          $lt: new Date(targetDate.getTime() + 86400000), // Less than the next day (end of day)
        },
      })
      .lean();

    console.log(attendance, targetDate, "attendance by date");

    if (!attendance) {
      return res.status(400).type("json").send({ msg: "No attendance found!" });
    }

    return res.status(200).json(attendance);
  }

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const attendance = await attendanceDB
    .find({
      userId: id,
      clockInTime: {
        $gte: today, // Greater than or equal to the target date (start of day)
        $lt: new Date(today.getTime() + 86400000), // Less than the next day (end of day)
      },
    })
    .lean();

  if (!attendance.length) {
    return res.status(400).type("json").send({ msg: "No attendance found!" });
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

const getClockInAttendance = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const attendance = await attendanceDB
    .find({
      userId: id,
      clockInTime: {
        $gte: today, // Greater than or equal to the target date (start of day)
        $lt: new Date(today.getTime() + 86400000), // Less than the next day (end of day)
      },
      clockOutTime: { $eq: null },
      status: { $eq: "pending" },
    })
    .lean();

  if (!attendance.length) {
    return res.status(400).type("json").send({ msg: "No attendance found!" });
  }

  res.status(200).json(attendance);
});

/**
 * @desc clock out
 * @route Post /users
 * @access Private
 */

const checkOut = asyncHandler(async (req, res) => {
  const { clockOutTime } = req.body;
  const attendanceId = req.user.attendanceId;

  try {
    const attendance = await attendanceDB.findById(attendanceId).exec();

    if (!attendance) {
      return res
        .status(401)
        .type("json")
        .send({ msg: "Unauthorized attendance token" });
    }

    attendance.clockOutTime = new Date(clockOutTime);
    await attendance.save();

    const token = attendance.generateCheckOutAuthToken();

    if (attendance.breakStartTime && !attendance.breakEndTime) {
      attendance.breakEndTime = new Date(clockOutTime);
      await attendance.save();
    }

    res.status(200).json({
      msg: "clock out successful",
      clockOutTime: attendance.clockOutTime,
      clockOutToken: token,
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
  try {
    const { id } = req.params;
    const { breakTime } = req.body;
    const { mode } = req.query;

    if (!id || !mode) {
      return res.status(401).json({
        msg: "Unauthorized failed. Require userId and mode",
      });
    }

    const attendanceId = req.user.attendanceId;

    const attendance = await attendanceDB
      .find({ _id: attendanceId, userId: id })
      .exec();

    if (!attendance.length) {
      return res.status(400).json({ msg: "No attendance found!" });
    }

    if (mode === "start") {
      attendance[0].breakStartTime = breakTime;

      const token = attendance[0].generateBreakAuthToken();
      await attendance[0].save();

      return res.status(200).json({
        msg: "break started successful",
        breakToken: token,
        breakTime: attendance[0].breakStartTime,
      });
    }

    if (mode === "end") {
      attendance[0].breakEndTime = breakTime;
      await attendance[0].save();

      return res.status(200).json({
        msg: "break ended successful",
      });
    }
  } catch (error) {
    console.error("Error in startBreak:", error);

    return res.status(500).json({ msg: "Internal Server Error" });
  }
});

const getWeeklyBreakByDate = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { date } = req.query;

  if (!date) {
    return res.status(401).type("json").send({ msg: "No date found!" });
  }

  const { start, end } = getStartAndEndDatesOfWeek(date);

  const attendance = await attendanceDB
    .find({
      userId: id,
      breakStartTime: {
        $gte: start,
        $lt: end,
      },
      status: "confirmed",
    })
    .lean();

  if (!attendance.length) {
    return res.status(400).type("json").send({ msg: "No attendance found!" });
  }

  res.status(200).json(attendance);
});

const getAutoEndBreakAttendanceById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const targetDate = new Date(); // Set the target date

  // Clear the time components to focus on the date only
  targetDate.setHours(0, 0, 0, 0);

  const attendance = await attendanceDB
    .find({
      userId: id,
      status: "pending",
      clockInTime: {
        $gte: targetDate, // Greater than or equal to the target date (start of day)
        $lt: new Date(targetDate.getTime() + 86400000), // Less than the next day (end of day)
      },
      breakStartTime: {
        $gte: targetDate, // Greater than or equal to the target date (start of day)
        $lt: new Date(targetDate.getTime() + 86400000), // Less than the next day (end of day)
      },
      breakEndTime: {
        $gte: targetDate, // Greater than or equal to the target date (start of day)
        $lt: new Date(targetDate.getTime() + 86400000), // Less than the next day (end of day)
      },
    })
    .limit(1)
    .lean();

  if (!attendance.length) {
    return res.status(400).type("json").send({ msg: "No attendance found!" });
  }

  res.status(200).json(attendance[0]);
});

/**
 * @desc overtime attendance
 * @route Post / user
 * @access Public
 */
const startOvertime = asyncHandler(async (req, res) => {
  try {
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
      await attendance[0].save();

      const token = attendance[0].generateOvertimeAuthToken();

      return res.status(200).json({
        msg: "overtime started successful",
        overtimeToken: token,
      });
    }

    if (mode === "end") {
      attendance[0].overtimeEndTime = overtimeTime;
      await attendance[0].save();

      return res.status(200).json({
        msg: "overtime ended successful",
      });
    }
  } catch (error) {
    console.error("Error in startBreak:", error);

    return res.status(500).json({ msg: "Internal Server Error" });
  }
});

const getWeeklyOvertimeByDate = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { date } = req.query;

  if (!date) {
    return res.status(401).type("json").send({ msg: "No date found!" });
  }

  const { start, end } = getStartAndEndDatesOfWeek(date);

  const attendance = await attendanceDB
    .find({
      userId: id,
      overtimeStartTime: {
        $gte: start,
        $lt: end,
      },
      status: "confirmed",
    })
    .lean();

  if (!attendance.length) {
    return res.status(400).type("json").send({ msg: "No attendance found!" });
  }

  res.status(200).json(attendance);
});

const getAutoEndOvertimeAttendanceById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const targetDate = new Date(); // Set the target date

  // Clear the time components to focus on the date only
  targetDate.setHours(0, 0, 0, 0);

  const attendance = await attendanceDB
    .find({
      userId: id,
      status: "pending",
      clockInTime: {
        $gte: targetDate, // Greater than or equal to the target date (start of day)
        $lt: new Date(targetDate.getTime() + 86400000), // Less than the next day (end of day)
      },
      overtimeStartTime: {
        $gte: targetDate, // Greater than or equal to the target date (start of day)
        $lt: new Date(targetDate.getTime() + 86400000), // Less than the next day (end of day)
      },
      overtimeEndTime: {
        $gte: targetDate, // Greater than or equal to the target date (start of day)
        $lt: new Date(targetDate.getTime() + 86400000), // Less than the next day (end of day)
      },
    })
    .limit(1)
    .lean();

  if (!attendance.length) {
    return res.status(400).type("json").send({ msg: "No attendance found!" });
  }

  res.status(200).json(attendance[0]);
});

module.exports = {
  getAttendance,
  checkIn,
  getWeeklyBreakByDate,
  getAutoEndOvertimeAttendanceById,
  getAutoEndBreakAttendanceById,
  getWeeklyOvertimeByDate,
  checkOut,
  getAutoClockOutAttendanceById,
  getClockOutAttendanceById,
  startBreak,
  getAttendanceByDate,
  startOvertime,
  getClockInAttendance,
  getAttendanceById,
};
