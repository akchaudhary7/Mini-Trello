import "dotenv/config";
import mongoose from "mongoose";
import {User} from "../models/user.model.js";

const testEmail = "mini-trello-test@example.com";

const testUserModel = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected");

    // Wait until the unique index is built
    await User.init();

    // Remove previous test record
    await User.deleteMany({ email: testEmail });

    // Create first user
    const firstUser = await User.create({
      name: "John Doe",
      email: "  MINI-TRELLO-TEST@EXAMPLE.COM  ",
      passwordHash: "test-hash-one",
    });

    console.log("First user created:", firstUser.email);

    // Attempt to create another user with the same email
    try {
      await User.create({
        name: "Jane Doe",
        email: "mini-trello-test@example.com",
        passwordHash: "test-hash-two",
      });

      console.log("ERROR: Duplicate email was accepted!");
    } catch (error) {
      if (error.code === 11000) {
        console.log("SUCCESS: Duplicate email rejected!");
      } else {
        throw error;
      }
    }

    // Check how the saved user is serialized
    const savedUser = await User.findOne({ email: testEmail });

    console.log("Saved user:", savedUser.toJSON());

  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    await mongoose.disconnect();
  }
};

testUserModel();
