const { Router } = require("express");
const {
  getNotificationById,
  createNewNotification,
  editNotificationById,
  deleteNotificationById,
  getNotification,
} = require("../controllers/notificationController");

const notificationRouter = Router();

notificationRouter.route("/").get(getNotification);
notificationRouter.route("/new").post(createNewNotification);
notificationRouter.route("/:id").get(getNotificationById);
notificationRouter.route("/:id").patch(editNotificationById);
notificationRouter.route("/:id").delete(deleteNotificationById);

module.exports = notificationRouter;
