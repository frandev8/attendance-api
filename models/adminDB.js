const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    activate: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

adminSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { adminId: this._id, username: this.username },
    process.env.TOKEN_SECRET
  );

  return token;
};

const adminDB = mongoose.model("admin", adminSchema);

function loginValidate(data) {
  const schema = joi.object({
    username: joi.string().min(3).max(20).required().label("username"),
    password: passwordComplexity(undefined, "password").required(),
    role: joi.string().required().label("role").valid("admin"),
  });

  return schema.validate(data);
}

function registerValidatePhase2(data) {
  const schema = joi.object({
    username: joi.string().min(3).max(30).required().label("username"),
    email: joi
      .string()
      .email({
        minDomainSegments: 2,
        tlds: { allow: ["com", "net"] },
      })
      .label("email")
      .required(),
    password: passwordComplexity(undefined, "password").required(),
    firstname: joi.string().min(3).required().label("firstname"),
    lastname: joi.string().label("lastname"),
    phone: joi.string().required().min(9).max(14).label("phone"),
    role: joi.string().required().label("role").valid("admin"),
  });

  return schema.validate(data);
}

function registerValidatePhase1(data) {
  const schema = joi.object({
    username: joi.string().min(3).max(30).required().label("username"),
    email: joi
      .string()
      .email({
        minDomainSegments: 2,
        tlds: { allow: ["com", "net"] },
      })
      .label("email")
      .required(),
    role: joi.string().required().label("role").valid("admin"),
  });

  return schema.validate(data);
}

module.exports = {
  adminDB,
  loginValidate,
  registerValidatePhase1,
  registerValidatePhase2,
};
