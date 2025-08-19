const Joi = require('joi');

const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(6).max(255).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'string.max': 'Password must not exceed 255 characters',
    'any.required': 'Password is required'
  }),
  firstName: Joi.string().max(50).optional().messages({
    'string.max': 'First name must not exceed 50 characters'
  }),
  lastName: Joi.string().max(50).optional().messages({
    'string.max': 'Last name must not exceed 50 characters'
  })
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

const updateProfileSchema = Joi.object({
  firstName: Joi.string().max(50).optional().messages({
    'string.max': 'First name must not exceed 50 characters'
  }),
  lastName: Joi.string().max(50).optional().messages({
    'string.max': 'Last name must not exceed 50 characters'
  }),
  email: Joi.string().email().optional().messages({
    'string.email': 'Please provide a valid email address'
  })
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'Current password is required'
  }),
  newPassword: Joi.string().min(6).max(255).required().messages({
    'string.min': 'New password must be at least 6 characters long',
    'string.max': 'New password must not exceed 255 characters',
    'any.required': 'New password is required'
  })
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  })
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Reset token is required'
  }),
  password: Joi.string().min(6).max(255).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'string.max': 'Password must not exceed 255 characters',
    'any.required': 'Password is required'
  })
});

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema
};
