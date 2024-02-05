const { Router } = require("express");
const {
  getNotificationById,
  createNewNotification,
  editNotificationById,
  deleteNotificationById,
  getNotification,
} = require("../controllers/notificationController");

const notificationRouter = Router();

notificationRouter
  .route("/:id")
  .get(getNotificationById)
  .delete(deleteNotificationById)
  .patch(editNotificationById);

notificationRouter.route("/").get(getNotification).post(createNewNotification);

module.exports = notificationRouter;
