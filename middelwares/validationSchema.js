const { body } = require("express-validator");
const validationSchema = () => {
  return [
    body("title")
      .notEmpty()
      .withMessage("title is required")
      .isLength({ min: 2 })
      .withMessage("title at least 2 min digits"),
    body("price").notEmpty().withMessage("price is required"),
  ];
};

module.exports = { validationSchema };
