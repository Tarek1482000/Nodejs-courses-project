const express = require("express");
const router = express.Router();
const verifyToken = require("../middelwares/verifyToken");
const coursesController = require("../controllers/courses.controller");
const { validationSchema } = require("../middelwares/validationSchema");
const userRole = require("../utils/userRoles");
const allowedTo = require("../middelwares/allowedTo");
router
  .route("/")
  .get(coursesController.getallCourses)
  .post(validationSchema(), coursesController.createCourse);

router
  .route("/:courseId")
  .get(coursesController.getCourse)
  .patch(coursesController.updateCourse)
  .delete(
    verifyToken,
    allowedTo(userRole.ADMIN, userRole.MANGER),
    coursesController.deleteCourse
  );

module.exports = router;  
