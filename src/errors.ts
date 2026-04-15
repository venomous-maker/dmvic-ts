/**
 * DMVIC Error Classes
 */

import { ERROR_CODES } from './constants';

export type ErrorType = 'InternalError' | 'ExternalError';

export class DmvicError extends Error {
  public readonly type: ErrorType;
  public readonly code: number;
  public readonly details?: any;

  constructor(type: ErrorType, code: number, message: string, details?: any) {
    super(message);
    this.name = 'DmvicError';
    this.type = type;
    this.code = code;
    this.details = details;
  }

  static internal(code: number, message: string, details?: any): DmvicError {
    return new DmvicError('InternalError', code, message, details);
  }

  static external(code: number, message: string, details?: any): DmvicError {
    return new DmvicError('ExternalError', code, message, details);
  }

  static invalidConfig(message: string = 'Invalid client configuration'): DmvicError {
    return DmvicError.internal(ERROR_CODES.INVALID_CONFIG, message);
  }

  static createRequest(message: string = 'Failed to create HTTP request'): DmvicError {
    return DmvicError.internal(ERROR_CODES.CREATE_REQUEST, message);
  }

  static httpRequest(message: string = 'HTTP request execution failed'): DmvicError {
    return DmvicError.internal(ERROR_CODES.HTTP_REQUEST, message);
  }

  static readResponse(message: string = 'Failed to read HTTP response body'): DmvicError {
    return DmvicError.internal(ERROR_CODES.READ_RESPONSE, message);
  }

  static parseTime(message: string = 'Failed to parse time/date string'): DmvicError {
    return DmvicError.internal(ERROR_CODES.PARSE_TIME, message);
  }

  static networkError(message: string = 'Network request failed'): DmvicError {
    return DmvicError.internal(ERROR_CODES.HTTP_REQUEST, message);
  }

  static apiError(message: string, statusCode?: number, details?: any): DmvicError {
    return DmvicError.external(statusCode || ERROR_CODES.HTTP_REQUEST, message, details);
  }

  static authenticationError(message: string = 'Authentication failed'): DmvicError {
    return DmvicError.external(401, message);
  }

  static invalidInput(message: string = 'Invalid input provided'): DmvicError {
    return DmvicError.internal(ERROR_CODES.INVALID_CONFIG, message);
  }

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
