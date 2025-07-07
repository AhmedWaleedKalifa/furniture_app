const { body, query, param, validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array().map(error => error.msg)
    });
  }
  next();
};

// User validation rules
const userProfileValidation = [
  body('displayName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Display name must be between 2 and 50 characters'),
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL'),
  body('phone')
    .optional()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Phone number must be valid'),
  validate
];

// Signup validation (includes role parameter - admin not allowed)
const signupValidation = [
  body('email')
    .isEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('displayName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Display name must be between 2 and 50 characters'),
  body('role')
    .optional()
    .isIn(['client', 'company'])
    .withMessage('Role must be client or company. Admin users cannot be created through regular signup.'),
  validate
];

// Login validation
const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validate
];

// Product validation rules
// const productValidation = [
//   body('name')
//     .trim()
//     .isLength({ min: 2, max: 100 })
//     .withMessage('Product name must be between 2 and 100 characters'),
//   body('description')
//     .optional()
//     .trim()
//     .isLength({ max: 1000 })
//     .withMessage('Description must be less than 1000 characters'),
//   body('category')
//     .trim()
//     .notEmpty()
//     .withMessage('Category is required'),
//   body('dimensions.width')
//     .isFloat({ min: 0.1 })
//     .withMessage('Width must be a positive number'),
//   body('dimensions.height')
//     .isFloat({ min: 0.1 })
//     .withMessage('Height must be a positive number'),
//   body('dimensions.depth')
//     .isFloat({ min: 0.1 })
//     .withMessage('Depth must be a positive number'),
//   body('modelUrl')
//     .isURL()
//     .withMessage('Model URL must be a valid URL'),
//   body('price')
//     .optional()
//     .isFloat({ min: 0 })
//     .withMessage('Price must be a positive number'),
//   validate
// ];
const productValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('modelUrl')
    .isURL()
    .withMessage('Model URL must be a valid URL'),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .bail()
    .custom((value) => !isNaN(parseFloat(value)) && parseFloat(value) >= 0)
    .withMessage('Price must be a positive number'),
  body('dimensions')
    .notEmpty()
    .withMessage('Dimensions are required')
    .bail()
    .custom((value) => {
      try {
        const d = JSON.parse(value);
        return (
          typeof d.width === 'number' &&
          d.width > 0 &&
          typeof d.height === 'number' &&
          d.height > 0 &&
          typeof d.depth === 'number' &&
          d.depth > 0 &&
          typeof d.unit === 'string'
        );
      } catch {
        return false;
      }
    })
    .withMessage('Dimensions must be a valid JSON object with positive width, height, depth, and a unit'),
  body('customizable')
    .notEmpty()
    .withMessage('Customizable is required')
    .bail()
    .custom((value) => {
      try {
        JSON.parse(value);
        return true;
      } catch {
        return false;
      }
    })
    .withMessage('Customizable must be a valid JSON object'),
  body('tags')
    .notEmpty()
    .withMessage('Tags are required')
    .bail()
    .custom((value) => {
      try {
        const arr = JSON.parse(value);
        return Array.isArray(arr);
      } catch {
        return false;
      }
    })
    .withMessage('Tags must be a valid JSON array'),
  // No validation for thumbnail here; handled by Multer
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }
    next();
  }
];
// Order validation rules
const orderValidation = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  body('items.*.productId')
    .isString()
    .notEmpty()
    .withMessage('Product ID is required for each item'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  validate
];

// Support ticket validation
const supportTicketValidation = [
  body('subject')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Subject must be between 5 and 100 characters'),
  body('message')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be between 10 and 1000 characters'),
  body('category')
    .isIn(['technical', 'billing', 'product', 'general'])
    .withMessage('Category must be technical, billing, product, or general'),
  validate
];

// Sanitization middleware
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }
  next();
};

module.exports = {
  validate,
  userProfileValidation,
  signupValidation,
  loginValidation,
  productValidation,
  orderValidation,
  supportTicketValidation,
  sanitizeInput
}; 