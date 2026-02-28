const express = require("express");
const {
  createDesignation,
  getDesignations,
  deleteDesignation,
} = require("../controllers/designationController");

const router = express.Router();

router.post("/", createDesignation);
router.get("/", getDesignations);
router.delete("/:id", deleteDesignation);

module.exports = router;
