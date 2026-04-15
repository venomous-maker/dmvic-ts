/**
 * DMVIC API Types and Interfaces - 
 */

// X.509 Certificate Configuration
export interface CertificateConfig {
  certPath: string;
  keyPath: string;
  caPath?: string;
}

export interface LoginResponse {
  token: string;
  loginUserId: string;
  issueAt: string;
  expires: string;
  code: number;
  LoginHistoryId: number;
  firstName: string;
  lastName: string;
  loggedinEntityId: number;
  ApimSubscriptionKey?: string;
  IndustryTypeId: number;
}


export interface LoginErrorResponse {
  code: number;
  message: string;
}

export interface CertificateRequest {
  CertificateNumber: string; //  case
}

export interface DmvicError {
  errorCode: string;
  errorText: string;
}

export type FlexibleDmvicError = DmvicError[];

export interface CallbackURL {
  URL: string;
}

export interface CertificateResponse {
  success: boolean;
  error?: FlexibleDmvicError;
  apiRequestNumber: string;
  inputs: CertificateRequest;
  callbackObj: CallbackURL;
}

export interface DoubleInsuranceDetails {
  CoverEndDate: string;
  InsuranceCertificateNo: string;
  MemberCompanyName: string;
  RegistrationNumber: string;
  ChassisNumber: string;
}

//  field names and cases
export interface InsuranceValidationRequest {
  vehicleRegistrationnumber: string; 
  Chassisnumber: string;
  certificateNumber: string;
}

export interface InsuranceDetails {
  CertificateNumber: string;
  InsurancePolicyNumber: string;
  ValidFrom: string;
  ValidTill: string;
  Registrationnumber: string;
  InsuredBy: string;
  Chassisnumber: string;
  sInsuredName: string;
  Intermediary: string;
  IntermediaryIRA: string;
  CertificateStatus: string;
}

export interface InsuranceCallbackObj {
  validateInsurance: InsuranceDetails;
}

export interface InsuranceValidationResponse {
  inputs: InsuranceValidationRequest;
  error?: FlexibleDmvicError;
  success: boolean;
  apiRequestNumber: string;
  callbackObj: InsuranceCallbackObj;
}

export interface DoubleInsuranceRequest {
  policystartdate: string;
  policyenddate: string;
  vehicleregistrationnumber: string; 
  chassisnumber: string;
}

export interface DoubleInsuranceCallbackObj {
  DoubleInsurance: DoubleInsuranceDetails[] | { [key: string]: DoubleInsuranceDetails };
}

export interface DoubleInsuranceResponse {
  Inputs: string;
  CallbackObj: DoubleInsuranceCallbackObj; // Uppercase CallbackObj to match Go
  error?: FlexibleDmvicError;
  success: boolean;
  apiRequestNumber: string;
}

// request structure
export interface CancellationRequest {
  CertificateNumber: string;
  cancelreasonid: number; // Lowercase to match Go JSON tag
}

export interface CancellationCallbackObj {
  TransactionReferenceNumber: string;
}

export interface CancellationResponse {
  error?: FlexibleDmvicError;
  success: boolean;
  apiRequestNumber: string;
  Inputs: CancellationRequest;
  callbackObj: CancellationCallbackObj;
}

// Base issuance fields 
export interface BaseIssuanceFields {
  MemberCompanyID: number;
  Typeofcover: ETypeOfCover;
  Policyholder: string;
  policynumber: string;
  Commencingdate: string;
  Expiringdate: string;
  Chassisnumber: string;
  Phonenumber: string;
  Bodytype: string;
  Email: string;
  SumInsured: number;   // required when covertype is COMP or TPTF
  InsuredPIN: string;
  Registrationnumber?: string,
  Vehiclemake?: string,
  Vehiclemodel?: string,
  Enginenumber?: string,
  Yearofmanufacture?: number,
  HudumaNumber?:string
}


// used for issuance ofTypeB
export enum VehicleType {
  "MOTOR_COMMERCIAL_OWN_GOODS" = 1,
  "MOTOR_COMMERCIAL_GENERAL" = 2,
  "MOTOR_INSTITUTIONAL_VEHICLE" = 3,
  "MOTOR_SPECIAL_VEHICLES" = 4,
  "MOTOR_TANKER(LIQUID CARRYING)" = 5,
  "MOTOR_TRADE(ROAD RISK)" = 6,

}

export enum CertificateType {
  "PSV_MOTORCYCLE"=9,
  "MOTORCYCLE"=4,
  "MOTORCYCLE_COMMERCIAL"=10,
  "TAXI"=8

}

// 4,9,10 for type d certifictes
// 1,8 for type a certifictes

export enum ETypeOfCertificate {
  "Class A PSV unmarked "=1,
  "TYPE A TAXI"=8,
  "TYPE D Motor Cycle"=4,
  "TYPE D PSV Motor Cycle"=9,
  "TYPE D Motor Cycle Commercial"=10
}

export enum ETypeOfCover {
  Comprehensive = 100,
  ThirdParty = 200,
  ThirdPartyFire = 300
}

export enum ClassType {
  TypeA = "TAXI",
  TypeB = "COMMERCIAL",
  TypeC = "PRIVATE",
  TypeD = "MOTORCYCLE",
}

export interface TypeAIssuanceRequest extends BaseIssuanceFields {
  TypeOfCertificate: number;
  Licensedtocarry: number;
}

export interface TypeBIssuanceRequest extends BaseIssuanceFields {
  VehicleType: number;
  Tonnage: number;
  Licensedtocarry: number;
}

export interface TypeCIssuanceRequest extends BaseIssuanceFields {
  // Type C uses only base fields
}

//  WHEN TYPE D -MOTOR CYCLE COMMERCIAL
// Tonnage is required

export interface TypeDIssuanceRequest extends BaseIssuanceFields {
  TypeOfCertificate: number;
  Licensedtocarry: number;
  Tonnage: number;
}

export interface IssuanceCallbackObj {
  issueCertificate: IssuanceDetails;
  IssuanceRequestID?: string;
  IssuanceMessage?: string;
}

export interface IssuanceDetails {
  TransactionNo: string;
  actualCNo: string;
  Email: string;
}

export interface InsuranceResponse {
  Inputs: any;
  Error?: FlexibleDmvicError; // Uppercase Error for InsuranceResponse (matches Go)
  success: boolean;
  apiRequestNumber: string;
  CallbackObj: IssuanceCallbackObj; // Uppercase CallbackObj for InsuranceResponse (matches Go)
}

export interface ConfirmationRequest {
  IssuanceRequestID: string;
  IsApproved: boolean;
  IsLogBookVerified: boolean;
  IsVehicleInspected: boolean;
  AdditionalComments: string;
  UserName: string;
}

// Stock response for member company stock 
export interface StockCallbackObj {
  MemberCompanyStock: StockDetails[];
}

export interface StockDetails {
  CertificateClassificationID: number;
  ClassificationTitle: string;
  Stock: number;
  CertificateTypeId: number;
}

export interface StockResponse {
  success: boolean;
  error?: FlexibleDmvicError;
  apiRequestNumber: string;
  callbackObj: StockCallbackObj;
}

// Configuration and environment types
export type Environment = 'development' | 'staging' | 'production';

export interface DmvicCredentials {
  username: string;
  password: string;
}

// Updated configuration to include X.509 certificates
export interface DmvicConfig {
  environment?: Environment;
  baseURL?: string; // Made required to match usage
  credentials: DmvicCredentials;
  clientId: string;
  timeout?: number;
  tokenTTL?: number;
  insecureSkipVerify?: boolean;
  debug?: boolean;
  certificates?: CertificateConfig; // X.509 certificate support
}
