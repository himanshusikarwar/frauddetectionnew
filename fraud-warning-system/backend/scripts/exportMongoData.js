/**
 * Export MongoDB data to JSON files in backend/data/
 * Run: node scripts/exportMongoData.js
 * Share the backend/data/ folder (or the .json files) for someone to import.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/fraud_warning_system";
const ActivityLog = require("../models/ActivityLog");
const Alert = require("../models/Alert");
const User = require("../models/User");

const DATA_DIR = path.join(__dirname, "..", "data");

function toPlain(doc) {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : doc;
  if (obj._id && obj._id.toString) obj._id = { $oid: obj._id.toString() };
  if (obj.activityLogId && obj.activityLogId.toString) obj.activityLogId = { $oid: obj.activityLogId.toString() };
  ["timestamp", "createdAt", "updatedAt", "resolvedAt"].forEach((k) => {
    if (obj[k] instanceof Date) obj[k] = { $date: obj[k].toISOString() };
  });
  return obj;
}

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

    const [activities, alerts, users] = await Promise.all([
      ActivityLog.find({}).lean(),
      Alert.find({}).lean(),
      User.find({}).lean(),
    ]);

    const activityLogs = activities.map((a) => {
      const o = { ...a };
      if (o._id) o._id = o._id.toString();
      if (o.timestamp) o.timestamp = o.timestamp instanceof Date ? o.timestamp.toISOString() : o.timestamp;
      return o;
    });
    const alertsData = alerts.map((a) => {
      const o = { ...a };
      if (o._id) o._id = o._id.toString();
      if (o.activityLogId) o.activityLogId = o.activityLogId.toString();
      if (o.timestamp) o.timestamp = o.timestamp instanceof Date ? o.timestamp.toISOString() : o.timestamp;
      return o;
    });
    const usersData = users.map((u) => {
      const o = { ...u };
      if (o._id) o._id = o._id.toString();
      if (o.createdAt) o.createdAt = o.createdAt instanceof Date ? o.createdAt.toISOString() : o.createdAt;
      return o;
    });

    fs.writeFileSync(path.join(DATA_DIR, "activitylogs.json"), JSON.stringify(activityLogs, null, 2), "utf8");
    fs.writeFileSync(path.join(DATA_DIR, "alerts.json"), JSON.stringify(alertsData, null, 2), "utf8");
    fs.writeFileSync(path.join(DATA_DIR, "users.json"), JSON.stringify(usersData, null, 2), "utf8");

    console.log(`Exported ${activityLogs.length} activity logs -> data/activitylogs.json`);
    console.log(`Exported ${alertsData.length} alerts -> data/alerts.json`);
    console.log(`Exported ${usersData.length} users -> data/users.json`);
    console.log("\nData folder:", DATA_DIR);
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
