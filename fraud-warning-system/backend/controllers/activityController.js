const ActivityLog = require("../models/ActivityLog");
const Alert = require("../models/Alert");
const mlService = require("../services/mlService");

// @desc    Get all activities
// @route   GET /api/activities
const getActivities = async (req, res) => {
  try {
    const {
      department,
      actionType,
      riskLevel,
      page = 1,
      limit = 50,
    } = req.query;
    const filter = {};
    if (department) filter.department = department;
    if (actionType) filter.actionType = actionType;
    if (riskLevel === "high") filter.riskScore = { $gte: 75 };
    else if (riskLevel === "medium") filter.riskScore = { $gte: 40, $lt: 75 };
    else if (riskLevel === "low") filter.riskScore = { $lt: 40 };

    const activities = await ActivityLog.find(filter)
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ActivityLog.countDocuments(filter);
    res.json({
      success: true,
      data: activities,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Log new activity
// @route   POST /api/activities
const createActivity = async (req, res) => {
  try {
    const activityData = req.body;
    const activity = new ActivityLog(activityData);

    // Call ML service for anomaly detection
    const mlResult = await mlService.analyzeActivity(activityData);
    activity.riskScore = mlResult.riskScore;
    activity.isAnomaly = mlResult.isAnomaly;
    activity.flaggedReasons = mlResult.reasons;

    await activity.save();

    // Create alert if anomaly
    if (mlResult.isAnomaly && mlResult.riskScore >= 40) {
      const alert = new Alert({
        employeeId: activityData.employeeId,
        employeeName: activityData.employeeName,
        department: activityData.department,
        role: activityData.role,
        riskScore: mlResult.riskScore,
        activityType: activityData.actionType,
        systemAccessed: activityData.systemAccessed,
        reasons: mlResult.reasons,
        activityLogId: activity._id,
      });
      await alert.save();

      // Emit real-time alert via socket.io
      if (global.io) {
        global.io.emit("new_alert", {
          alert: alert.toObject(),
          activity: activity.toObject(),
        });
      }
    }

    res.status(201).json({ success: true, data: activity, mlResult });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get activity stats
// @route   GET /api/activities/stats
const getStats = async (req, res) => {
  try {
    const totalEmployees = await ActivityLog.distinct("employeeId").then(
      (ids) => ids.length,
    );
    const totalAlerts = await Alert.countDocuments();
    const highRiskUsers = await Alert.distinct("employeeId", {
      riskScore: { $gte: 75 },
    }).then((ids) => ids.length);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const anomaliesToday = await ActivityLog.countDocuments({
      isAnomaly: true,
      timestamp: { $gte: today },
    });

    const departmentStats = await ActivityLog.aggregate([
      {
        $group: {
          _id: "$department",
          count: { $sum: 1 },
          avgRisk: { $avg: "$riskScore" },
          anomalies: { $sum: { $cond: ["$isAnomaly", 1, 0] } },
        },
      },
      { $sort: { anomalies: -1 } },
    ]);

    const riskDistribution = await ActivityLog.aggregate([
      {
        $bucket: {
          groupBy: "$riskScore",
          boundaries: [0, 25, 50, 75, 90, 101],
          default: "Other",
          output: { count: { $sum: 1 } },
        },
      },
    ]);

    const recentTimeline = await ActivityLog.find({ isAnomaly: true })
      .sort({ timestamp: -1 })
      .limit(20)
      .select("employeeName actionType riskScore timestamp department");

    res.json({
      success: true,
      stats: { totalEmployees, totalAlerts, highRiskUsers, anomaliesToday },
      departmentStats,
      riskDistribution,
      recentTimeline,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { getActivities, createActivity, getStats };
