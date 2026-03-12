const Alert = require("../models/Alert");

// @desc    Get all alerts
// @route   GET /api/alerts
const getAlerts = async (req, res) => {
  try {
    const { status, severity, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (severity) filter.severity = severity;

    const alerts = await Alert.find(filter)
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("activityLogId");

    const total = await Alert.countDocuments(filter);
    res.json({ success: true, data: alerts, total });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get single alert
// @route   GET /api/alerts/:id
const getAlert = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id).populate("activityLogId");
    if (!alert)
      return res
        .status(404)
        .json({ success: false, message: "Alert not found" });
    res.json({ success: true, data: alert });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Update alert status
// @route   PUT /api/alerts/:id
const updateAlert = async (req, res) => {
  try {
    const { status, assignedTo, notes } = req.body;
    const update = {};
    if (status) update.status = status;
    if (assignedTo) update.assignedTo = assignedTo;
    if (notes) update.notes = notes;
    if (status === "resolved") update.resolvedAt = new Date();

    const alert = await Alert.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });
    if (!alert)
      return res
        .status(404)
        .json({ success: false, message: "Alert not found" });

    // Emit status update
    if (global.io) {
      global.io.emit("alert_updated", {
        alertId: alert._id,
        status: alert.status,
      });
    }

    res.json({ success: true, data: alert });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get alert summary
// @route   GET /api/alerts/summary
const getAlertSummary = async (req, res) => {
  try {
    const summary = await Alert.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const bySeverity = await Alert.aggregate([
      { $group: { _id: "$severity", count: { $sum: 1 } } },
    ]);
    res.json({ success: true, summary, bySeverity });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { getAlerts, getAlert, updateAlert, getAlertSummary };
