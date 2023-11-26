const { hashPwd, doHashPwdMatch } = require("../encrypts/hashing");
const asyncHandler = require("express-async-handler");
const {
  adminDB,
  loginValidate,
  registerValidate,
} = require("../models/adminDB");
const mongoose = require("mongoose");
require("mongoose-sequence")(mongoose);
const { randomBytes } = require("node:crypto");
const tokenDB = require("../models/tokenDB");
const adminVerifyDB = require("../models/verifyAdminLoginDB");
const sendEmail = require("../utils/sendEmail");

/**
 * @desc Login users
 * @route Post /users
 * @access Private
 */
const loginAdmin = asyncHandler(async (req, res) => {
  const { username, password, role } = req.body;

  try {
    const { error } = loginValidate({ username, password, role });
    if (error) {
      return res.status(400).json({ msg: error.details[0].message });
    }

    const admin = await adminDB.findOne({ username }).exec();

    if (!admin) {
      return res
        .status(401)
        .type("json")
        .send({ msg: "invalid username or password" });
    }

    if (!doHashPwdMatch(password, admin.password)) {
      return res
        .status(401)
        .type("json")
        .send({ msg: "password doesn't match, try again" });
    }

    if (!admin.activate) {
      return res.status(400).type("json").send({
        msg: "please verify your account. Check your email.",
      });
    }

    const token = admin.generateAuthToken();
    console.log(password, password.length);

    res.status(200).json({ data: token, message: "logged in successfully" });
  } catch (e) {
    console.log(e.message);
    res.status(500).json({ msg: "internal server error" });
  }
});

/**
 * @desc create new admin
 * @route POST /admin
 * @access Private
 */

const createNewAdmin = asyncHandler(async (req, res) => {
  const { username, password, email, role } = req.body;

  try {
    // confirm data
    const { error } = registerValidate({ role, username, password, email });
    if (error) {
      return res.status(404).json({ msg: error.details[0].message });
    }

    // check for duplicate
    let duplicate = await adminDB.findOne({ email }).lean();

    if (duplicate) {
      console.log("already exist");
      return res
        .status(400)
        .type("json")
        .send({ msg: "email already exist, sign in instead." });
    }

    duplicate = await adminDB.findOne({ username }).lean();

    if (duplicate) {
      return res
        .status(400)
        .type("json")
        .send({ msg: "username already exist, use new one." });
    }

    // hashing password
    const hashedPwd = hashPwd(password);

    // create new employee
    const newAdmin = await adminDB.create({
      username,
      password: hashedPwd,
      email,
      role,
    });

    // create new employee
    const adminVerificationToken = await adminVerifyDB.create({
      owner: newAdmin._id,
      token: randomBytes(32).toString("hex"),
    });

    const message = `${process.env.BASE_URL}/admin/verify/${newAdmin._id}/${adminVerificationToken.token}`;

    await sendEmail(newAdmin.email, "Please verify email", message);

    // success
    res.status(201).json({
      msg: `new user ${newAdmin.username} created, please verify email provided`,
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
const verifyAdminMail = asyncHandler(async (req, res) => {
  const { id, token } = req.params;

  console.log(id, token);

  try {
    const admin = await adminDB.findById(id).lean();

    if (!admin) {
      return res
        .status(400)
        .type("json")
        .send({ msg: "invalid link, try again" });
    }

    const adminVerificationToken = await adminVerifyDB
      .findOne({ owner: admin._id, token })
      .lean();

    if (!adminVerificationToken) {
      return res
        .status(400)
        .type("json")
        .send({ msg: "invalid link, try again" });
    }

    // update activate
    const verifiedAdmin = await adminDB.findById(admin._id).exec();

    verifiedAdmin.activate = true;
    verifiedAdmin.save();
    // remove token
    await tokenDB.deleteOne({ owner: admin._id });

    // verified
    res.status(200).json({ msg: "Successful, login to your account" });
  } catch (e) {
    console.log(e.message);
    console.log("Couldn't verify employee");
  }
});

module.exports = {
  loginAdmin,
  createNewAdmin,
  verifyAdminMail,
  // getEmployee,
  // createNewEmployee,
  // updateEmployee,
  // deleteEmployee,
};
