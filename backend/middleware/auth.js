import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-only-change-in-production";

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ message: "Missing or invalid authorization." });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { email: decoded.email || decoded.sub };
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}
