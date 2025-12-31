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
 * Content Validators
 */
const contentValidators = {
    createTrack: validate(Joi.object({
        name: Joi.string().min(2).max(100).required(),
        description: Joi.string().max(500).allow('', null),
        yearNumber: Joi.number().integer().min(1).max(5).required(),
        displayOrder: Joi.number().integer().min(0).required(),
    })),

    updateTrack: validate(Joi.object({
        name: Joi.string().min(2).max(100),
        description: Joi.string().max(500).allow('', null),
        yearNumber: Joi.number().integer().min(1).max(5),
        displayOrder: Joi.number().integer().min(0),
        isActive: Joi.boolean(),
    })),

    createSubject: validate(Joi.object({
        trackId: Joi.string().uuid().required(),
        name: Joi.string().min(2).max(100).required(),
        description: Joi.string().max(500).allow('', null),
        iconUrl: Joi.string().uri().allow('', null),
        colorCode: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).allow('', null).messages({
            'string.pattern.base': 'Color code must be a valid hex color (e.g., #FF5733)',
        }),
        displayOrder: Joi.number().integer().min(0).required(),
        isFreeTrial: Joi.boolean(),
    })),

    updateSubject: validate(Joi.object({
        name: Joi.string().min(2).max(100),
        description: Joi.string().max(500).allow('', null),
        iconUrl: Joi.string().uri().allow('', null),
        colorCode: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).allow('', null),
        displayOrder: Joi.number().integer().min(0),
        isFreeTrial: Joi.boolean(),
        isActive: Joi.boolean(),
    })),

    createTopic: validate(Joi.object({
        subjectId: Joi.string().uuid().required(),
        title: Joi.string().min(2).max(200).required(),
        description: Joi.string().max(1000).allow('', null),
        displayOrder: Joi.number().integer().min(0).required(),
        isFreeSample: Joi.boolean(),
    })),

    updateTopic: validate(Joi.object({
        title: Joi.string().min(2).max(200),
        description: Joi.string().max(1000).allow('', null),
        displayOrder: Joi.number().integer().min(0),
        isFreeSample: Joi.boolean(),
        isActive: Joi.boolean(),
        completionPercentage: Joi.number().integer().min(0).max(100),
    })),

    createNotes: validate(Joi.object({
        content: Joi.string().required(),
        contentType: Joi.string().valid('markdown', 'html', 'pdf_url'),
        pdfUrl: Joi.string().uri().allow('', null),
    })),

    createSummary: validate(Joi.object({
        content: Joi.string().required(),
        contentType: Joi.string().valid('markdown', 'html', 'pdf_url'),
        pdfUrl: Joi.string().uri().allow('', null),
    })),

    createMindMap: validate(Joi.object({
        imageUrl: Joi.string().uri().required(),
        imageType: Joi.string().valid('png', 'jpg', 'svg'),
        thumbnailUrl: Joi.string().uri().allow('', null),
    })),
};

module.exports = contentValidators;
