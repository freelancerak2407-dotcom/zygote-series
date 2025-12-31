const Joi = require('joi');

/**
 * Validation middleware factory
 */
const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
            }));

            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors,
            });
        }

        next();
    };
};

/**
 * Auth Validators
 */
const authValidators = {
    register: validate(Joi.object({
        email: Joi.string().email().required().messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required',
        }),
        password: Joi.string().min(8).required().messages({
            'string.min': 'Password must be at least 8 characters long',
            'any.required': 'Password is required',
        }),
        fullName: Joi.string().min(2).max(100).required().messages({
            'string.min': 'Full name must be at least 2 characters long',
            'string.max': 'Full name must not exceed 100 characters',
            'any.required': 'Full name is required',
        }),
    })),

    login: validate(Joi.object({
        email: Joi.string().email().required().messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required',
        }),
        password: Joi.string().required().messages({
            'any.required': 'Password is required',
        }),
    })),

    verifyOTP: validate(Joi.object({
        email: Joi.string().email().required(),
        otp: Joi.string().length(6).pattern(/^[0-9]+$/).required().messages({
            'string.length': 'OTP must be 6 digits',
            'string.pattern.base': 'OTP must contain only numbers',
            'any.required': 'OTP is required',
        }),
    })),

    resendOTP: validate(Joi.object({
        email: Joi.string().email().required(),
    })),

    refreshToken: validate(Joi.object({
        refreshToken: Joi.string().required().messages({
            'any.required': 'Refresh token is required',
        }),
    })),
};

module.exports = authValidators;
