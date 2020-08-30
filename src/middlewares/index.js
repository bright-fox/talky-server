export const loggerMiddleware = (req, res, next) => {
    console.log(`HTTP ${req.method} ${req.originalUrl}`);
    next();
}

export const errorLoggerMiddleware = (err, req, res, next) => {
    console.log("\t", err.name, err.statusCode || 500, err.message);
    next(err)
}

export const errorMiddleware = (err, req, res, next) => {
    res.status(err.status || 500).json({ status: err.status || 500, message: err.message })
}
