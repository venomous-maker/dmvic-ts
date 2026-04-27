/**
 * DMVIC API Types and Interfaces
 *
 * Contains all request/response types, enumerations, and configuration
 * interfaces used by the DMVIC client to interact with the Kenya
 * Digital Motor Vehicle Insurance Certificate API.
 *
 * @module types
 */

/**
 * X.509 mutual-TLS certificate file paths for client authentication.
 */
export interface CertificateConfig {
  /** Path to the client certificate file (PEM format) */
  certPath: string;
  /** Path to the client private key file (PEM format) */
  keyPath: string;
  /** Optional path to the CA certificate file (PEM format) */
  caPath?: string;
}

/**
 * Response returned by the DMVIC `/V1/Account/Login` endpoint on successful authentication.
 */
export interface LoginResponse {
  /** JWT bearer token for subsequent API calls */
  token: string;
  /** Authenticated user identifier */
  loginUserId: string;
  /** ISO-8601 date-time when the token was issued */
  issueAt: string;
  /** ISO-8601 date-time when the token expires */
  expires: string;
  /** Response status code from the API */
  code: number;
  /** History ID for this login session */
  LoginHistoryId: number;
  /** First name of the authenticated user */
  firstName: string;
  /** Last name of the authenticated user */
  lastName: string;
  /** Entity ID the user is logged into */
  loggedinEntityId: number;
  /** Optional APIM subscription key */
  ApimSubscriptionKey?: string;
  /** Industry type identifier */
  IndustryTypeId: number;
}

/**
 * Error response returned on failed login attempts.
 */
export interface LoginErrorResponse {
  /** Error status code */
  code: number;
  /** Human-readable error message */
  message: string;
}

/**
 * Request payload for retrieving a certificate by its number.
 */
export interface CertificateRequest {
  /** The unique certificate number to look up */
  CertificateNumber: string;
}

/**
 * Structured error object returned by the DMVIC API within response payloads.
 *
 * @remarks Not to be confused with the {@link DmvicError} class in the `errors` module
 * which is the client-side error class thrown by the SDK.
 */
export interface DmvicApiError {
  /** Machine-readable error code (e.g. `"ER001"`) */
  errorCode: string;
  /** Human-readable error description */
  errorText: string;
}

/**
 * Array of {@link DmvicApiError} objects returned in API error responses.
 */
export type FlexibleDmvicError = DmvicApiError[];

/**
 * Callback URL object embedded in API responses.
 */
export interface CallbackURL {
  /** The callback URL string */
  URL: string;
}

/**
 * Response from the Get Certificate endpoint (`/V4/Integration/GetCertificate`).
 */
export interface CertificateResponse {
  /** Whether the API call was successful */
  success: boolean;
  /** Array of errors, present when `success` is `false` */
  error?: FlexibleDmvicError;
  /** Unique API request tracking number */
  apiRequestNumber: string;
  /** The original request inputs echoed back */
  inputs: CertificateRequest;
  /** Callback object with result URL */
  callbackObj: CallbackURL;
}

/**
 * Details of an existing insurance policy found during a double-insurance check.
 */
export interface DoubleInsuranceDetails {
  /** End date of the existing cover */
  CoverEndDate: string;
  /** Certificate number of the existing policy */
  InsuranceCertificateNo: string;
  /** Name of the insuring company */
  MemberCompanyName: string;
  /** Vehicle registration number */
  RegistrationNumber: string;
  /** Vehicle chassis number */
  ChassisNumber: string;
}

/**
 * Request payload for validating an existing insurance certificate.
 *
 * @remarks Field casing matches the DMVIC API specification.
 */
export interface InsuranceValidationRequest {
  /** Vehicle registration number (mixed case per API spec) */
  vehicleRegistrationnumber: string;
  /** Vehicle chassis number */
  Chassisnumber: string;
  /** Certificate number to validate */
  certificateNumber: string;
}

/**
 * Detailed insurance information returned by the Validate Insurance endpoint.
 */
export interface InsuranceDetails {
  /** Insurance certificate number */
  CertificateNumber: string;
  /** Policy number */
  InsurancePolicyNumber: string;
  /** Policy start date */
  ValidFrom: string;
  /** Policy end date */
  ValidTill: string;
  /** Vehicle registration number */
  Registrationnumber: string;
  /** Name of the insurer */
  InsuredBy: string;
  /** Vehicle chassis number */
  Chassisnumber: string;
  /** Name of the insured party */
  sInsuredName: string;
  /** Intermediary name */
  Intermediary: string;
  /** Intermediary IRA registration number */
  IntermediaryIRA: string;
  /** Current status of the certificate */
  CertificateStatus: string;
}

/**
 * Callback object for insurance validation responses.
 */
export interface InsuranceCallbackObj {
  /** The validated insurance details */
  validateInsurance: InsuranceDetails;
}

/**
 * Response from the Validate Insurance endpoint (`/V4/Integration/ValidateInsurance`).
 */
export interface InsuranceValidationResponse {
  /** The original validation inputs echoed back */
  inputs: InsuranceValidationRequest;
  /** Array of errors, present when `success` is `false` */
  error?: FlexibleDmvicError;
  /** Whether the API call was successful */
  success: boolean;
  /** Unique API request tracking number */
  apiRequestNumber: string;
  /** Callback object containing insurance details */
  callbackObj: InsuranceCallbackObj;
}

/**
 * Request payload for checking double insurance on a vehicle.
 *
 * @remarks All field names are lowercase to match the DMVIC API JSON tags.
 */
export interface DoubleInsuranceRequest {
  /** Proposed policy start date (dd/MM/yyyy) */
  policystartdate: string;
  /** Proposed policy end date (dd/MM/yyyy) */
  policyenddate: string;
  /** Vehicle registration number */
  vehicleregistrationnumber: string;
  /** Vehicle chassis number */
  chassisnumber: string;
}

/**
 * Callback object for double-insurance validation responses.
 */
export interface DoubleInsuranceCallbackObj {
  /** Array or map of found double-insurance records */
  DoubleInsurance: DoubleInsuranceDetails[] | { [key: string]: DoubleInsuranceDetails };
}

/**
 * Response from the Validate Double Insurance endpoint
 * (`/V4/Integration/ValidateDoubleInsurance`).
 */
export interface DoubleInsuranceResponse {
  /** Serialized input string */
  Inputs: string;
  /** Callback object containing double-insurance results (uppercase to match Go) */
  callbackObj: DoubleInsuranceCallbackObj;
  /** Array of errors, present when `success` is `false` */
  error?: FlexibleDmvicError;
  /** Whether the API call was successful */
  success: boolean;
  /** Unique API request tracking number */
  apiRequestNumber: string;
}

/**
 * Request payload for cancelling an insurance certificate.
 */
export interface CancellationRequest {
  /** Certificate number to cancel */
  CertificateNumber: string;
  /** Reason ID for cancellation — see {@link CANCEL_REASONS} for valid values */
  cancelreasonid: number;
}

/**
 * Callback object for cancellation responses.
 */
export interface CancellationCallbackObj {
  /** Transaction reference for the cancellation */
  TransactionReferenceNumber: string;
}

/**
 * Response from the Cancel Certificate endpoint (`/V4/Integration/CancelCertificate`).
 */
export interface CancellationResponse {
  /** Array of errors, present when `success` is `false` */
  error?: FlexibleDmvicError;
  /** Whether the API call was successful */
  success: boolean;
  /** Unique API request tracking number */
  apiRequestNumber: string;
  /** The original cancellation inputs echoed back */
  Inputs: CancellationRequest;
  /** Callback object with cancellation result */
  callbackObj: CancellationCallbackObj;
}

/**
 * Common fields shared by all certificate issuance request types (A, B, C, D).
 */
export interface BaseIssuanceFields {
  /** ID of the member insurance company */
  MemberCompanyID: number;
  /** Type of cover — see {@link ETypeOfCover} */
  Typeofcover: ETypeOfCover;
  /** Full name of the policyholder */
  Policyholder: string;
  /** Policy number */
  policynumber: string;
  /** Policy commencement date (dd/MM/yyyy) */
  Commencingdate: string;
  /** Policy expiry date (dd/MM/yyyy) */
  Expiringdate: string;
  /** Vehicle chassis number */
  Chassisnumber: string;
  /** Policyholder phone number */
  Phonenumber: string;
  /** Vehicle body type (e.g. "Saloon", "SUV", "Truck") */
  Bodytype: string;
  /** Policyholder email address */
  Email: string;
  /** Sum insured amount — required when cover type is COMP or TPTF */
  SumInsured: number;
  /** Insured person's KRA PIN */
  InsuredPIN: string;
  /** Vehicle registration number */
  Registrationnumber?: string;
  /** Vehicle make */
  Vehiclemake?: string;
  /** Vehicle model */
  Vehiclemodel?: string;
  /** Vehicle engine number */
  Enginenumber?: string;
  /** Year of vehicle manufacture */
  Yearofmanufacture?: number;
  /** Insured person's Huduma number */
  HudumaNumber?: string;
}

/**
 * Vehicle type codes used for Type B (commercial vehicle) issuance.
 *
 * @remarks Values 1–6 correspond to the DMVIC API vehicle classification IDs.
 */
export enum VehicleType {
  /** Motor Commercial — Own Goods */
  "MOTOR_COMMERCIAL_OWN_GOODS" = 1,
  /** Motor Commercial — General Cartage */
  "MOTOR_COMMERCIAL_GENERAL" = 2,
  /** Motor Institutional Vehicle */
  "MOTOR_INSTITUTIONAL_VEHICLE" = 3,
  /** Motor Special Vehicles */
  "MOTOR_SPECIAL_VEHICLES" = 4,
  /** Motor Tanker (Liquid Carrying) */
  "MOTOR_TANKER(LIQUID CARRYING)" = 5,
  /** Motor Trade (Road Risk) */
  "MOTOR_TRADE(ROAD RISK)" = 6,
}

/**
 * Certificate type codes for motorcycle and taxi categories.
 */
export enum CertificateType {
  /** PSV Motorcycle */
  "PSV_MOTORCYCLE" = 9,
  /** Standard Motorcycle */
  "MOTORCYCLE" = 4,
  /** Commercial Motorcycle */
  "MOTORCYCLE_COMMERCIAL" = 10,
  /** Taxi */
  "TAXI" = 8,
}

/**
 * Enumeration of certificate classification types.
 *
 * @remarks
 * - Values 4, 9, 10 are for Type D certificates (motorcycles)
 * - Values 1, 8 are for Type A certificates (PSV / taxi)
 */
export enum ETypeOfCertificate {
  /** Class A PSV Unmarked */
  "Class A PSV unmarked " = 1,
  /** Type A Taxi */
  "TYPE A TAXI" = 8,
  /** Type D Motor Cycle */
  "TYPE D Motor Cycle" = 4,
  /** Type D PSV Motor Cycle */
  "TYPE D PSV Motor Cycle" = 9,
  /** Type D Motor Cycle Commercial */
  "TYPE D Motor Cycle Commercial" = 10,
}

/**
 * Insurance cover type codes.
 *
 * | Code | Cover type |
 * |------|------------|
 * | 100  | Comprehensive (COMP) |
 * | 200  | Third-Party Only (TPO) |
 * | 300  | Third-Party, Fire & Theft (TPTF) |
 */
export enum ETypeOfCover {
  /** Comprehensive cover */
  Comprehensive = 100,
  /** Third-Party Only cover */
  ThirdParty = 200,
  /** Third-Party, Fire & Theft cover */
  ThirdPartyFire = 300,
}

/**
 * High-level classification of certificate classes by vehicle usage.
 */
export enum ClassType {
  /** Type A — Taxi / PSV */
  TypeA = "TAXI",
  /** Type B — Commercial vehicles */
  TypeB = "COMMERCIAL",
  /** Type C — Private vehicles */
  TypeC = "PRIVATE",
  /** Type D — Motorcycles */
  TypeD = "MOTORCYCLE",
}

/**
 * Issuance request for **Type A** certificates (PSV / Taxi vehicles).
 *
 * Extends {@link BaseIssuanceFields} with Type-A-specific fields.
 */
export interface TypeAIssuanceRequest extends BaseIssuanceFields {
  /** Certificate type ID — must be `1` (PSV Unmarked) or `8` (Taxi) */
  TypeOfCertificate: number;
  /** Number of passengers the vehicle is licensed to carry */
  Licensedtocarry: number;
}

/**
 * Issuance request for **Type B** certificates (commercial vehicles).
 *
 * Extends {@link BaseIssuanceFields} with Type-B-specific fields.
 */
export interface TypeBIssuanceRequest extends BaseIssuanceFields {
  /** Vehicle type ID (1–6) — see {@link VehicleType} */
  VehicleType: number;
  /** Vehicle tonnage */
  Tonnage: number;
  /** Number of passengers the vehicle is licensed to carry */
  Licensedtocarry: number;
}

/**
 * Issuance request for **Type C** certificates (private vehicles).
 *
 * Uses only the {@link BaseIssuanceFields} — no additional fields required.
 */
export interface TypeCIssuanceRequest extends BaseIssuanceFields {
  // Type C uses only base fields
}

/**
 * Issuance request for **Type D** certificates (motorcycles).
 *
 * Extends {@link BaseIssuanceFields} with Type-D-specific fields.
 *
 * @remarks When `TypeOfCertificate` is `10` (Motorcycle Commercial),
 * the `Tonnage` field is required.
 */
export interface TypeDIssuanceRequest extends BaseIssuanceFields {
  /** Certificate type ID — must be `4`, `9`, or `10` */
  TypeOfCertificate: number;
  /** Number of passengers the vehicle is licensed to carry */
  Licensedtocarry: number;
  /** Vehicle tonnage — required for commercial motorcycles (type `10`) */
  Tonnage: number;
}

/**
 * Callback object returned by certificate issuance endpoints.
 */
export interface IssuanceCallbackObj {
  /** Details of the issued certificate */
  issueCertificate: IssuanceDetails;
  /** Request ID for subsequent confirmation */
  IssuanceRequestID?: string;
  /** Human-readable issuance status message */
  IssuanceMessage?: string;
}

/**
 * Details of a successfully issued certificate.
 */
export interface IssuanceDetails {
  /** Transaction reference number */
  TransactionNo: string;
  /** Actual certificate number assigned */
  actualCNo: string;
  /** Email address the certificate was sent to */
  Email: string;
}

/**
 * Response from any certificate issuance or confirmation endpoint.
 *
 * @remarks Uses uppercase `Error` and `CallbackObj` to match the Go API response structure.
 */
export interface InsuranceResponse {
  /** Original request inputs echoed back */
  Inputs: any;
  /** Array of errors (uppercase `Error` — matches Go JSON struct) */
  Error?: FlexibleDmvicError;
  /** Whether the API call was successful */
  success: boolean;
  /** Unique API request tracking number */
  apiRequestNumber: string;
  /** Callback object with issuance details (uppercase `CallbackObj` — matches Go JSON struct) */
  callbackObj: IssuanceCallbackObj;
  CallbackObj: IssuanceCallbackObj;
}

/**
 * Request payload for confirming a certificate issuance.
 */
export interface ConfirmationRequest {
  /** The issuance request ID to confirm */
  IssuanceRequestID: string;
  /** Whether the issuance is approved */
  IsApproved: boolean;
  /** Whether the vehicle log book has been verified */
  IsLogBookVerified: boolean;
  /** Whether the vehicle has been physically inspected */
  IsVehicleInspected: boolean;
  /** Any additional comments for the confirmation */
  AdditionalComments: string;
  /** Username of the person confirming */
  UserName: string;
}

/**
 * Callback object for member company stock responses.
 */
export interface StockCallbackObj {
  /** Array of stock details per certificate classification */
  MemberCompanyStock: StockDetails[];
}

/**
 * Stock level details for a single certificate classification.
 */
export interface StockDetails {
  /** Certificate classification identifier */
  CertificateClassificationID: number;
  /** Human-readable classification title */
  ClassificationTitle: string;
  /** Number of certificates in stock */
  Stock: number;
  /** Certificate type identifier */
  CertificateTypeId: number;
}

/**
 * Response from the Member Company Stock endpoint
 * (`/V4/IntermediaryIntegration/MemberCompanyStock`).
 */
export interface StockResponse {
  /** Whether the API call was successful */
  success: boolean;
  /** Array of errors, present when `success` is `false` */
  error?: FlexibleDmvicError;
  /** Unique API request tracking number */
  apiRequestNumber: string;
  /** Callback object containing stock details */
  callbackObj: StockCallbackObj;
}

/**
 * Request payload for Vehicle Search (Member Company) - V6
 *
 * Example body: { "VehicleRegistrationNumber": "KDC324F" }
 */
export interface VehicleSearchRequest {
  /** The vehicle registration number to search for (max length 15) */
  VehicleRegistrationNumber: string;
}

/**
 * Vehicle details returned by the Vehicle Search endpoint.
 */
export interface VehicleInfo {
  RegistrationNumber: string | null;
  ChassisNumber: string | null;
  RegistrationYear: string | null;
  EngineNumber: string | null;
  Make: string | null;
  Model: string | null;
  BodyType: string | null;
}

/**
 * Single policy history entry returned in Vehicle Search responses.
 */
export interface PolicyHistoryItem {
  PolicyNumber: string | null;
  TypeOfCover: string | null;
  CoverStartDate: string | null;
  CoverEndDate: string | null;
  MemberCompany: string | null;
}

/**
 * Callback object returned by the Vehicle Search endpoint.
 */
export interface VehicleSearchCallbackObj {
  Vehicle: VehicleInfo;
  PolicyHistory: PolicyHistoryItem[];
}

/**
 * Response from the Vehicle Search endpoint (`/V6/Integration/VehicleSearch`).
 */
export interface VehicleSearchResponse {
  /** When present, echoes the original inputs */
  Inputs?: VehicleSearchRequest;
  /** Callback object containing vehicle and policy history information */
  callbackObj?: VehicleSearchCallbackObj;
  /** Whether the API call was successful */
  success: boolean;
  /** Array of errors, present when `success` is `false` */
  Error?: FlexibleDmvicError;
  /** Unique API request tracking number */
  APIRequestNumber?: string;
  /** Optional DMVIC reference number */
  DMVICRefNo?: string | null;
  /** Backwards-compatible top-level vehicle fields (some responses include these) */
  Vehicle?: VehicleInfo;
  PolicyHistory?: PolicyHistoryItem[];
}

/**
 * Target environment for the DMVIC client.
 *
 * - `"production"` — Live DMVIC API
 * - `"staging"` — Staging environment
 * - `"development"` — Uses the UAT endpoint
 */
export type Environment = 'development' | 'staging' | 'production';

/**
 * Username / password credentials for DMVIC API authentication.
 */
export interface DmvicCredentials {
  /** DMVIC API username */
  username: string;
  /** DMVIC API password */
  password: string;
}

/**
 * Configuration object for creating a {@link DmvicClient} instance.
 *
 * @example
 * ```typescript
 * const config: DmvicConfig = {
 *   environment: 'production',
 *   credentials: { username: 'user', password: 'pass' },
 *   clientId: 'my-client-id',
 *   certificates: {
 *     certPath: '/path/to/client.crt',
 *     keyPath: '/path/to/client.key',
 *   },
 * };
 * ```
 */
export interface DmvicConfig {
  /** Target environment — defaults to UAT when omitted */
  environment?: Environment;
  /** Explicit base URL — overrides the environment-derived endpoint */
  baseURL?: string;
  /** API authentication credentials */
  credentials: DmvicCredentials;
  /** Client identifier sent in every request header */
  clientId: string;
  /** HTTP request timeout in milliseconds (default: 30 000) */
  timeout?: number;
  /** Token time-to-live in milliseconds (default: 86 400 000 = 24 h) */
  tokenTTL?: number;
  /** Skip TLS certificate verification — **development only** */
  insecureSkipVerify?: boolean;
  /** Enable verbose debug logging to `console.log` */
  debug?: boolean;
  /** X.509 mutual-TLS certificate configuration */
  certificates?: CertificateConfig;
}
