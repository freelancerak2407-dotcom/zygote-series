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
 * MCQ Validators
 */
const mcqValidators = {
    createMCQ: validate(Joi.object({
        topicId: Joi.string().uuid().required(),
        question: Joi.string().min(10).required().messages({
            'string.min': 'Question must be at least 10 characters long',
            'any.required': 'Question is required',
        }),
        optionA: Joi.string().min(1).required().messages({
            'any.required': 'Option A is required',
        }),
        optionB: Joi.string().min(1).required().messages({
            'any.required': 'Option B is required',
        }),
        optionC: Joi.string().min(1).required().messages({
            'any.required': 'Option C is required',
        }),
        optionD: Joi.string().min(1).required().messages({
            'any.required': 'Option D is required',
        }),
        correctAnswer: Joi.string().valid('A', 'B', 'C', 'D', 'a', 'b', 'c', 'd').required().messages({
            'any.only': 'Correct answer must be A, B, C, or D',
            'any.required': 'Correct answer is required',
        }),
        explanation: Joi.string().allow('', null),
        difficulty: Joi.string().valid('easy', 'moderate', 'hard').default('moderate'),
        displayOrder: Joi.number().integer().min(0),
    })),

    updateMCQ: validate(Joi.object({
        question: Joi.string().min(10),
        optionA: Joi.string().min(1),
        optionB: Joi.string().min(1),
        optionC: Joi.string().min(1),
        optionD: Joi.string().min(1),
        correctAnswer: Joi.string().valid('A', 'B', 'C', 'D', 'a', 'b', 'c', 'd'),
        explanation: Joi.string().allow('', null),
        difficulty: Joi.string().valid('easy', 'moderate', 'hard'),
        displayOrder: Joi.number().integer().min(0),
        isActive: Joi.boolean(),
    })),

    bulkCreateMCQs: validate(Joi.object({
        mcqs: Joi.array().items(
            Joi.object({
                topicId: Joi.string().uuid().required(),
                question: Joi.string().min(10).required(),
                optionA: Joi.string().min(1).required(),
                optionB: Joi.string().min(1).required(),
                optionC: Joi.string().min(1).required(),
                optionD: Joi.string().min(1).required(),
                correctAnswer: Joi.string().valid('A', 'B', 'C', 'D', 'a', 'b', 'c', 'd').required(),
                explanation: Joi.string().allow('', null),
                difficulty: Joi.string().valid('easy', 'moderate', 'hard').default('moderate'),
                displayOrder: Joi.number().integer().min(0),
            })
        ).min(1).required().messages({
            'array.min': 'At least one MCQ is required',
            'any.required': 'MCQs array is required',
        }),
    })),

    checkAnswer: validate(Joi.object({
        answer: Joi.string().valid('A', 'B', 'C', 'D', 'a', 'b', 'c', 'd').required().messages({
            'any.only': 'Answer must be A, B, C, or D',
            'any.required': 'Answer is required',
        }),
    })),
};

module.exports = mcqValidators;
