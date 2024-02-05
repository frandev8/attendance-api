const { Router } = require("express");
const {
  getEmployee,
  getEmployeeById,
  createNewEmployee,
  updateEmployeeProfile,
  deleteEmployee,
  loginEmployee,
  getEmployeeAvatar,
  setEmployeeAvatar,
  verifyEmployeeRegistration,
  setEmployeeNewPassword,
  checkEmployeeDuplicate,
  toggleEmployeeActivation,
  // getActivatedEmployee,
  // registerUser,
} = require("../controllers/employeeController");

const employeeRouter = Router();

// employeeRouter.route("/activated").get(getActivatedEmployee);
employeeRouter.route("/:id").get(getEmployeeById).delete(deleteEmployee);
employeeRouter.route("/personal/:id").patch(updateEmployeeProfile);

employeeRouter.route("/login").post(loginEmployee);

employeeRouter.route("/toggle-activeness/:id").patch(toggleEmployeeActivation);

employeeRouter
  .route("/register/verify/:id/:token/:pin")
  .get(verifyEmployeeRegistration);
employeeRouter.route("/register/duplicate").post(checkEmployeeDuplicate);
employeeRouter.route("/register").post(createNewEmployee);

employeeRouter.route("/password/:id").patch(setEmployeeNewPassword);
employeeRouter
  .route("/avatar/:id")
  .get(getEmployeeAvatar)
  .post(setEmployeeAvatar);
employeeRouter.route("/").get(getEmployee);

module.exports = employeeRouter;
