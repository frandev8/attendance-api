const { attendanceDB } = require("../models/attendanceDB");
const { employeeDB } = require("../models/employeeDB");
const { attendanceSummaryDB } = require("../models/attendanceSummaryDB");
const { isAbsent } = require("./date");
const { autoClockOutDB } = require("../models/autoClockOutDB");

async function markAttendanceAbsent() {
  const employees = await employeeDB
    .find({ activate: true })
    .select("-password")
    .lean();

  if (!employees.length) {
    return [];
  }

  markAbsent(employees);
}

async function markAbsent(employees) {
  // Iterate through all employees and mark them as absent if they haven't clocked in
  employees.forEach(async (employee) => {
    const employeeId = employee._id;
    const latestAttendance = employee.lastCheckInDate;
    // Check if the employee hasn't clocked in after 10:30 am
    if (!latestAttendance || isAbsent(latestAttendance)) {
      const autoClockIn = new Date();
      const autoClockOut = new Date();

      autoClockIn.setHours(10, 0, 0);
      autoClockOut.setHours(17, 0, 0);

      const employee = await employeeDB.findById(employeeId).exec();

      employee.lastCheckInDate = autoClockIn;
      await employee.save();

      const attendance = await attendanceDB.create({
        userId: employee._id,
        clockInTime: autoClockIn,
        clockOutTime: autoClockOut,
        status: "rejected",
      });

      await attendance.save();

      const attendanceSummary = await attendanceSummaryDB.create({
        userId: employee._id,
        attendanceId: attendance._id,
        confirmationTime: new Date(),
        reason: "attendance record verified",
        status: "rejected",
        departEarly: false,
        arriveLate: false,
        onTime: false,
        isAbsent: true,
      });

      await attendanceSummary.save();
    }
  });
}

async function clockOutAttendance(attendance) {
  // Iterate through all employees and mark them as absent if they haven't clocked in

  attendance.forEach(async (attendance) => {
    const id = attendance._id;

    const clockOutDate = new Date();

    clockOutDate.setHours(17, 0, 0, 0);
    attendance.clockOutTime = clockOutDate;
    await attendance.save();

    const autoClockOut = await autoClockOutDB.create({
      attendanceId: id,
      userId: attendance.userId,
      status: "pending",
      date: clockOutDate,
    });

    console.log("auto marked");
  });
}

async function forceEndBreakAttendance(attendance) {
  // Iterate through all employees and mark them as absent if they haven't clocked in

  attendance.forEach(async (attendance) => {
    const id = attendance._id;

    const breakEndTime = new Date();

    breakEndTime.setHours(15, 0, 0, 0);

    attendance.breakEndTime = breakEndTime;
    await attendance.save();

    // const autoClockOut = await autoClockOutDB.create({
    //   attendanceId: id,
    //   userId: attendance.userId,
    //   status: "pending",
    //   date: clockOutDate,
    // });

    console.log("auto end break");
  });
}

async function forceEndOvertimeAttendance(attendance) {
  // Iterate through all employees and mark them as absent if they haven't clocked in

  attendance.forEach(async (attendance) => {
    const id = attendance._id;

    const overtimeEndTime = new Date();

    overtimeEndTime.setHours(19, 0, 0, 0);
    attendance.overtimeEndTime = overtimeEndTime;
    await attendance.save();

    // const autoClockOut = await autoClockOutDB.create({
    //   attendanceId: id,
    //   userId: attendance.userId,
    //   status: "pending",
    //   date: clockOutDate,
    // });

    console.log("auto end overtime");
  });
}

async function getNonClockOutAttendance() {
  const today = new Date();

  today.setHours(10, 0, 0, 0);

  const attendance = await attendanceDB
    .find({
      status: "pending",
      clockInTime: {
        $gte: today,
      },
      clockOutTime: null,
    })
    .exec();

  if (!attendance.length) {
    return [];
  }

  return attendance;
}

async function getNonEndBreakAttendance() {
  const today = new Date();

  today.setHours(14, 0, 0, 0);

  const attendance = await attendanceDB
    .find({
      status: "pending",
      breakStartTime: {
        $gte: today,
      },
      breakEndTime: null,
    })
    .exec();

  if (!attendance.length) {
    return [];
  }

  return attendance;
}

async function getNonEndOvertimeAttendance() {
  const today = new Date();

  today.setHours(17, 0, 0, 0);

  const attendance = await attendanceDB
    .find({
      status: "pending",
      overtimeStartTime: {
        $gte: today,
      },
      overtimeEndTime: null,
    })
    .exec();

  if (!attendance.length) {
    return [];
  }

  return attendance;
}

module.exports = {
  clockOutAttendance,
  forceEndOvertimeAttendance,
  forceEndBreakAttendance,
  markAttendanceAbsent,
  getNonClockOutAttendance,
  getNonEndBreakAttendance,
  getNonEndOvertimeAttendance,
};
