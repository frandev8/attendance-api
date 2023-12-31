const mongoose = require("mongoose");

const autoClockOutSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    require: true,
  },
  attendanceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "attendance",
    require: true,
  },
  date: {
    type: Date,
    require: true,
  },
  status: {
    type: String,
    required: true,
  },
});

// attendanceSchema.plugin(AutoIncrement, {
//   inc_field: "track",
//   id: "trackNums",
//   start_seq: 100,
// });

const autoClockOutDB = mongoose.model("autoClockOut", autoClockOutSchema);


module.exports = { autoClockOutDB };
