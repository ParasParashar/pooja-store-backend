import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();

// checkign user is seller or not
const adminEmails = process.env.ADMIN_EMAILS
  ? process.env.ADMIN_EMAILS.split(",")
  : [];

export const isSeller = (req, res, next) => {
  if (adminEmails.includes(req.user.email)) {
    return next();
  }
  res
    .status(403)
    .json({ success: false, message: "Access denied. Admins only." });
};

export const authenticateJWT = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "You are not authorized to visit this page",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: "Invalid token" });
  }
};
