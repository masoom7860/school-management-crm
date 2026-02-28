const express = require("express");
const router = express.Router();
const { setMaxMarks, getMaxMarks } = require("../controllers/maxMarkController");

router.post("/set", setMaxMarks);
router.get("/", getMaxMarks);

module.exports = router;
