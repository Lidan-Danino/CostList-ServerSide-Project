/*Developers Details:
 * Lidan Danino - 207599473
 * Niv Netanel - 208540302
 */
var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

module.exports = router;
