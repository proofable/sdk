function readResponseHeader(response, name) {
  const headers = response?.headers;
  if (!headers) return null;
  if (typeof headers.get === 'function') {
    return headers.get(name) || headers.get(name.toLowerCase()) || null;
  }
  const direct = headers[name] || headers[name.toLowerCase()];
  return typeof direct === 'string' && direct.trim() ? direct : null;
}

export class SDKError extends Error {
  constructor(message, code = 'SDK_ERROR', details = {}) {
    super(message);
    this.name = 'SDKError';
    this.code = code;
    this.details = details;
    this.timestamp = Date.now();

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SDKError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
      timestamp: this.timestamp
    };
  }
}

export class ApiError extends SDKError {
  constructor(message, statusCode = 500, code = 'API_ERROR', response = null) {
    super(message, code);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.response = response;

    this.isClientError = statusCode >= 400 && statusCode < 500;
    this.isServerError = statusCode >= 500;
    this.isRetryable = this.isServerError || statusCode === 429; // Server errors or rate limit
  }

  static fromResponse(response, responseData) {
    const statusCode = response.status;
    const message = responseData?.error?.message ||
                   responseData?.message ||
                   `API request failed with status ${statusCode}`;
    const code = statusCode === 402
      ? (responseData?.error?.code || 'PAYMENT_REQUIRED')
      : (responseData?.error?.code || 'API_ERROR');

    const error = new ApiError(message, statusCode, code, responseData);
    const paymentRequired = readResponseHeader(response, 'PAYMENT-REQUIRED');
    if (paymentRequired) {
      error.paymentRequired = paymentRequired;
    }
    if (statusCode === 402) {
      error.isPaymentRequired = true;
    }
    return error;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      statusCode: this.statusCode,
      isClientError: this.isClientError,
      isServerError: this.isServerError,
      isRetryable: this.isRetryable
    };
  }
}

export class ValidationError extends SDKError {
  constructor(message, field = null, value = null) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
    this.isRetryable = false; // Validation errors are not retryable
  }

  toJSON() {
    return {
      ...super.toJSON(),
      field: this.field,
      value: this.value,
      isRetryable: this.isRetryable
    };
  }
}

export class NetworkError extends SDKError {
  constructor(message, code = 'NETWORK_ERROR', originalError = null) {
    super(message, code);
    this.name = 'NetworkError';
    this.originalError = originalError;
    this.isRetryable = true; // Network errors are retryable
  }

  static isNetworkError(error) {
    return error instanceof NetworkError ||
           error.name === 'TypeError' && error.message.includes('fetch') ||
           error.name === 'AbortError' ||
           error.code === 'ENOTFOUND' ||
           error.code === 'ECONNREFUSED' ||
           error.code === 'ETIMEDOUT';
  }

  toJSON() {
    return {
      ...super.toJSON(),
      isRetryable: this.isRetryable,
      originalError: this.originalError ? {
        name: this.originalError.name,
        message: this.originalError.message,
        code: this.originalError.code
      } : null
    };
  }
}

export class ConfigurationError extends SDKError {
  constructor(message, configKey = null) {
    super(message, 'CONFIGURATION_ERROR');
    this.name = 'ConfigurationError';
    this.configKey = configKey;
    this.isRetryable = false; // Config errors require user intervention
  }

  toJSON() {
    return {
      ...super.toJSON(),
      configKey: this.configKey,
      isRetryable: this.isRetryable
    };
  }
}

export class VerificationError extends SDKError {
  constructor(message, verifierId = null, code = 'VERIFICATION_ERROR') {
    super(message, code);
    this.name = 'VerificationError';
    this.verifierId = verifierId;
    this.isRetryable = true; // Some verification errors might be retryable
  }

  toJSON() {
    return {
      ...super.toJSON(),
      verifierId: this.verifierId,
      isRetryable: this.isRetryable
    };
  }
}

export class AuthenticationError extends SDKError {
  constructor(message, code = 'AUTHENTICATION_ERROR') {
    super(message, code);
    this.name = 'AuthenticationError';
    this.isRetryable = false; // Auth errors require user intervention
  }

  toJSON() {
    return {
      ...super.toJSON(),
      isRetryable: this.isRetryable
    };
  }
}