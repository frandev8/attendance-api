const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const joi = require("joi");
const passwordComplexity = require("joi-password-complexity");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "employee",
    require: true,
  },
  clockInTime: {
    type: Date,
    default: null,
  },
  clockOutTime: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    default: "pending",
  },
});

attendanceSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { userId: this.userId, id: this._id },
    process.env.CLOCKIN_TOKEN_CODE
  );

  return token;
};

// attendanceSchema.plugin(AutoIncrement, {
//   inc_field: "track",
//   id: "trackNums",
//   start_seq: 100,
// });

const attendanceDB = mongoose.model("attendance", attendanceSchema);

// function loginValidate(data) {
//   const schema = joi.object({
//     username: joi.string().min(3).max(30).required().label("username"),
//     password: passwordComplexity(undefined, "password").required(),
//     role: joi.string().required().label("role"),
//   });

//   return schema.validate(data);
// }
// function registerValidate(data) {
//   const schema = joi.object({
//     username: joi.string().min(3).max(30).required().label("username"),
//     password: passwordComplexity(undefined, "password").required(),
//     email: joi
//       .string()
//       .email({
//         minDomainSegments: 2,
//         tlds: { allow: ["com", "net"] },
//       })
//       .label("username")
//       .required(),
//     role: joi.string().required().label("role"),
//   });

//   return schema.validate(data);
// }

// , loginValidate, registerValidate
module.exports = { attendanceDB };
