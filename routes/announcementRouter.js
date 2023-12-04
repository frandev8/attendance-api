const { Router } = require("express");
const {
  getAnnouncementById,
  createNewAnnouncement,
  editAnnouncementById,
  deleteAnnouncementById,
  getAnnouncement,
} = require("../controllers/announcementController");

const announcementRouter = Router();

announcementRouter.route("/").get(getAnnouncement);
announcementRouter.route("/new").post(createNewAnnouncement);
announcementRouter.route("/:id").get(getAnnouncementById);
announcementRouter.route("/:id").patch(editAnnouncementById);
announcementRouter.route("/:id").delete(deleteAnnouncementById);

module.exports = announcementRouter;
