const axios = require("axios");

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:5001";

// Fallback rule-based scoring when ML service is unavailable
const ruleBasedAnalysis = (activity) => {
  let riskScore = 10;
  const reasons = [];
  const hour = new Date(activity.timestamp || Date.now()).getHours();

  // Unusual hours (outside 8am-6pm)
  if (hour < 7 || hour > 20) {
    riskScore += 25;
    reasons.push("Activity outside normal business hours");
  }

  // Bulk download
  if (activity.actionType === "bulk_download") {
    riskScore += 35;
    reasons.push("Bulk data download detected");
  }

  // Privilege escalation
  if (activity.actionType === "privilege_escalation") {
    riskScore += 40;
    reasons.push("Privilege escalation attempt");
  }

  // Account modification
  if (activity.actionType === "account_modification") {
    riskScore += 20;
    reasons.push("Unauthorized account modification");
  }

  // Large data volume
  if (activity.dataVolume > 500) {
    riskScore += 20;
    reasons.push(`Unusually large data volume: ${activity.dataVolume}MB`);
  }

  // Many accounts accessed
  if (activity.accountsAccessed > 50) {
    riskScore += 25;
    reasons.push(`Mass account access: ${activity.accountsAccessed} accounts`);
  }

  // Large transaction
  if (activity.transactionAmount > 100000) {
    riskScore += 30;
    reasons.push(
      `High-value transaction: $${activity.transactionAmount.toLocaleString()}`,
    );
  }

  // Unusual location
  if (
    activity.location &&
    (activity.location.includes("Unknown") || activity.location.includes("VPN"))
  ) {
    riskScore += 15;
    reasons.push("Access from unusual location");
  }

  riskScore = Math.min(riskScore, 99);
  const isAnomaly = riskScore >= 40;

  if (reasons.length === 0) reasons.push("Normal activity pattern");

  return { riskScore, isAnomaly, reasons };
};

const analyzeActivity = async (activity) => {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/analyze`, activity, {
      timeout: 5000,
    });
    return response.data;
  } catch (error) {
    console.warn(
      "ML service unavailable, using rule-based analysis:",
      error.message,
    );
    return ruleBasedAnalysis(activity);
  }
};

module.exports = { analyzeActivity };
