const mongoose = require("mongoose");
const joi = require("joi");

const announcementSchema = new mongoose.Schema({
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

const announcementDB = mongoose.model("announcement", announcementSchema);


function isAnnouncementFormValid(data) {
  const schema = joi.object({
    adminId: joi.string().required(),
    date: joi.date().required(),
    title: joi.string().required().not().empty(),
    message: joi.string().required().not().empty(),
  });

  return schema.validate(data);
}

module.exports = { announcementDB, isAnnouncementFormValid };
