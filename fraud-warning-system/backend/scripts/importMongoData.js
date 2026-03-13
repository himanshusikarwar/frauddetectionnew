/**
 * Import MongoDB data from JSON files in backend/data/
 * Run: node scripts/importMongoData.js
 * Requires: activitylogs.json, alerts.json (users.json optional) in backend/data/
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

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    if (!fs.existsSync(DATA_DIR)) {
      console.error("Data folder not found:", DATA_DIR);
      process.exit(1);
    }

    const activityPath = path.join(DATA_DIR, "activitylogs.json");
    const alertsPath = path.join(DATA_DIR, "alerts.json");
    const usersPath = path.join(DATA_DIR, "users.json");

    if (fs.existsSync(activityPath)) {
      const data = JSON.parse(fs.readFileSync(activityPath, "utf8"));
      const docs = Array.isArray(data) ? data : [];
      if (docs.length > 0) {
        await ActivityLog.deleteMany({});
        for (const d of docs) {
          const { _id, ...rest } = d;
          if (rest.timestamp && typeof rest.timestamp === "string") rest.timestamp = new Date(rest.timestamp);
          await ActivityLog.create(rest);
        }
        console.log("Imported", docs.length, "activity logs");
      }
    }

    if (fs.existsSync(alertsPath)) {
      const data = JSON.parse(fs.readFileSync(alertsPath, "utf8"));
      const docs = Array.isArray(data) ? data : [];
      if (docs.length > 0) {
        await Alert.deleteMany({});
        for (const d of docs) {
          const { _id, activityLogId, ...rest } = d;
          if (rest.timestamp && typeof rest.timestamp === "string") rest.timestamp = new Date(rest.timestamp);
          await Alert.create(rest);
        }
        console.log("Imported", docs.length, "alerts");
      }
    }

    if (fs.existsSync(usersPath)) {
      const data = JSON.parse(fs.readFileSync(usersPath, "utf8"));
      const docs = Array.isArray(data) ? data : [];
      if (docs.length > 0) {
        const existing = await User.countDocuments();
        if (existing === 0) {
          for (const d of docs) {
            const { _id, ...rest } = d;
            await User.create(rest);
          }
          console.log("Imported", docs.length, "users");
        } else {
          console.log("Users already exist; skipping users.json to avoid overwriting.");
        }
      }
    }

    console.log("Import done.");
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
