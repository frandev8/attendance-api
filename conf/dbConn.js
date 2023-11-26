const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URI);
  } catch (e) {
    console.log("Couldn't connect to the database", e);
  }
};

module.exports = connectDB;
