const {
  notificationDB,
  isNotificationFormValid,
  isEditNotificationFormValid,
} = require("../models/notificationDB");
const asyncHandler = require("express-async-handler");
const { adminDB } = require("../models/adminDB");
const getNotification = asyncHandler(async (req, res) => {
  const notification = await notificationDB.find({}).lean();

  if (!notification.length) {
    return res.status(400).type("json").send({ msg: "No notification found!" });
  }
  res.status(200).json(notification);
});

/**
 * @desc Get notification by id
 * @route Get/notification
 * @access public
 */
const getNotificationById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const notification = await notificationDB.find({ adminId: id }).lean();
  if (!notification.length) {
    return res.status(400).type("json").send({ msg: "No notification found!" });
  }
  res.status(200).json(notification);
});

/**
 * @desc create new notification
 * @route Post / admin
 * @access private
 */
const createNewNotification = asyncHandler(async (req, res) => {
  const { title, message, adminId, date } = req.body;
  try {
    const { error } = isNotificationFormValid({
      adminId: "655772cfa78ba6376d4c7b32",
      title,
      date,
      message,
    });

    if (error) {
      return res.status(404).json({ msg: error.details[0].message });
    }

    // create new notification
    const notification = await notificationDB.create({
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
 * @desc edit notification
 * @route Patch / admin
 * @access private
 */

const editNotificationById = asyncHandler(async (req, res) => {
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

    // find notification
    const notification = await notificationDB.findById(id).exec();

    // find admin
    const admin = await adminDB.findById(adminId);

    if (!notification || !admin) {
      return res
        .status(400)
        .type("json")
        .send({ msg: "No notification or admin found!" });
    }

    notification.title = title;
    notification.message = message;
    await notification.save();

    // success
    res.status(201).json({
      msg: `notification edited!`,
    });
  } catch (e) {
    console.log(e.message);
    res.status(500).json({ msg: "internal server error" });
  }
});

/**
 * @desc delete notification
 * @route delete / admin
 * @access private
 */

const deleteNotificationById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  console.log(id);

  try {
    // find notification
    const notification = await notificationDB.findById(id).exec();

    if (!notification) {
      return res
        .status(400)
        .type("json")
        .send({ msg: "No notification found!" });
    }

    await notification.deleteOne();

    res.status(200).json({
      msg: `notification deleted!`,
    });
  } catch (e) {
    console.log(e.message);
    res.status(500).json({ msg: "internal server error" });
  }
});

module.exports = {
  getNotificationById,
  createNewNotification,
  editNotificationById,
  deleteNotificationById,
  getNotification,
};
