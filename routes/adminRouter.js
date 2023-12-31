const { Router } = require("express");
const {
  // getEmployee,
  getAdminById,
  setAdminNewPassword,
  getAdminAvatar,
  setAdminAvatar,
  checkAdminDuplicate,
  createNewAdmin,
  verifyAdminMail,
  loginAdmin,
} = require("../controllers/adminController");

const adminRouter = Router();

// adminRouter.route("/").get(getEmployee);
adminRouter.route("/:id").get(getAdminById);
adminRouter.route("/login").post(loginAdmin);
adminRouter.route("/register").post(createNewAdmin);
adminRouter.route("/register/duplicate").post(checkAdminDuplicate);
adminRouter.route("/avatar/:id").get(getAdminAvatar).post(setAdminAvatar);
adminRouter.route("/password/:id").patch(setAdminNewPassword);
adminRouter.route("/verify/:id/:token").get(verifyAdminMail);

module.exports = adminRouter;
