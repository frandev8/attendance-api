const { hashPwd, doHashPwdMatch } = require("../encrypts/hashing");
const asyncHandler = require("express-async-handler");
const {
  employeeDB,
  loginValidate,
  registerValidatePhase2,
  registerValidatePhase1,
} = require("../models/employeeDB");
const mongoose = require("mongoose");
require("mongoose-sequence")(mongoose);
const { randomBytes } = require("crypto");
const tokenDB = require("../models/tokenDB");
const sendEmail = require("../utils/sendEmail");
const { avatarDB } = require("../models/avatarDB");

/**
 * @desc Login users
 * @route Post /users
 * @access Private
 */
const loginEmployee = asyncHandler(async (req, res) => {
  const { username, password, role } = req.body;

  try {
    const { error } = loginValidate({ username, password, role });
    if (error) {
      return res.status(400).json({ msg: error.details[0].message });
    }

    const employee = await employeeDB.findOne({ username }).exec();

    if (!employee) {
      return res
        .status(401)
        .type("json")
        .send({ msg: "invalid username or password" });
    }

    if (!doHashPwdMatch(password, employee.password)) {
      return res
        .status(401)
        .type("json")
        .send({ msg: "password doesn't match, try again" });
    }

    if (!employee.activate) {
      return res.status(400).type("json").send({
        msg: "please verify your account. Check your email.",
      });
    }

    const token = employee.generateAuthToken();

    res.status(200).json({
      userToken: token,
      userId: employee._id,
      role: employee.role,
    });
  } catch (e) {
    console.log(e.message);
    res.status(500).json({ msg: "internal server error" });
  }
});

/**
 * @desc Get all users
 * @route Get /users
 * @access Private
 */
const getEmployee = asyncHandler(async (req, res) => {
  const { active } = req.query;

  const employees = await employeeDB.find({}).select("-password").lean();

  if (!employees.length) {
    return res.status(400).type("json").send({ msg: "Users not found!" });
  }

  if (active) {
    const activeEmployees = employees.filter((employee) => employee.activate);

    if (!activeEmployees) {
      return res
        .status(400)
        .type("json")
        .send({ msg: "No active user found!" });
    }

    return res.status(200).json(activeEmployees);
  }

  res.status(200).json(employees);
});

/**
 * @desc Get all users by Id
 * @route Get /users
 * @access Public
 */
const getEmployeeById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const employees = await employeeDB.findById(id).select("-password").lean();

  if (!employees) {
    return res.status(400).type("json").send({ msg: "Users not found!" });
  }

  res.status(200).json(employees);
});

/**
 * @desc create new user
 * @route POST /users
 * @access Private
 */

const createNewEmployee = asyncHandler(async (req, res) => {
  const { username, password, email, role, phone, firstname, lastname } =
    req.body;

  try {
    // confirm data
    const { error } = registerValidatePhase2({
      role,
      username,
      password,
      email,
      phone,
      firstname,
      lastname,
    });
    if (error) {
      return res.status(401).json({ msg: error.details[0].message });
    }

    // check for duplicate
    let duplicate = await employeeDB.findOne({ email }).lean();

    if (duplicate) {
      return res
        .status(400)
        .type("json")
        .send({ msg: "email already exist, sign in instead." });
    }

    duplicate = await employeeDB.findOne({ username }).lean();

    if (duplicate) {
      return res
        .status(400)
        .type("json")
        .send({ msg: "username already exist, use new one." });
    }

    // hashing password
    const hashedPwd = hashPwd(password);

    // create new employee
    const employee = await employeeDB.create({
      username,
      password: hashedPwd,
      email,
      role,
      phone,
      firstname,
      lastname,
    });

    // create new employee
    const employeeToken = await tokenDB.create({
      owner: employee._id,
      token: randomBytes(32).toString("hex"),
    });

    const message = `${process.env.BASE_URL}/auth/verify/user/${employee._id}/${employeeToken.token}`;

    await sendEmail(employee.email, "Please verify email", message);

    // success
    res.status(201).json({
      msg: `new user ${employee.username} created, please verify email provided`,
      role: employee.role,
      id: employee._id,
      token: employeeToken.token,
    });
  } catch (e) {
    console.log(e.message);
    res.status(500).json({ msg: "internal server error" });
  }
});

const checkEmployeeDuplicate = asyncHandler(async (req, res) => {
  const { username, email, role } = req.body;

  try {
    // confirm data
    const { error } = registerValidatePhase1({
      role,
      username,
      email,
    });
    if (error) {
      return res.status(404).json({ msg: error.details[0].message });
    }

    // check for duplicate
    let duplicate = await employeeDB.findOne({ email }).lean();

    if (duplicate) {
      return res
        .status(400)
        .type("json")
        .send({ msg: "email already exist, sign in instead." });
    }

    duplicate = await employeeDB.findOne({ username }).lean();

    if (duplicate) {
      return res
        .status(400)
        .type("json")
        .send({ msg: "username already exist, use new one." });
    }

    // success

    res.status(200).json({
      msg: `No duplication, ${username} can continue signing up`,
      personalData: { username, email, role },
    });
  } catch (e) {
    console.log(e.message);
    res.status(500).json({ msg: "internal server error" });
  }
});

/**
 * @desc  verify user email
 * @route POST / users
 * @access Private
 */
const verifyEmployee = asyncHandler(async (req, res) => {
  const { id, token } = req.params;

  try {
    const employee = await employeeDB.findById(id).lean();

    if (!employee) {
      return res
        .status(400)
        .type("json")
        .send({ msg: "invalid link, try again" });
    }

    const employeeToken = await tokenDB
      .findOne({ owner: employee._id, token })
      .lean();

    if (!employeeToken) {
      return res
        .status(400)
        .type("json")
        .send({ msg: "invalid link, try again" });
    }

    // update activate
    const verifiedEmployee = await employeeDB.findById(employee._id).exec();

    verifiedEmployee.activate = true;
    verifiedEmployee.save();
    // remove token
    await tokenDB.deleteOne({ owner: employee._id });

    // verified
    res.status(200).json({ msg: "Successful, login to your account" });
  } catch (e) {
    console.log(e.message);
    console.log("Couldn't verify employee");
  }
});

/**
 * @desc update user
 * @route PATCH /users
 * @access Private
 */
const updateEmployee = asyncHandler(async (req, res) => {
  const { id, username, password, contact } = req.body;

  // confirm data
  if (!id || !username) {
    return res.status(400).json({ msg: `all fields are required` });
  }

  const employee = await employeeDB.findById(id);

  if (!employee) {
    return res.status(400).json({ msg: `couldn't find employee` });
  }
  // check for duplication
  const duplication = await employeeDB.findOne({ username }).lean().exec();

  if (duplication && duplication?._id.toString() !== id) {
    return res
      .status(409)
      .json({ msg: `username already exist, choose another` });
  }
  employee.username = username;
  employee.contact = contact;

  if (password) {
    employee.password = hashPwd(password);
  }

  const updatedUser = await employee.save();

  res.status(201).json({ msg: `${updatedUser.username} updated successfully` });
});

/**
 * @desc delete user
 * @route DELETE /users
 * @access Private
 */
const deleteEmployee = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ msg: "must provide an id" });
  }

  const user = await user.findById(id).exec();

  if (!user) {
    return res.status(400).json({ msg: "user not found" });
  }
  const result = await user.deleteOne();

  res.status(200).json({ msg: `${result.username} deleted successfully` });
});

/**
 * @desc set employee avatar
 * @route POST /users
 * @access Private
 */

const setEmployeeAvatar = asyncHandler(async (req, res) => {
  const { imgUrlBase64 } = req.body;

  const { id } = req.params;

  if (!id || !imgUrlBase64) {
    return res.status(400).json({ msg: "must provide an id and img url" });
  }

  try {
    const employee = await employeeDB.findById(id).select("-password").lean();

    if (!employee) {
      return res.status(401).type("json").send({ msg: "Users not found!" });
    }

    const avatar = await avatarDB.find({ clientId: employee._id }).exec();

    if (!avatar.length) {
      const newAvatar = await avatarDB.create({
        clientId: employee._id,
        myFile: imgUrlBase64,
      });
      await newAvatar.save();

      return res.status(200).json({ msg: "Avatar saved" });
    }

    avatar[0].myFile = imgUrlBase64;
    await avatar[0].save();

    res.status(200).json({ msg: "Avatar saved" });
  } catch (err) {
    console.log(err.message);
    console.log("Couldn't upload employee's avatar");
  }
});

const getEmployeeAvatar = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const employee = await employeeDB.findById(id).select("-password").lean();

    if (!employee) {
      return res.status(401).type("json").send({ msg: "Users not found!" });
    }

    const avatar = await avatarDB.find({ clientId: employee._id }).exec();

    if (!avatar.length) {
      return res.status(200).type("json").send({ msg: "not found!" });
    }
    res.status(200).json({ url: avatar[0].myFile });
  } catch (err) {
    console.log(err.message);
    console.log("Couldn't download employee's avatar");
  }
});

/**
 * @desc change employee password
 * @route Patch / users
 * @access Private
 */

const setEmployeeNewPassword = asyncHandler(async (req, res) => {
  const { formData } = req.body;

  const { id } = req.params;

  if (!id || !formData) {
    return res.status(400).json({ msg: "must provide an id and form" });
  }

  try {
    const employee = await employeeDB.findById(id).select("-password").lean();

    if (!employee) {
      return res.status(401).type("json").send({ msg: "Users not found!" });
    }

    if (!doHashPwdMatch(formData.oldPassword, employee.password)) {
      return res
        .status(401)
        .type("json")
        .send({ msg: "password doesn't match, try again" });
    }

    employee.password = hashPwd(formData.newPassword);
    await employee.save();

    res.status(200).json({ msg: "Password changed successfully" });
  } catch (err) {
    console.log(err.message);
    console.log("Couldn't change employee's password");
  }
});
module.exports = {
  getEmployee,
  getEmployeeById,
  createNewEmployee,
  updateEmployee,
  checkEmployeeDuplicate,
  deleteEmployee,
  loginEmployee,
  setEmployeeNewPassword,
  getEmployeeAvatar,
  setEmployeeAvatar,
  // getPersonalDetails,
  verifyEmployee,
};
