const {
  notificationDB,
  isNotificationFormValid,
} = require("../models/notificationDB");
const asyncHandler = require("express-async-handler");

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
const editNotificationById = asyncHandler(async (req, res) => {});

/**
 * @desc delete notification
 * @route delete / admin
 * @access private
 */

const deleteNotificationById = asyncHandler(async (req, res) => {});

module.exports = {
  getNotificationById,
  createNewNotification,
  editNotificationById,
  deleteNotificationById,
  getNotification,
};
