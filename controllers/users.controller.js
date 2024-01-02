const asyncWrapper = require("../middelwares/asyncWrapper");
const User = require("../models/user.model");
const httpStatusText = require("../utils/httpStatusText");
const appError = require("../utils/appError");
const jwt = require("jsonwebtoken");
const generateJWT = require("../utils/generateJWT");
const bcrypt = require("bcryptjs");

const getAllUsers = asyncWrapper(async (req, res) => {
  const query = req.query;
  const Limt = query.limit || 10;
  const Page = query.page || 1;
  const Skip = (Page - 1) * Limt;
  const users = await User.find({}, { __v: false, password: false })
    .limit(Limt)
    .skip(Skip);
  res.json({ status: httpStatusText.SUCCESS, data: { users } });
});

const register = asyncWrapper(async (req, res, next) => {
  const { firstName, lastName, email, password, role } = req.body;
  const olduser = await User.findOne({ email: email });
  if (olduser) {
    const error = appError.create(
      "user already exist",
      400,
      httpStatusText.FAIL
    );
    return next(error);
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    role,
    avatar: req.file.filename,
  });
  const token = await generateJWT({
    email: newUser.email,
    id: newUser._id,
    role: newUser.role,
  });
  newUser.token = token;

  await newUser.save();
  res
    .status(201)
    .json({ status: httpStatusText.SUCCESS, data: { user: newUser } });
});

const login = asyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email && !password) {
    const error = appError.create(
      "email and password are required",
      400,
      httpStatusText.FAIL
    );
    return next(error);
  }

  const user = await User.findOne({ email: email });

  if (!user) {
    const error = appError.create("user not found", 400, httpStatusText.FAIL);
    return next(error);
  }
  const matchedPassword = await bcrypt.compare(password, user.password);
  if (user && matchedPassword) {
    const token = await generateJWT({
      email: user.email,
      id: user._id,
      role: user.role,
    });
    return res.json({
      status: httpStatusText.SUCCESS,
      data: { token },
    });
  } else {
    const error = appError.create("something wrong", 500, httpStatusText.ERROR);
    return next(error);
  }
});

module.exports = { getAllUsers, register, login };
