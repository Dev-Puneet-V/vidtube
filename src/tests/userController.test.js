import { registerUser } from "../controllers/user.controllers";
import { jest } from "@jest/globals";
import { ApiError } from "../utils/ApiError";
// const ApiError = require("../utils/ApiError");
// const User = require("../models/User");
// const uploadOnCloudinary = require("../utils/cloudinaryUpload");
// Mock dependencies
// jest.mock("../models/user.models.js");
// jest.mock("../utils/cloudinaryUpload");
// jest.mock("../utils/cloudinaryDelete");
// jest.mock("express-async-handler");

describe("registerUser function", () => {
  let req;
  let res;
  let next;
  beforeEach(() => {
    req = {
      body: {
        fullname: "Test User",
        email: "test2@example.com",
        username: "testuser2",
        password: "password123",
      },
      files: {
        avatar: [{ path: "avatar.jpg" }],
        coverImage: [{ path: "cover.jpg" }],
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  it("should return 400 if any field is missing", async () => {
    req.body.email = "";

    await registerUser(req, res, next);
    expect(next).toHaveBeenCalledWith(
      new ApiError(400, "All fields are required")
    );
  });

  //   it("should return 409 if user already exists", async () => {
  //     User.findOne = jest.fn().mockResolvedValueOnce(true);

  //     await registerUser(req, res, next);
  //     expect(next).toHaveBeenCalledWith(
  //       new ApiError(409, "User with email or username already exists")
  //     );
  //   });
});
