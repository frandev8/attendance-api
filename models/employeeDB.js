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
    contact: {
      type: String,
      default: "",
    },
    role: {
      type: String,
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
    role: joi.string().required().label("role"),
  });

  return schema.validate(data);
}
function registerValidate(data) {
  const schema = joi.object({
    username: joi.string().min(3).max(30).required().label("username"),
    password: passwordComplexity(undefined, "password").required(),
    email: joi
      .string()
      .email({
        minDomainSegments: 2,
        tlds: { allow: ["com", "net"] },
      })
      .label("username")
      .required(),
    role: joi.string().required().label("role"),
  });

  return schema.validate(data);
}

module.exports = { employeeDB, loginValidate, registerValidate };
