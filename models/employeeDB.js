const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const joi = require("joi");
const passwordComplexity = require("joi-password-complexity");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const employeeSchema = new mongoose.Schema(
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
    role: {
      type: String,
      enum: ["employee", "admin"],
      required: true,
    },
    lastCheckInDate: {
      type: Date,
      default: null,
    },
    activate: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

employeeSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { username: this.username, id: this._id },
    process.env.TOKEN_SECRET
  );

  return token;
};

// employeeSchema.plugin(AutoIncrement, {
//   inc_field: "track",
//   id: "trackNums",
//   start_seq: 100,
// });

const employeeDB = mongoose.model("employee", employeeSchema);

function loginValidate(data) {
  const schema = joi.object({
    username: joi.string().min(3).max(30).required().label("username"),
    password: passwordComplexity(undefined, "password").required(),
    role: joi.string().required().label("role").valid("employee"),
  });
  return schema.validate(data);
}

const passwordComplexityOptions = {
  min: 8,
  max: 20,
  lowerCase: 1,
  upperCase: 1,
  numeric: 1,
  symbols: undefined,
  requirementCount: 2,
};

function passwordValidate(data) {
  const schema = joi.object({
    old: passwordComplexity(passwordComplexityOptions, "old-pass").required(),
    new: passwordComplexity(passwordComplexityOptions, "new-pass").required(),
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
    role: joi.string().required().label("role").valid("employee"),
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
    role: joi.string().required().label("role").valid("employee"),
  });

  return schema.validate(data);
}

module.exports = {
  employeeDB,
  loginValidate,
  registerValidatePhase1,
  registerValidatePhase2,
  passwordValidate,
};
