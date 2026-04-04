const { body, validationResult } = require('express-validator');
 
// ── Validation rules for POST /api/waitlist ──────────────────
const waitlistValidationRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters.')
    .isLength({ max: 100 }).withMessage('Name must be under 100 characters.')
    .escape(),
 
  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required.')
    .isEmail().withMessage('Please enter a valid email address.')
    .normalizeEmail()
    .isLength({ max: 255 }).withMessage('Email must be under 255 characters.'),
 
  body('role')
    .optional()
    .isIn(['patient', 'caregiver', 'doctor_nurse', 'family_member', 'not_specified'])
    .withMessage('Invalid role selected.'),
];
 
// ── Middleware to check results and return 422 if invalid ────
const validateInput = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }
  next();
};
 
module.exports = { waitlistValidationRules, validateInput };
 