const express = require("express");
const router = express.Router();
const { analyzeActivity } = require("../controllers/mlController");
const { protect } = require("../middleware/authMiddleware");

router.post("/analyze", protect, analyzeActivity);

module.exports = router;
