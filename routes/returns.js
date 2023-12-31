const express = require("express");
const router = express.Router();



/* ----- Creating a User ----- */
router.post("/", async (req, res) => {
  res.status(401).send('Unauthorized');
});

module.exports = router;
