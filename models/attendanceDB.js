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
  breakStartTime: { type: Date, default: null },
  breakEndTime: { type: Date, default: null },
  overtimeStartTime: { type: Date, default: null },
  overtimeEndTime: { type: Date, default: null },
  clockOutTime: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    default: "pending",
  },
});

attendanceSchema.methods.generateCheckinAuthToken = function () {
  const token = jwt.sign(
    { userId: this.userId, id: this._id },
    process.env.CLOCKIN_TOKEN_CODE
  );

  return token;
};

attendanceSchema.methods.generateBreakAuthToken = function () {
  const token = jwt.sign(
    { breakTime: this.breakStartTime, id: this._id },
    process.env.BREAK_TOKEN_CODE
  );

  return token;
};

attendanceSchema.methods.generateOvertimeAuthToken = function () {
  const token = jwt.sign(
    { overtimeTime: this.overtimeStartTime, id: this._id },
    process.env.OVERTIME_TOKEN_CODE
  );

  return token;
};

const attendanceDB = mongoose.model("attendance", attendanceSchema);

module.exports = { attendanceDB };
