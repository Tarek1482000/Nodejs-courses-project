require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");

const httpStatusText = require("./utils/httpStatusText");
const usersRouter = require("./routes/users.route");
const coursesRouter = require("./routes/courses.route");

app.use(cors());
app.use(express.json());
app.use("/api/courses", coursesRouter);
app.use("/api/users", usersRouter);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const url = process.env.MONGO_URL;
mongoose.connect(url).then(() => {
  console.log("mongodb server started");
});

// global middleware for not found router
app.all("*", (req, res, next) => {
  return res.status(404).json({
    status: httpStatusText.ERROR,
    message: "this resource is not available",
  });
});

// global error handler
app.use((error, req, res, next) => {
  res.status(error.statusCode || 500).json({
    status: error.statusText || httpStatusText.ERROR,
    message: error.message,
    code: error.statusCode || 500,
    data: null,
  });
});

app.listen(process.env.PORT || 4000, (err) => {
  if (err) {
    console.log("Error starting the server:", err);
  } else {
    console.log("Server is listening on port " + process.env.PORT || 4000);
  }
});
