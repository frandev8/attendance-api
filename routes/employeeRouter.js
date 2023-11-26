const { Router } = require("express");
const {
  getEmployee,
  getEmployeeById,
  createNewEmployee,
  updateEmployee,
  deleteEmployee,
  loginEmployee,
  verifyEmployee,
  getActivatedEmployee
  // registerUser,
} = require("../controllers/employeeController");

const employeeRouter = Router();

employeeRouter.route("/").get(getEmployee);
employeeRouter.route("/activated").get(getActivatedEmployee);
employeeRouter.route("/:id").get(getEmployeeById);
employeeRouter.route("/login").post(loginEmployee);
employeeRouter.route("/edit").patch(updateEmployee);
employeeRouter.route("/delete").delete(deleteEmployee);
employeeRouter.route("/register").post(createNewEmployee);
employeeRouter.route("/verify/:id/:token").get(verifyEmployee);

module.exports = employeeRouter;
