const { Router } = require("express");
const {
  getNotificationById,
  createNewNotification,
  editNotificationById,
  deleteNotificationById,
  getNotification,
} = require("../controllers/notificationController");

const notificationRouter = Router();

notificationRouter.route("/").get(getNotification).post(createNewNotification);

notificationRouter
  .route("/:id")
  .get(getNotificationById)
  .delete(deleteNotificationById)
  .patch(editNotificationById);

module.exports = notificationRouter;
