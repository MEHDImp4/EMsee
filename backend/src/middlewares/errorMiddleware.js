const errorMiddleware = (err, req, res, next) => {
    console.error(err.stack); // Log full stack trace for debugging

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        error: message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = errorMiddleware;
