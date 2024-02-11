const { adminDB } = require("../models/adminDB");
const {
  announcementDB,
  isAnnouncementFormValid,
} = require("../models/announcementDB");
const { isEditNotificationFormValid } = require("../models/notificationDB");
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

  console.log("called");

  try {
    const { error } = isAnnouncementFormValid({
      title,
      date,
      message,
    });
    if (error) {
      return res.status(404).json({ msg: error.details[0].message });
    }

    console.log("bypass");
    // create new announcement
    const announcement = await announcementDB.create({
      adminId,
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
  const { formData, adminId } = req.body;
  const { id } = req.params;

  const { title, message } = formData;

  try {
    const { error } = isEditNotificationFormValid({
      title,
      message,
    });

    if (error) {
      return res.status(404).json({ msg: error.details[0].message });
    }

    // find announcement
    const announcement = await announcementDB.findById(id).exec();

    // find admin
    const admin = await adminDB.findById(adminId);

    if (!announcement || !admin) {
      return res
        .status(400)
        .type("json")
        .send({ msg: "No announcement or admin found!" });
    }

    announcement.title = title;
    announcement.message = message;
    await announcement.save();

    // success
    res.status(201).json({
      msg: `announcement edited!`,
    });
  } catch (e) {
    console.log(e.message);
    res.status(500).json({ msg: "internal server error" });
  }
});

/**
 * @desc delete announcement
 * @route Delete /admin *
 * @access Private
 */

const deleteAnnouncementById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    // find announcement
    const announcement = await announcementDB.findById(id).exec();

    if (!announcement) {
      return res
        .status(400)
        .type("json")
        .send({ msg: "No announcement found!" });
    }

    await announcement.deleteOne();

    res.status(200).json({
      msg: `announcement deleted!`,
    });
  } catch (e) {
    console.log(e.message);
    res.status(500).json({ msg: "internal server error" });
  }
});

module.exports = {
  getAnnouncementById,
  createNewAnnouncement,
  editAnnouncementById,
  deleteAnnouncementById,
  getAnnouncement,
};
