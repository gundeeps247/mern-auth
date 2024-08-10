export const errorHandler = (statusCode, message) => {
    const error = new Error();
    error.StatusCode = statusCode;
    error.message = message;
    return error;
}