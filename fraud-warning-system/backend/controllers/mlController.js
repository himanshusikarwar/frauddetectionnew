const mlService = require("../services/mlService");

// @desc    Analyze activity for fraud
// @route   POST /api/ml/analyze
const analyzeActivity = async (req, res) => {
  try {
    const activityData = req.body;
    const result = await mlService.analyzeActivity(activityData);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        success: false,
        message: "ML analysis failed",
        error: error.message,
      });
  }
};

module.exports = { analyzeActivity };
