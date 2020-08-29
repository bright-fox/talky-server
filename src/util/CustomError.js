class CustomError extends Error {
    constructor(statusCode, message) {
        super(message || "Oops, something went wrong.")
        this.statusCode = statusCode
    }
}

export default CustomError