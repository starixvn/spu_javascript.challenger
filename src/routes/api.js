const express = require("express");
const router = express.Router();

router.get("/users", function(req, res, next) {
  res.send({ users: ["joe", "bernie", "tulsi", "donald", "bill"] });
});

module.exports = router;
