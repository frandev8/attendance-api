const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const joi = require("joi");
const passwordComplexity = require("joi-password-complexity");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const checkIfWeekend = require("../utils/checkIfWeekend");

const attendanceSummarySchema = new mongoose.Schema({
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
  attendanceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "attendance",
    require: true,
  },
  confirmationTime: {
    type: Date,
    require: true,
  },

  reason: {
    type: String,
    default: "",
  },

  status: {
    type: String,
    default: "",
  },
  departEarly: {
    type: Boolean,
    require: true,
  },

  arriveLate: {
    type: Boolean,
    require: true,
  },
  onTime: {
    type: Boolean,
    require: true,
  },
  isAbsent: {
    type: Boolean,
    default: false,
  },
});

attendanceSummarySchema.methods.isAbsentWeekend = function () {
  return checkIfWeekend(this.confirmationTime);
};

// attendanceSchema.plugin(AutoIncrement, {
//   inc_field: "track",
//   id: "trackNums",
//   start_seq: 100,
// });

const attendanceSummaryDB = mongoose.model(
  "attendance summary",
  attendanceSummarySchema
);

module.exports = { attendanceSummaryDB };
