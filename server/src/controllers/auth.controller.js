import bcrypt from "bcrypt";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import RefreshToken from "../models/refreshToken.model.js";
import path from "path";

const revokeAllUserSessions = async (userId) => {
  const now = new Date();

  await RefreshToken.updateMany(
    {
      user: userId,
      revokedAt: null,
    },
    {
      $set: {
        revokedAt: now,
      },
    },
  );
};



const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body ?? {};

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    if (Buffer.byteLength(password, "utf-8") > 72) {
      return res.status(400).json({
        success: false,
        message: "Password must not exceed 72 bytes",
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
    });

    if (!user) {
      res.status(500).json({
        success: false,
        message: "Something went wrong while registering the user",
      });
    }

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};



const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body ?? {};

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Eamil and password is required to login",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+passwordHash");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid user credentials",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid user credentials",
      });
    }

    const accessToken = jwt.sign(
      {
        userId: user._id.toString(),
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m",
        algorithm: "HS256",
      },
    );

    const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

    const rawRefreshToken = crypto.randomBytes(64).toString("hex");

    const tokenHash = crypto
      .createHash("sha256")
      .update(rawRefreshToken)
      .digest("hex");

    const expiresAt = new Date();

    expiresAt.setDate(expiresAt.getDate() + 7);

    console.log(expiresAt);

    await RefreshToken.create({
      user: user._id,
      tokenHash,
      expiresAt,
      userAgent: req.get("user-agent") || null,
    });

    res.cookie("refreshToken", rawRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: REFRESH_TOKEN_TTL_MS,
      path: "/api/auth",
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.log(error);
  }
};



const refreshAccessToken = async (req, res, next) => {
  try {
    const rawRefreshToken = req.cookies?.refreshToken;

    if (!rawRefreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(rawRefreshToken)
      .digest("hex");

    const storedToken = await RefreshToken.findOne({ tokenHash });

    if (!storedToken) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    const now = new Date();

    // STEP 1: Check whether this token was already replaced
    if (storedToken.replacedBy) {
      await revokeAllUserSessions(storedToken.user);

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/api/auth",
      });

      return res.status(401).json({
        success: false,
        message:
          "Refresh token reuse detected. All sessions have been revoked.",
      });
    }

    // STEP 2: Check expiration and ordinary revocation
    if (storedToken.expiresAt <= now || storedToken.revokedAt !== null) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is expired or revoked",
      });
    }

    const accessToken = jwt.sign(
      { userId: storedToken.user.toString() },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m",
        algorithm: "HS256",
      },
    );

    const newRawRefreshToken = crypto.randomBytes(64).toString("hex");

    const newTokenHash = crypto
      .createHash("sha256")
      .update(newRawRefreshToken)
      .digest("hex");

    const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
    const newExpiresAt = new Date();

    newExpiresAt.setDate(newExpiresAt.getDate() + 7);

    const newRefreshToken = await RefreshToken.create({
      user: storedToken.user,
      tokenHash: newTokenHash,
      expiresAt: newExpiresAt,
      userAgent: req.get("user-agent") || null,
    });

    const rotationResult = await RefreshToken.updateOne(
      {
        _id: storedToken._id,
        revokedAt: null,
        replacedBy: null,
        expiresAt: { $gt: now },
      },
      {
        $set: {
          revokedAt: now,
          replacedBy: newRefreshToken._id,
        },
      },
    );

    if (rotationResult.modifiedCount !== 1) {
      await RefreshToken.deleteOne({ _id: newRefreshToken._id });

      // Fetch the latest state of the old token
      const latestToken = await RefreshToken.findById(storedToken._id);

      // Another request may have replaced it already
      if (latestToken?.replacedBy) {
        await revokeAllUserSessions(storedToken.user);
      }

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/api/auth",
      });

      return res.status(401).json({
        success: false,
        message: "Refresh token has already been used",
      });
    }

    res.cookie("refreshToken", newRawRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: REFRESH_TOKEN_TTL_MS,
      path: "/api/auth",
    });

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};



const logutUser = async (req, res, next) =>{
  try {
    const rawRefreshToken = req.cookies?.refreshToken;

    if (rawRefreshToken) {
      const tokenHash = crypto.createHash("sha256").update(rawRefreshToken).digest("hex");

      await RefreshToken.updateOne({
        tokenHash,
        revokedAt: null
      },
      {
        $set:{
          revokedAt: new Date()
        }
      }
    )
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:"lax",
      path: "/api/auth"
    })

    return res.status(200).json({
      success: true,
      message: "Logged out successfully"
    })

  } catch (error) {
    next(error)
  }
};


const logoutAllUsers = async (req, res, next) =>{
  try {
    const userId = req.user.userId;

    await revokeAllUserSessions(userId);

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/auth"
    });

    return res.status(200).json({
      success: true,
      message: "Logged out from all devices successfully"
    })
  } catch (error) {
    next(error)
  }
}

export { registerUser, loginUser, refreshAccessToken, logutUser, logoutAllUsers};
