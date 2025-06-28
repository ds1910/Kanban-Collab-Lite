const USER = require("../model/user");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

const {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} = require("../service/auth");

// ==========================================
// ========== Handle User Signup ============
// ==========================================

/**
 * Registers a new user
 * - Validates input
 * - Creates user in DB
 * - Redirects to login (HTML) or returns success (API)
 */
const handleUserSignup = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    await USER.create({ name, email, password });

    if (req.is("application/json")) {
      return res.status(201).json({ message: "Signup successful" });
    } else {
      return res.redirect("/user/login");
    }
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ error: "Something went wrong during signup" });
  }
};

// ==========================================
// =========== Handle User Login ============
// ==========================================

/**
 * Logs in a user
 * - Validates credentials
 * - Generates JWT access & refresh tokens
 * - Stores tokens in secure HTTP-only cookies
 * - Supports both API and HTML form login
 */
const handleUserLogin = async (req, res) => {
  const { email, password } = req.body;

  const user = await USER.findOne({ email });

  if (!user) {
    const msg = "Invalid email";
    return req.is("application/json")
      ? res.status(401).json({ error: msg })
      : res.render("login", { error: msg });
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    const msg = "Invalid password";
    return req.is("application/json")
      ? res.status(401).json({ error: msg })
      : res.render("login", { error: msg });
  }

  // Generate JWT tokens
  const accessToken = generateAccessToken({ id: user._id });
  const refreshToken = generateRefreshToken({ id: user._id });

  // Set secure HTTP-only cookies
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    maxAge: 15 * 60 * 1000, // 15 mins
  });

  return req.is("application/json")
    ? res.status(201).json({
        message: "Login successful",
        accessToken,
        refreshToken,
      })
    : res.redirect("/media");
};

// ==========================================
// ================ Logout ==================
// ==========================================

/**
 * Clears authentication cookies to logout user
 */
const handleLogout = (req, res) => {
  res.clearCookie("refreshToken");
  res.clearCookie("accessToken");
  res.status(200).json({ message: "Logged out" });
};

// ==========================================
// ============ Render Views ================
// ==========================================

/**
 * Renders signup form page
 */
const handleGetSignup = (req, res) => {
  return res.render("signup");
};

/**
 * Renders login form page
 */
const handleGetLogin = (req, res) => {
  return res.render("login");
};

// ==========================================
// ============ Module Exports ==============
// ==========================================
module.exports = {
  handleUserSignup,
  handleUserLogin,
  handleGetSignup,
  handleGetLogin,
  handleLogout,
};
