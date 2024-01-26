const { Router } = require("express");

const router = Router();
const path = require("path");
const { readFileSync } = require("fs");

router.get("^/$|/index(.html)?", (req, res) => {
  const filepath = path.join(__dirname, "..", "index.html");

  if (filepath) {
    res.type("html").send(readFileSync(filepath));
  } else {
    res.type("json").send({ msg: "Welcome to Peace Multimedia" });
  }
});

module.exports = router;
