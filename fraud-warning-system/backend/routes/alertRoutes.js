const express = require("express");
const router = express.Router();
const {
  getAlerts,
  getAlert,
  updateAlert,
  getAlertSummary,
} = require("../controllers/alertController");
const { protect } = require("../middleware/authMiddleware");

router.get("/summary", protect, getAlertSummary);
router.get("/", protect, getAlerts);
router.get("/:id", protect, getAlert);
router.put("/:id", protect, updateAlert);

module.exports = router;
