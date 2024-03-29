const { hashPwd, doHashPwdMatch } = require("../encrypts/hashing");
const asyncHandler = require("express-async-handler");
const {
  adminDB,
  loginValidate,
  registerValidatePhase2,
  registerValidatePhase1,
  personalFormValidate,
} = require("../models/adminDB");
const mongoose = require("mongoose");
require("mongoose-sequence")(mongoose);
const { randomBytes } = require("crypto");
const tokenDB = require("../models/tokenDB");
const { sendActivationEmail } = require("../utils/sendEmail");
const { avatarDB } = require("../models/avatarDB");
const { passwordValidate } = require("../models/employeeDB");
const { generateRand5Digit } = require("../utils/gc");

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
      phone,
      firstname,
      lastname,
    });

    // create new employee
    const adminVerificationToken = await tokenDB.create({
      owner: newAdmin._id,
      token: randomBytes(32).toString("hex"),
      pin: generateRand5Digit(),
    });

    // eslint-disable-next-line no-undef
    const message = `${process.env.BASE_URL}/admin/auth/verify/${newAdmin._id}/${adminVerificationToken.token}`;

    const activationLink = `${process.env.BASE_URL}/auth/register/admin/verify/${newAdmin._id}/${adminVerificationToken.token}?mode=auto&pin=${adminVerificationToken.pin}`;

    const activationPageLink = `${process.env.BASE_URL}/auth/register/admin/verify/${newAdmin._id}/${adminVerificationToken.token}`;

    const clientInfo = { firstname: newAdmin.firstname, email: newAdmin.email };

    await sendActivationEmail(
      activationPageLink,
      activationLink,
      clientInfo,
      adminVerificationToken.pin
    );

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
 * @desc update admin
 * @route PATCH /admin
 * @access Private
 */
const updateAdminProfile = asyncHandler(async (req, res) => {
  const { formData, mutatedFields } = req.body;

  const { username, email, phone, firstname, lastname } = formData;
  const { id } = req.params;

  try {
    // confirm data
    const { error } = personalFormValidate({
      username,
      email,
      phone,
      firstname,
      lastname,
    });
    if (error) {
      return res.status(401).json({ msg: error.details[0].message });
    }

    const admin = await adminDB.findById(id);

    if (!admin) {
      return res.status(400).json({ msg: `couldn't find admin` });
    }

    const query = {};

    // Create query conditions for fields with boolean value true, except "lastname" and "firstname"
    for (const [field, isTrue] of Object.entries(mutatedFields)) {
      if (isTrue && field !== "lastname" && field !== "firstname") {
        query[field] = formData[field];
      }
    }

    // check for duplication
    const duplication = await adminDB.find(query).exec();

    if (
      duplication.length &&
      duplication.some((admin) => admin?._id.toString() !== id)
    ) {
      return res
        .status(409)
        .json({ msg: `Profile already taken, choose another` });
    }
    admin.username = username;
    admin.phone = phone;
    admin.lastname = lastname;
    admin.firstname = firstname;
    admin.email = email;

    console.log(admin, "updated");
    await admin.save();

    res.status(200).json({ msg: `${admin.username} updated successfully` });
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
const verifyAdminRegistration = asyncHandler(async (req, res) => {
  const { id, token, pin } = req.params;

  try {
    const admin = await adminDB.findById(id).lean();

    if (!token || !pin || !admin) {
      return res
        .status(400)
        .type("json")
        .send({ msg: "invalid link, try again" });
    }

    const adminVerificationToken = await tokenDB
      .findOne({ owner: admin._id, token, pin })
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
  const { imgUrlBase64 } = req.body;

  const { id } = req.params;

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

  // console.log(id, "admin a");
  try {
    const admin = await adminDB.findById(id).select("-password").lean();

    // console.log(admin);

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
    const { error } = passwordValidate({
      old: formData.oldPassword,
      new: formData.newPassword,
    });

    if (error) {
      return res.status(401).json({ msg: error.details[0].message });
    }

    const admin = await adminDB.findById(id).exec();

    if (!admin) {
      return res.status(401).type("json").send({ msg: "admin not found!" });
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
  verifyAdminRegistration,
  checkAdminDuplicate,
  getAdminById,
  updateAdminProfile,
  setAdminNewPassword,
  getAdminAvatar,
  setAdminAvatar,
};
