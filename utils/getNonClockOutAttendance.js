const { attendanceDB } = require("../models/attendanceDB");

async function getNonClockOutAttendance() {
  const attendance = await attendanceDB
    .find({ status: "pending", clockOutTime: null })
    .lean();

  if (!attendance.length) {
    return [];
  }

  return attendance;
}

module.exports = getNonClockOutAttendance;
