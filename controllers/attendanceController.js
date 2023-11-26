const { attendanceDB } = require("../models/attendanceDB");
const { employeeDB } = require("../models/employeeDB");
const asyncHandler = require("express-async-handler");
const { verifyClockInToken } = require("../utils/verifyClockInToken");
/**
 * @desc Get all attendance
 * @route Get/attendance
 * @access public
 */
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
 * @desc clock in
 * @route Post /users
 * @access Private
 */
const checkIn = asyncHandler(async (req, res) => {
  const { clockInTime } = req.body;

  const userId = req.user.id;

  try {
    const employee = await employeeDB.findById(userId).exec();

    if (!employee) {
      return res.status(401).type("json").send({ msg: "bad request" });
    }

    employee.lastCheckInDate = new Date(clockInTime);
    employee.save();
    const attendance = await attendanceDB.create({
      userId: employee._id,
      clockInTime: new Date(clockInTime),
    });

    const token = attendance.generateAuthToken();

    // attendance created
    res.status(201).json({ data: token, message: "clock in successful" });
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
  const { clockOutTime, clockInToken } = req.body;

  try {
    const attendanceId = verifyClockInToken(clockInToken).id;

    const attendance = await attendanceDB.findById(attendanceId).exec();

    if (!attendance) {
      return res.status(401).type("json").send({ msg: "bad request" });
    }

    attendance.clockOutTime = new Date(clockOutTime);
    attendance.save();

    res.status(200).json({ msg: "clock out successful" });
  } catch (e) {
    console.log(e.message);
    res.status(500).json({ msg: "internal server error" });
  }
});

/**
 * @desc confirm attendance
 * @route Post / admin
 * @access Private
 */
const confirmAttendance = asyncHandler(async (req, res) => {
  // const { username, password, role } = req.body;
  // try {
  //   const { error } = loginValidate({ username, password, role });
  //   if (error) {
  //     return res.status(400).json({ msg: error.details[0].message });
  //   }
  //   const employees = await employeeDB.findOne({ username }).exec();
  //   if (!employees) {
  //     return res
  //       .status(401)
  //       .type("json")
  //       .send({ msg: "invalid username or password" });
  //   }
  //   if (!doHashPwdMatch(password, employees.password)) {
  //     return res
  //       .status(401)
  //       .type("json")
  //       .send({ msg: "password doesn't match, try again" });
  //   }
  //   if (!employees.activate) {
  //     return res.status(400).type("json").send({
  //       msg: "please verify your account. Check your email.",
  //     });
  //   }
  //   const token = employees.generateAuthToken();
  //   console.log(password, password.length);
  //   res.status(200).json({ data: token, message: "logged in successfully" });
  // } catch (e) {
  //   console.log(e.message);
  //   res.status(500).json({ msg: "internal server error" });
  // }
});

module.exports = {
  getAttendance,
  checkIn,
  checkOut,
  confirmAttendance,
  getAttendanceById,
};
