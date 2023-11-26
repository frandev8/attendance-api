const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "employee",
    require: true,
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    expires: 3600, // expires in an hour
    default: Date.now(),
  },
});

const tokenDB = mongoose.model("token", tokenSchema);

module.exports = tokenDB;
