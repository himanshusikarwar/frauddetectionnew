const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || "dev-secret-change-in-production";
  return jwt.sign({ id }, secret, { expiresIn: "8h" });
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check for demo accounts first (no DB required for demo)
    // Passwords are unique to avoid browser "data breach" warnings
    const demoAccounts = {
      admin: {
        password: "FwAdmin#Demo24",
        name: "Admin User",
        role: "admin",
        email: "admin@fraudwatch.com",
        department: "Security Operations",
      },
      analyst: {
        password: "FwAnalyst#Demo24",
        name: "Sarah Chen",
        role: "analyst",
        email: "sarah@fraudwatch.com",
        department: "Fraud Investigation",
      },
      investigator: {
        password: "FwInvest#Demo24",
        name: "James Wilson",
        role: "investigator",
        email: "james@fraudwatch.com",
        department: "Risk Management",
      },
    };

    if (
      demoAccounts[username] &&
      demoAccounts[username].password === password
    ) {
      const demo = demoAccounts[username];
      return res.json({
        success: true,
        token: generateToken(username),
        user: {
          id: username,
          username,
          name: demo.name,
          role: demo.role,
          email: demo.email,
          department: demo.department,
        },
      });
    }

    // Check DB
    const user = await User.findOne({ username });
    if (user && (await user.matchPassword(password))) {
      return res.json({
        success: true,
        token: generateToken(user._id),
        user: {
          id: user._id,
          username: user.username,
          name: user.name,
          role: user.role,
          email: user.email,
          department: user.department,
        },
      });
    }

    res.status(401).json({ success: false, message: "Invalid credentials" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

module.exports = { login, getMe };
