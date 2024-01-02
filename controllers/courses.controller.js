const { validationResult } = require("express-validator");
const Course = require("../models/course.model");
const httpStatusText = require("../utils/httpStatusText");
const asyncWrapper = require("../middelwares/asyncWrapper");
const appError = require("../utils/appError");

const getallCourses = asyncWrapper(async (req, res) => {
  const query = req.query;
  const Limt = query.limit || 10;
  const Page = query.page || 1;
  const Skip = (Page - 1) * Limt;
  const courses = await Course.find({}, { __v: false }).limit(Limt).skip(Skip);
  res.json({ status: httpStatusText.SUCCESS, data: { courses } });
});

const getCourse = asyncWrapper(async (req, res, next) => {
  const course = await Course.findById(req.params.courseId, { __v: false });
  if (!course) {
    const error = appError.create("course not found", 404, httpStatusText.FAIL);
    return next(error);
  }
  return res.json({ status: httpStatusText.SUCCESS, data: { course } });
});

const createCourse = asyncWrapper(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = appError.create(errors.array(), 400, httpStatusText.FAIL);
    return next(error);
  }

  const newCourse = new Course(req.body);

  await newCourse.save();

  res
    .status(201)
    .json({ status: httpStatusText.SUCCESS, data: { course: newCourse } });
});

const updateCourse = asyncWrapper(async (req, res) => {
  const courseId = req.params.courseId;
  const updatedCourse = await Course.updateOne(
    { _id: courseId },
    { $set: { ...req.body } }
  );
  return res
    .status(200)
    .json({ status: httpStatusText.SUCCESS, data: { course: updatedCourse } });
});

const deleteCourse = asyncWrapper(async (req, res) => {
  await Course.deleteOne({ _id: req.params.courseId });
  res.status(200).json({ status: httpStatusText.SUCCESS, data: null });
});

module.exports = {
  getallCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
};
