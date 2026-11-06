import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import RefreshToken from "../models/refreshToken.model.js";

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        success: false,
        message: "Access token is required",
      });
    }

    const [scheme, token] = authHeader.split(" ");

    if (scheme?.toLowerCase() !== "bearer" || !token) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (
      typeof decoded !== "object" ||
      typeof decoded.userId !== "string" ||
      typeof decoded.sessionId !== "string"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid access token",
      });
    }

    const activeSession = await RefreshToken.exists({
      user: decoded.userId,
      sessionId: decoded.sessionId,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    });

    if (!activeSession) {
      return res.status(401).json({
        success: false,
        message: "Session has expired or been revoked. Please log in again.",
      });
    }

    req.user = {
      userId: decoded.userId,
      sessionId: decoded.sessionId,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired access token",
    });
  }
};

export default authenticate;
