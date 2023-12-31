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
    require: true,
  },
  title: {
    type: String,
    required: true,
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


function isNotificationFormValid(data) {
  const schema = joi.object({
    adminId: joi.string().required(),
    date: joi.date().required(),
    title: joi.string().required().not().empty(),
    message: joi.string().required().not().empty(),
  });

  return schema.validate(data);
}

module.exports = { notificationDB, isNotificationFormValid };
