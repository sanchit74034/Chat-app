import jwt from "jsonwebtoken";

// check if JWT_SECRET is loaded
console.log("JWT_SECRET in utils.js:", process.env.JWT_SECRET);

const generateToken = (userId, res) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing! Check .env or Render environment variables.");
  }

  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "None" : "Lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export default generateToken;
