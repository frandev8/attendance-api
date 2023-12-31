const { Router } = require("express");
const {
  getEmployee,
  getEmployeeById,
  createNewEmployee,
  updateEmployee,
  deleteEmployee,
  loginEmployee,
  getEmployeeAvatar,
  setEmployeeAvatar,
  verifyEmployee,
  setEmployeeNewPassword,
  // getPersonalDetails,
  checkEmployeeDuplicate,
  // getActivatedEmployee,
  // registerUser,
} = require("../controllers/employeeController");

const employeeRouter = Router();

employeeRouter.route("/").get(getEmployee);
// employeeRouter.route("/activated").get(getActivatedEmployee);
employeeRouter.route("/:id").get(getEmployeeById);
// employeeRouter.route("/personal/:id").get(getPersonalDetails);
employeeRouter.route("/login").post(loginEmployee);
employeeRouter.route("/edit").patch(updateEmployee);
employeeRouter.route("/delete").delete(deleteEmployee);
employeeRouter.route("/register").post(createNewEmployee);
employeeRouter.route("/register/duplicate").post(checkEmployeeDuplicate);
employeeRouter.route("/password/:id").patch(setEmployeeNewPassword);
employeeRouter
  .route("/avatar/:id")
  .get(getEmployeeAvatar)
  .post(setEmployeeAvatar);
employeeRouter.route("/verify/:id/:token").get(verifyEmployee);

module.exports = employeeRouter;
