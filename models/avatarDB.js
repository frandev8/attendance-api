const mongoose = require("mongoose");

const avatarSchema = mongoose.Schema({
  myFile: String,
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "employee",
    require: true,
  },
});

const avatarDB = new mongoose.model("avatar", avatarSchema);

module.exports = { avatarDB };
