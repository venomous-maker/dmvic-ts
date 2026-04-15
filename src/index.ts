/**
 * DMVIC TypeScript Client — Main Export
 */

// Main client
export { DmvicClient } from "./client";
export type { IDmvicClient } from "./client";

// Types
export type {
  CertificateConfig,
  DmvicConfig,
  DmvicCredentials,
  Environment,
  LoginResponse,
  CertificateResponse,
  CancellationResponse,
  InsuranceValidationRequest,
  InsuranceValidationResponse,
  DoubleInsuranceRequest,
  DoubleInsuranceResponse,
  TypeAIssuanceRequest,
  TypeBIssuanceRequest,
  TypeCIssuanceRequest,
  TypeDIssuanceRequest,
  InsuranceResponse,
  ConfirmationRequest,
  StockResponse,
  DmvicApiError,
  FlexibleDmvicError,
} from "./types";

export {
  ETypeOfCover,
  ETypeOfCertificate,
  ClassType,
  VehicleType,
  CertificateType,
} from "./types";

// Constants
export {
  COVER_TYPES,
  CANCEL_REASONS,
  CERTIFICATE_TYPES,
  VEHICLE_TYPES,
  DMVIC_ERROR_CODES,
  ERROR_CODES,
  API_ENDPOINTS,
  ENDPOINTS,
  DEFAULT_TIMEOUT,
  DEFAULT_TOKEN_TTL,
} from "./constants";

// Utilities
export {
  getCancelReasonDescription,
  getCoverTypeDescription,
  getCertificateTypeDescription,
  getVehicleTypeDescription,
  validateTypeARequest,
  validateTypeBRequest,
  validateTypeCRequest,
  validateTypeDRequest,
} from "./utils";

// Errors
export { DmvicError } from "./errors";
export type { ErrorType } from "./errors";

// Cache (for advanced usage)
export { TTLCache } from "./cache";
export type { TokenStorage } from "./cache";

// Factory function
import { DmvicClient } from "./client";
import type { DmvicConfig } from "./types";

/**
 * Creates a new DMVIC client instance
 * @param config - Configuration for the DMVIC client
 * @returns A new DmvicClient instance
 */
export function createDmvicClient(config: DmvicConfig): DmvicClient {
  return new DmvicClient(config);
}

export default DmvicClient;
