/**
 * DMVIC Error Classes
 *
 * Provides the {@link DmvicError} class with static factory methods for
 * creating typed, structured errors throughout the client.
 *
 * @module errors
 */

import { ERROR_CODES } from './constants';

/**
 * Discriminator for error origin.
 *
 * - `"InternalError"` — errors originating within the client (config, network, parsing)
 * - `"ExternalError"` — errors originating from the DMVIC API (auth failures, API rejections)
 */
export type ErrorType = 'InternalError' | 'ExternalError';

/**
 * Custom error class for all DMVIC client errors.
 *
 * Every error carries a {@link type}, numeric {@link code}, human-readable
 * {@link message}, and optional {@link details} payload.
 *
 * Use the static factory methods rather than calling the constructor directly:
 *
 * @example
 * ```typescript
 * throw DmvicError.invalidConfig('Missing client ID');
 * throw DmvicError.networkError('Connection refused');
 * throw DmvicError.apiError('Certificate not found', 3000);
 * ```
 */
export class DmvicError extends Error {
  /** Whether this is an internal or external error */
  public readonly type: ErrorType;
  /** Numeric error code — see {@link ERROR_CODES} */
  public readonly code: number;
  /** Optional additional context (e.g. the original API error object) */
  public readonly details?: any;

  /**
   * @param type - Error origin discriminator
   * @param code - Numeric error code
   * @param message - Human-readable error message
   * @param details - Optional additional context
   */
  constructor(type: ErrorType, code: number, message: string, details?: any) {
    super(message);
    this.name = 'DmvicError';
    this.type = type;
    this.code = code;
    this.details = details;
  }

  /**
   * Create an internal (client-side) error.
   * @param code - Numeric error code
   * @param message - Error description
   * @param details - Optional context
   */
  static internal(code: number, message: string, details?: any): DmvicError {
    return new DmvicError('InternalError', code, message, details);
  }

  /**
   * Create an external (API-side) error.
   * @param code - Numeric error code
   * @param message - Error description
   * @param details - Optional context
   */
  static external(code: number, message: string, details?: any): DmvicError {
    return new DmvicError('ExternalError', code, message, details);
  }

  /** Invalid client configuration error. */
  static invalidConfig(message: string = 'Invalid client configuration'): DmvicError {
    return DmvicError.internal(ERROR_CODES.INVALID_CONFIG, message);
  }

  /** HTTP request creation failure. */
  static createRequest(message: string = 'Failed to create HTTP request'): DmvicError {
    return DmvicError.internal(ERROR_CODES.CREATE_REQUEST, message);
  }

  /** HTTP request execution failure. */
  static httpRequest(message: string = 'HTTP request execution failed'): DmvicError {
    return DmvicError.internal(ERROR_CODES.HTTP_REQUEST, message);
  }

  /** Failed to read the HTTP response body. */
  static readResponse(message: string = 'Failed to read HTTP response body'): DmvicError {
    return DmvicError.internal(ERROR_CODES.READ_RESPONSE, message);
  }

  /** Date/time parsing failure. */
  static parseTime(message: string = 'Failed to parse time/date string'): DmvicError {
    return DmvicError.internal(ERROR_CODES.PARSE_TIME, message);
  }

  /** Network-level error (timeout, DNS, connection refused, etc.). */
  static networkError(message: string = 'Network request failed'): DmvicError {
    return DmvicError.internal(ERROR_CODES.HTTP_REQUEST, message);
  }

  /**
   * DMVIC API returned an error response.
   * @param message - Error message from the API
   * @param statusCode - HTTP status code or API operation error code
   * @param details - Original error payload from the API
   */
  static apiError(message: string, statusCode?: number, details?: any): DmvicError {
    return DmvicError.external(statusCode || ERROR_CODES.HTTP_REQUEST, message, details);
  }

  /** Authentication / login failure. */
  static authenticationError(message: string = 'Authentication failed'): DmvicError {
    return DmvicError.external(401, message);
  }

  /** Invalid input provided to a client method. */
  static invalidInput(message: string = 'Invalid input provided'): DmvicError {
    return DmvicError.internal(ERROR_CODES.INVALID_CONFIG, message);
  }

  /**
   * Serialize the error to a plain object (useful for logging / JSON responses).
   */
  toJSON(): object {
    return {
      name: this.name,
      type: this.type,
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }
}
