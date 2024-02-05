const { Router } = require("express");
const {
  // getEmployee,
  updateAdminProfile,
  getAdminById,
  setAdminNewPassword,
  getAdminAvatar,
  setAdminAvatar,
  checkAdminDuplicate,
  createNewAdmin,
  verifyAdminRegistration,
  loginAdmin,
} = require("../controllers/adminController");

const adminRouter = Router();

// adminRouter.route("/").get(getEmployee);
adminRouter.route("/:id").get(getAdminById);
adminRouter.route("/login").post(loginAdmin);
adminRouter.route("/register").post(createNewAdmin);
adminRouter
  .route("/register/verify/:id/:token/:pin")
  .get(verifyAdminRegistration);
adminRouter.route("/register/duplicate").post(checkAdminDuplicate);
adminRouter.route("/avatar/:id").get(getAdminAvatar).post(setAdminAvatar);
adminRouter.route("/password/:id").patch(setAdminNewPassword);
adminRouter.route("/personal/:id").patch(updateAdminProfile);
module.exports = adminRouter;
