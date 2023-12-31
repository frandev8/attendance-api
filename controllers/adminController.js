const { hashPwd, doHashPwdMatch } = require("../encrypts/hashing");
const asyncHandler = require("express-async-handler");
const {
  adminDB,
  loginValidate,
  registerValidatePhase2,
  registerValidatePhase1,
} = require("../models/adminDB");
const mongoose = require("mongoose");
require("mongoose-sequence")(mongoose);
const { randomBytes } = require("crypto");
const tokenDB = require("../models/tokenDB");
const adminVerifyDB = require("../models/verifyAdminLoginDB");
const sendEmail = require("../utils/sendEmail");
const { avatarDB } = require("../models/avatarDB");

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

    res
      .status(200)
      .json({ adminToken: token, adminId: admin._id, role: admin.role });
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
  const { username, password, email, role, phone, firstname, lastname } =
    req.body;

  console.log("called");

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
      return res.status(404).json({ msg: error.details[0].message });
    }
    

    // check for duplicate
    let duplicate = await adminDB.findOne({ email }).lean();

    if (duplicate) {
      return res
        .status(400)
        .type("json")
        .send({ msg: "email already exist, sign in instead." });
    }
    console.log("no email duplication");

    duplicate = await adminDB.findOne({ username }).lean();

    if (duplicate) {
      return res
        .status(400)
        .type("json")
        .send({ msg: "username already exist, use new one." });
    }
    console.log("no username duplication");

    // hashing password
    const hashedPwd = hashPwd(password);

    // create new employee
    const newAdmin = await adminDB.create({
      username,
      password: hashedPwd,
      email,
      role,
      phone,
      firstname,
      lastname,
    });

    // create new employee
    const adminVerificationToken = await adminVerifyDB.create({
      owner: newAdmin._id,
      token: randomBytes(32).toString("hex"),
    });

    const message = `${process.env.BASE_URL}/admin/auth/verify/${newAdmin._id}/${adminVerificationToken.token}`;

    await sendEmail(newAdmin.email, "Please verify email", message);

    // success
    res.status(201).json({
      msg: `new user ${newAdmin.username} created, please verify email provided`,
      role: newAdmin.role,
      id: newAdmin._id,
      token: adminVerificationToken.token,
    });
  } catch (e) {
    console.log(e.message);
    res.status(500).json({ msg: "internal server error" });
  }
});

const checkAdminDuplicate = asyncHandler(async (req, res) => {
  const { username, email, role } = req.body;

  try {
    // confirm data
    const { error } = registerValidatePhase1({ role, username, email });
    if (error) {
      return res.status(404).json({ msg: error.details[0].message });
    }

    // check for duplicate
    let duplicate = await adminDB.findOne({ email }).lean();

    if (duplicate) {
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

    // success
    res.status(201).json({
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
const verifyAdminMail = asyncHandler(async (req, res) => {
  const { id, token } = req.params;

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

/**
 * @desc Get all users by Id
 * @route Get /users
 * @access Private
 */
const getAdminById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const admin = await adminDB.findById(id).select("-password").lean();

  if (!admin) {
    return res.status(400).type("json").send({ msg: "admin not found!" });
  }

  res.status(200).json(admin);
});

/**
 * @desc set admin avatar
 * @route POST / admin
 * @access Private
 */

const setAdminAvatar = asyncHandler(async (req, res) => {
  const { id, imgUrlBase64 } = req.body;

  if (!id || !imgUrlBase64) {
    return res.status(400).json({ msg: "must provide an id and img url" });
  }

  try {
    const admin = await adminDB.findById(id).select("-password").lean();

    if (!admin) {
      return res.status(401).type("json").send({ msg: "admin not found!" });
    }

    const avatar = await avatarDB.find({ clientId: admin._id }).exec();

    if (!avatar.length) {
      const newAvatar = await avatarDB.create({
        clientId: admin._id,
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

const getAdminAvatar = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const admin = await adminDB.findById(id).select("-password").lean();

    if (!admin) {
      return res.status(401).type("json").send({ msg: "admin not found!" });
    }

    const avatar = await avatarDB.find({ clientId: admin._id }).exec();

    if (!avatar.length) {
      return res.status(200).type("json").send({ msg: "not found!" });
    }
    res.status(200).json({ url: avatar[0].myFile });
  } catch (err) {
    console.log(err.message);
    console.log("Couldn't download admin's avatar");
  }
});

/**
 * @desc change admin password
 * @route Patch / admin
 * @access Private
 */

const setAdminNewPassword = asyncHandler(async (req, res) => {
  const { formData } = req.body;

  const { id } = req.params;

  if (!id || !formData) {
    return res.status(400).json({ msg: "must provide an id and form" });
  }

  try {
    const admin = await adminDB.findById(id).select("-password").lean();

    if (!admin) {
      return res.status(401).type("json").send({ msg: "Users not found!" });
    }

    if (!doHashPwdMatch(formData.oldPassword, admin.password)) {
      return res
        .status(401)
        .type("json")
        .send({ msg: "Old password doesn't match, try again" });
    }

    admin.password = hashPwd(formData.newPassword);
    await admin.save();

    res.status(200).json({ msg: "Password changed successfully" });
  } catch (err) {
    console.log(err.message);
    console.log("Couldn't change admin's password");
  }
});

module.exports = {
  loginAdmin,
  createNewAdmin,
  verifyAdminMail,
  checkAdminDuplicate,
  getAdminById,

  setAdminNewPassword,
  getAdminAvatar,
  setAdminAvatar,
};
