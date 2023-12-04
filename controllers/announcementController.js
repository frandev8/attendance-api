const {
  announcementDB,
  isAnnouncementFormValid,
} = require("../models/announcementDB");
const asyncHandler = require("express-async-handler");

const getAnnouncement = asyncHandler(async (req, res) => {
  
  const announcement = await announcementDB.find({}).lean();
  if (!announcement.length) {
    return res.status(400).type("json").send({ msg: "No announcement found!" });
  }
  res.status(200).json(announcement);
});

/**
 * @desc Get announcement by id
 * @route Get/attendance
 * @access public
 */
const getAnnouncementById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const announcement = await announcementDB.find({ adminId: id }).lean();
  if (!announcement.length) {
    return res.status(400).type("json").send({ msg: "No announcement found!" });
  }
  res.status(200).json(announcement);
});

/**
 * @desc Post announcement
 * @route Post / admin
 * @access private
 */
const createNewAnnouncement = asyncHandler(async (req, res) => {
  const { title, message, date, adminId } = req.body;
  try {
    const { error } = isAnnouncementFormValid({
      adminId: "655772cfa78ba6376d4c7b32",
      title,
      date,
      message,
    });
    if (error) {
      return res.status(404).json({ msg: error.details[0].message });
    }

    // create new announcement
    const announcement = await announcementDB.create({
      adminId: "655772cfa78ba6376d4c7b32",
      title,
      date,
      message,
    });

    // success
    res.status(201).json({
      msg: `new notification created!`,
    });
  } catch (e) {
    console.log(e.message);
    res.status(500).json({ msg: "internal server error" });
  }
});

/**
 * @desc edit announcement
 * @route Patch /admin
 * @access private
 */
const editAnnouncementById = asyncHandler(async (req, res) => {
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
 * @desc delete announcement
 * @route Delete /admin *
 * @access Private
 */

const deleteAnnouncementById = asyncHandler(async (req, res) => {
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
  getAnnouncementById,
  createNewAnnouncement,
  editAnnouncementById,
  deleteAnnouncementById,
  getAnnouncement,
};
