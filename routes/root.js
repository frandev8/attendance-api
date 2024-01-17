const { Router } = require("express");
const asyncHandler = require("express-async-handler");
const router = Router();
const path = require("path");
const { readFileSync } = require("fs");
const { avatarDB } = require("../models/avatarDB");

router.get("^/$|/index(.html)?", (req, res) => {
  const filepath = path.join(__dirname, "..", "index.html");

  if (filepath) {
    res.type("html").send(readFileSync(filepath));
  } else {
    res.type("json").send({ msg: "Welcome to Peace Multimedia" });
  }
});

router.route("/:id").get(
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
      console.log("Couldn't download employee's avatar");
    }
  })
);

module.exports = router;
