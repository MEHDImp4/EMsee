const { z } = require('zod');

const validate = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    } catch (err) {
        if (err instanceof z.ZodError) {
            // Format Zod errors into a readable object/array
            const errors = err.errors.map(e => ({
                field: e.path.join('.'),
                message: e.message
            }));

            // For simple frontend display, sometimes we just want the first error or a map
            return res.status(400).json({
                error: 'Validation failed',
                details: errors,
                // Also provide a simple error message for the first issue to help simple clients
                message: errors[0]?.message || 'Invalid input'
            });
        }
        next(err);
    }
};

module.exports = validate;
