const express = require("express");
const router = express.Router();
const {
  getActivities,
  createActivity,
  getStats,
} = require("../controllers/activityController");
const { protect } = require("../middleware/authMiddleware");

router.get("/stats", protect, getStats);
router.get("/", protect, getActivities);
router.post("/", protect, createActivity);

module.exports = router;
