class ApiResponse {
  constructor(statusCode, message = "success", data) {
    this.statusCode = statusCode < 400;
    this.success = statusCode;
    this.data = data;
    this.message = message;
  }
}
