const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const joi = require("joi");
const passwordComplexity = require("joi-password-complexity");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const notificationSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "admin",
    require: true,
  },
  date: {
    type: Date,
    default: null,
  },
  message: {
    type: String,
    required: true,
  },
});

// attendanceSchema.plugin(AutoIncrement, {
//   inc_field: "track",
//   id: "trackNums",
//   start_seq: 100,
// });

const notificationDB = mongoose.model("notification", notificationSchema);

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
module.exports = { notificationDB };
