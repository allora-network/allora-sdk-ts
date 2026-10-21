/** Base error for Forge API client failures. */
export class AlloraAPIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AlloraAPIError";
  }
}

/** Non-2xx HTTP response from Forge Gateway. */
export class APIError extends AlloraAPIError {
  readonly statusCode: number;
  readonly body: string;
  readonly apiMessage: string;

  constructor(statusCode: number, message = "", body = "") {
    super(
      message
        ? `API error: status=${statusCode} message=${message}`
        : `API error: status=${statusCode}`,
    );
    this.name = "APIError";
    this.statusCode = statusCode;
    this.apiMessage = message;
    this.body = body;
  }
}
