const { Router } = require("express");
const {
  // getEmployee,
  // getEmployeeById,
  createNewAdmin,
  verifyAdminMail,
  loginAdmin,
} = require("../controllers/adminController");

const adminRouter = Router();

// adminRouter.route("/").get(getEmployee);
// adminRouter.route("/:id").get(getEmployeeById);
adminRouter.route("/login").post(loginAdmin);
adminRouter.route("/register").post(createNewAdmin);
adminRouter.route("/verify/:id/:token").get(verifyAdminMail);

module.exports = adminRouter;
