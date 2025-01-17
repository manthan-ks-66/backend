class ApiError extends Error {
  constructor(statusCode, success, message, errors = [], stack = "") {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.success = success;
    this.data = null;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, constructor);
    }
  }
}

export { ApiError };
