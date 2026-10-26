/** Base error for Forge API client failures. */
export class AlloraAPIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AlloraAPIError";
  }
}

/** Invalid constructor / request arguments. */
export class ConfigError extends AlloraAPIError {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

/** Response body exceeded the configured byte limit. */
export class ResponseTooLargeError extends AlloraAPIError {
  readonly limitBytes: number;

  constructor(limitBytes: number) {
    super(`response body exceeds ${limitBytes} bytes`);
    this.name = "ResponseTooLargeError";
    this.limitBytes = limitBytes;
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
