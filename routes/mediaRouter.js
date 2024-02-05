const { Router } = require("express");
const asyncHandler = require("express-async-handler");
const bannerRouter = Router();
const { avatarDB } = require("../models/avatarDB");

bannerRouter.route("/banner/:id").get(
  asyncHandler(async (req, res) => {
    const { id } = req.params;


    try {
      const avatar = await avatarDB.findById(id).exec();

      if (!avatar) {
        return res.status(200).type("json").send({ msg: "not found!" });
      }

      res.status(200).json({ url: avatar.myFile });
    } catch (err) {
      console.log(err.message);
      console.log("Couldn't download cover photo");
    }
  })
);
bannerRouter.route("/logo/:id").get(
  asyncHandler(async (req, res) => {
    const { id } = req.params;


    try {
      const avatar = await avatarDB.findById(id).exec();

      if (!avatar) {
        return res.status(200).type("json").send({ msg: "not found!" });
      }

      res.status(200).json({ url: avatar.myFile });
    } catch (err) {
      console.log(err.message);
      console.log("Couldn't download cover photo");
    }
  })
);

module.exports = bannerRouter;
