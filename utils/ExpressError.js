class ExpressError extends Error {
    constructor(statusCode = 500, message = "Something went wrong") {
        super(message);
        this.statusCode = statusCode;
        this.name = "ExpressError";
        Error.captureStackTrace?.(this, this.constructor);
    }
}

module.exports = ExpressError;