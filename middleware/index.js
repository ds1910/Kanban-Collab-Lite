const fs = require("fs");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} = require("../service/auth");

// ======================================================
// ========== Request Logging Middleware ================
// ======================================================

/**
 * Logs each request method and path to a specified file
 * - Called before any route logic
 * - Useful for request auditing or debugging
 */
const logReqRes = (fileName) => {
  return (req, res, next) => {
    fs.appendFile(
      fileName,
      `\n${Date.now()} - ${req.method} - ${req.path}\n`,
      (err) => {
        if (err) {
          console.error("Error logging request:", err);
        }
        next();
      }
    );
  };
};

// ======================================================
// ============= Auth Middleware (JWT) ==================
// ======================================================

/**
 * Checks for access token in cookies and attaches decoded user to req.user
 * - If access token is missing or expired, tries to verify refresh token
 * - If valid, issues a new access token and continues
 * - If refresh token is invalid or absent, responds with appropriate error
 * 
 * NOTE:
 * - Best for backend-rendered or protected API routes
 * - Prefer frontend-based token renewal for SPA apps
 */
const checkAuthentication = (req, res, next) => {
  const accessToken = req.cookies?.accessToken;
  const refreshToken = req.cookies?.refreshToken;

  console.log("accessToken:", accessToken);
  console.log("refreshToken:", refreshToken);

  if (!accessToken) {
    if (!refreshToken) {
      return res.status(401).json({ message: "Access and Refresh Token Missing" });
    }

    try {
      const user = verifyRefreshToken(refreshToken);
      const newAccessToken = generateAccessToken({ id: user.id });

      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        maxAge: 15 * 60 * 1000,
      });

      req.user = user;
      console.log("Access token was missing but renewed via refresh token");
      return next();
    } catch (err) {
      return res.status(403).json({ message: "Invalid refresh token. Please login again." });
    }
  }

  try {
    const decode = verifyAccessToken(accessToken);
    req.user = decode;
    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      if (!refreshToken) {
        return res.status(403).json({ message: "Access expired and no refresh token found" });
      }

      try {
        const user = verifyRefreshToken(refreshToken);
        const newAccessToken = generateAccessToken({ id: user.id });

        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
          secure: true,
          sameSite: "Strict",
          maxAge: 15 * 60 * 1000,
        });

        req.user = user;
        console.log("Access token expired but refreshed");
        return next();
      } catch (refreshErr) {
        return res.status(403).json({ message: "Refresh token invalid or expired. Please login again." });
      }
    }

    return res.status(401).json({ message: "Invalid Access Token" });
  }
};

// ======================================================
// ======== Authorization: Restrict by Role =============
// ======================================================

/**
 * Restricts access to users with specified roles
 * - Checks req.user.role against allowed roles array
 * - Used after checkAuthentication middleware
 */
const restrictTo = (roles = []) => {
  return function (req, res, next) {
    if (!req.user) return res.redirect("/login");
    if (!roles.includes(req.user.role)) return res.end("Unauthorized");

    next();
  };
};

// ======================================================
// =============== Export Middlewares ===================
// ======================================================

module.exports = {
  logReqRes,
  checkAuthentication,
  restrictTo,
};
