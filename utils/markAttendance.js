const { attendanceDB } = require("../models/attendanceDB");
const { employeeDB } = require("../models/employeeDB");
const { attendanceSummaryDB } = require("../models/attendanceSummaryDB");
const { isAbsent } = require("./checkTimeStatus");

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
      const autoClockIn = new Date().setHours(10, 30, 0);
      const autoClockOut = new Date().setHours(17, 30, 0);

      const user = await employeeDB.findById(employeeId).exec();

      user.lastCheckInDate = autoClockIn;
      user.save();
      const attendance = await attendanceDB.create({
        userId: user._id,
        clockInTime: autoClockIn,
        clockOutTime: autoClockOut,
        status: "rejected",
      });

      await attendance.save();

      const attendanceSummary = await attendanceSummaryDB.create({
        userId: user._id,
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

      console.log("success");
    }
  });
}

async function clockOutAttendance(attendance) {
  // Iterate through all employees and mark them as absent if they haven't clocked in
  attendance.forEach(async (attendance) => {
    const id = attendance._id;

    const autoClockOut = new Date().setHours(17, 0, 0);

    const presence = await attendanceDB.findById(id).exec();

    if (!presence) {
      return "";
    }

    presence.clockOutTime = autoClockOut;
    presence.save();
  });
  console.log("success");
}

module.exports = { clockOutAttendance, markAttendanceAbsent };
