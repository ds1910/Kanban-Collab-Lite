const express = require("express");
const USER = require("../model/user");

const {
  handleUserSignup,
  handleUserLogin,
  handleGetSignup,
  handleGetLogin,
  handleLogout,
} = require("../controller/user");

const router = express.Router();

// =====================================================
// ================ User Authentication ================
// =====================================================

/**
 * Signup Route
 * - GET: Serves the signup HTML form
 * - POST: Handles signup request (form/API)
 */
router.route("/signup")
  .post(handleUserSignup)
  .get(handleGetSignup);

/**
 * Login Route
 * - GET: Serves the login HTML form
 * - POST: Handles login request (form/API)
 */
router.route("/login")
  .post(handleUserLogin)
  .get(handleGetLogin);

/**
 * Logout Route
 * - POST: Clears tokens and logs user out
 */
router.post("/logout", handleLogout);

// =====================================================
// =================== Export Router ===================
// =====================================================

module.exports = router;
