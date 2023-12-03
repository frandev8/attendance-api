const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const joi = require("joi");
const passwordComplexity = require("joi-password-complexity");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const timeOffSchema = new mongoose.Schema({
  // adminId: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "admin",
  //   require: true,
  // },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "employee",
    require: true,
  },
  type: {
    type: String,
    enum: ["casual", "sick", "earned", "adjustment"],
    require: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    require: true,
  },
  reason: {
    type: String,
    require: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
});

// attendanceSchema.methods.generateAuthToken = function () {
//   const token = jwt.sign(
//     { userId: this.userId, id: this._id },
//     process.env.CLOCKIN_TOKEN_CODE
//   );

//   return token;
// };

// attendanceSchema.plugin(AutoIncrement, {
//   inc_field: "track",
//   id: "trackNums",
//   start_seq: 100,
// });

const timeOffDB = mongoose.model("time off", timeOffSchema);

// function loginValidate(data) {
//   const schema = joi.object({
//     username: joi.string().min(3).max(30).required().label("username"),
//     password: passwordComplexity(undefined, "password").required(),
//     role: joi.string().required().label("role"),
//   });

//   return schema.validate(data);
// }

function isTimeOffFormValid(data) {
  const schema = joi.object({
    type: joi
      .string()
      .required()
      .valid("casual", "sick", "earned", "adjustment"),
    startDate: joi.date().required(),
    endDate: joi.date().required().greater(joi.ref("startDate")),
    reason: joi.string().required().not().empty(),
  });

  return schema.validate(data);
}

module.exports = { timeOffDB, isTimeOffFormValid };
