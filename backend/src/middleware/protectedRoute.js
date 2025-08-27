import jwt from 'jsonwebtoken';

export const protectedRoute = (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token Provided" });
    }

    const decode = jwt.verify(token, process.env.JWT_KEY);
    req.user = { _id: decode.userId }; 

    next();
  } catch (error) {
    console.log("Token error", error.message);
    return res.status(400).json({ message: "Internal protected route error" });
  }
};
