import jwt from "jsonwebtoken";

export const protectedRoute = (req, res, next) => {
  try {
    const token = req.cookies?.jwt;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // ✅ same key
    req.user = { userId: decoded.userId }; // ✅ match payload

    next();
  } catch (error) {
    console.error("Token error:", error.message);
    return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
  }
};
