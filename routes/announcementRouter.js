const { Router } = require("express");
const {
  getAnnouncementById,
  createNewAnnouncement,
  editAnnouncementById,
  deleteAnnouncementById,
  getAnnouncement,
} = require("../controllers/announcementController");

const announcementRouter = Router();

announcementRouter
  .route("/:id")
  .get(getAnnouncementById)
  .patch(editAnnouncementById)
  .delete(deleteAnnouncementById);
announcementRouter.route("/").get(getAnnouncement).post(createNewAnnouncement);

module.exports = announcementRouter;
