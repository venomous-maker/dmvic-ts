/**
 * DMVIC Constants - 
 */

// Cover Types
export const COVER_TYPES = {
  COMPREHENSIVE: 100, // COMP
  THIRD_PARTY: 200,   // TPO
  TPTF: 300,         // Third-party, Theft & Fire
} as const;

// Cancel Reasons
export const CANCEL_REASONS = {
  INSURED_REQUEST: 8,
  AMEND_PASSENGERS: 12,
  CHANGE_SCOPE_OF_COVER: 13,
  POLICY_NOT_TAKEN: 14,
  VEHICLE_SOLD: 15,
  AMEND_INSURED_DETAILS: 18,
  AMEND_VEHICLE_DETAILS: 19,
  SUSPECTED_FRAUD: 20,
  NON_PAYMENT: 21,
  FAILURE_TO_PROVIDE_KYC: 24,
  GOVERNMENT_REQUEST: 25,
  SUBJECT_MATTER_CEASED: 26,
  CHANGE_PERIOD: 27,
  COVER_DECLINED: 28,
  VEHICLE_WRITTEN_OFF: 29,
  VEHICLE_STOLEN: 30,
} as const;

// Certificate Types
export const CERTIFICATE_TYPES = {
  CLASS_A_PSV_UNMARKED: 1,
  TYPE_A_TAXI: 8,
  TYPE_D_MOTORCYCLE: 4,
  TYPE_D_PSV_MOTORCYCLE: 9,
  TYPE_D_MOTORCYCLE_COMM: 10,
} as const;

// Vehicle Types (Type B)
export const VEHICLE_TYPES = {
  OWN_GOODS: 1,
  GENERAL_CARTAGE: 2,
  INSTITUTIONAL: 3,
  SPECIAL: 4,
  TANKERS: 5,
  MOTOR_TRADE: 6,
} as const;

// DMVIC API Error Codes 
export const DMVIC_ERROR_CODES = {
  INVALID_JSON: 'ER001',
  UNKNOWN_ERROR: 'ER002',
  MANDATORY_FIELD: 'ER003',
  INVALID_INPUT: 'ER004',
  DOUBLE_INSURANCE: 'ER005',
  INSUFFICIENT_STOCK: 'ER006',
  DATA_VALIDATION: 'ER007',
} as const;

// Client Error Codes 
export const ERROR_CODES = {
  // Configuration errors (1000-1099)
  INVALID_CONFIG: 1001,
  MARSHAL_REQUEST: 1002,
  CREATE_REQUEST: 1003,
  HTTP_REQUEST: 1004,
  READ_RESPONSE: 1005,
  PARSE_TIME: 1006,
  UNMARSHAL_RESPONSE: 1007,

  // Authentication errors (2000-2099)
  LOGIN_FAILED: 2001,
  TOKEN_EXPIRED: 2002,
  UNAUTHORIZED: 2003,
  INVALID_CREDENTIALS: 2004,
  TOKEN_REFRESH: 2005,

  // API operation errors (3000-8999)
  GET_CERTIFICATE: 3000,
  VALIDATE_INSURANCE: 4000,
  CANCEL_CERTIFICATE: 5000,
  MEMBER_COMPANY_STOCK: 6000,
  ISSUANCE_TYPE_A: 7000,
  ISSUANCE_TYPE_B: 7100,
  ISSUANCE_TYPE_C: 7200,
  ISSUANCE_TYPE_D: 7300,
  CONFIRM_ISSUANCE: 7400,
  VALIDATE_DOUBLE_INSURANCE: 8000,
    EMPTY_RESPONSE: 9000,
    NON_JSON_RESPONSE: 9001,
    API_ERROR: 9002,
    NETWORK_ERROR: 9003,
    TIMEOUT_ERROR: 9004,
    UNAUTHORIZED_ERROR: 9005,
    FORBIDDEN_ERROR: 9006,
    NOT_FOUND_ERROR: 9007,
    UNKNOWN_ERROR: 9008,
} as const;

// API Endpoints 
export const API_ENDPOINTS = {
  LOGIN: '/V1/Account/Login',
  GET_CERTIFICATE: '/V4/Integration/GetCertificate',
  CANCEL_CERTIFICATE: '/V4/Integration/CancelCertificate',
  VALIDATE_INSURANCE: '/V4/Integration/ValidateInsurance',
  VALIDATE_DOUBLE_INSURANCE: '/V4/Integration/ValidateDoubleInsurance',
  ISSUANCE_TYPE_A: '/V4/IntermediaryIntegration/IssuanceTypeACertificate',
  ISSUANCE_TYPE_B: '/V4/IntermediaryIntegration/IssuanceTypeBCertificate',
  ISSUANCE_TYPE_C: '/V4/IntermediaryIntegration/IssuanceTypeCCertificate',
  ISSUANCE_TYPE_D: '/V4/IntermediaryIntegration/IssuanceTypeDCertificate',
  CONFIRM_CERTIFICATE_ISSUANCE: '/V4/IntermediaryIntegration/ConfirmCertificateIssuance',
  MEMBER_COMPANY_STOCK: '/V4/IntermediaryIntegration/MemberCompanyStock',
} as const;

// Default endpoints
export const ENDPOINTS = {
  production: 'https://api.dmvic.com/api',
  uat: 'https://uat-api.dmvic.com/api',
} as const;

// Default timeout values (in milliseconds)
export const DEFAULT_TIMEOUT = 30000;
export const DEFAULT_TOKEN_TTL = 86400000; // 24 hours 
