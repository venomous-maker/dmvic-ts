/**
 * DMVIC Utility Functions
 *
 * Helper functions for looking up human-readable descriptions of DMVIC codes
 * and for validating issuance request payloads before they are sent to the API.
 *
 * @module utils
 */

import { 
  CANCEL_REASONS, 
  COVER_TYPES, 
  CERTIFICATE_TYPES, 
  VEHICLE_TYPES 
} from './constants';
import {
  TypeAIssuanceRequest, 
  TypeBIssuanceRequest, 
  TypeCIssuanceRequest, 
  TypeDIssuanceRequest 
} from './types';
import { DmvicError } from './errors';

/**
 * Returns a human-readable description for a cancellation reason ID.
 *
 * @param reasonID - One of the {@link CANCEL_REASONS} values
 * @returns Description string, or `"Unknown cancel reason: <id>"` for unrecognised IDs
 */
export function getCancelReasonDescription(reasonID: number): string {
  switch (reasonID) {
    case CANCEL_REASONS.INSURED_REQUEST:
      return "Insured person requested cancellation";
    case CANCEL_REASONS.AMEND_PASSENGERS:
      return "Amending no of passengers";
    case CANCEL_REASONS.CHANGE_SCOPE_OF_COVER:
      return "Change of scope of cover";
    case CANCEL_REASONS.POLICY_NOT_TAKEN:
      return "Policy Not taken up";
    case CANCEL_REASONS.VEHICLE_SOLD:
      return "Vehicle sold";
    case CANCEL_REASONS.AMEND_INSURED_DETAILS:
      return "Amending Insured's Details";
    case CANCEL_REASONS.AMEND_VEHICLE_DETAILS:
      return "Amending vehicle details";
    case CANCEL_REASONS.SUSPECTED_FRAUD:
      return "Suspected Fraud";
    case CANCEL_REASONS.NON_PAYMENT:
      return "Non-payment of premium";
    case CANCEL_REASONS.FAILURE_TO_PROVIDE_KYC:
      return "Failure to provide KYCs";
    case CANCEL_REASONS.GOVERNMENT_REQUEST:
      return "Request by a government body";
    case CANCEL_REASONS.SUBJECT_MATTER_CEASED:
      return "Subject matter ceased to exist";
    case CANCEL_REASONS.CHANGE_PERIOD:
      return "Change Period of Insurance";
    case CANCEL_REASONS.COVER_DECLINED:
      return "Cover declined by Insurer";
    case CANCEL_REASONS.VEHICLE_WRITTEN_OFF:
      return "Motor Vehicle was written off";
    case CANCEL_REASONS.VEHICLE_STOLEN:
      return "Motor Vehicle was stolen";
    default:
      return `Unknown cancel reason: ${reasonID}`;
  }
}

/**
 * Returns a human-readable description for a cover type code.
 *
 * @param coverType - One of the {@link COVER_TYPES} values (100, 200, or 300)
 * @returns Description string, or `"Unknown cover type: <code>"` for unrecognised codes
 */
export function getCoverTypeDescription(coverType: number): string {
  switch (coverType) {
    case COVER_TYPES.COMPREHENSIVE:
      return "Comprehensive (COMP)";
    case COVER_TYPES.THIRD_PARTY:
      return "Third-party (TPO)";
    case COVER_TYPES.TPTF:
      return "Third-party, Theft & Fire (TPTF)";
    default:
      return `Unknown cover type: ${coverType}`;
  }
}

/**
 * Returns a human-readable description for a certificate type code.
 *
 * @param certType - One of the {@link CERTIFICATE_TYPES} values
 * @returns Description string, or `"Unknown certificate type: <code>"` for unrecognised codes
 */
export function getCertificateTypeDescription(certType: number): string {
  switch (certType) {
    case CERTIFICATE_TYPES.CLASS_A_PSV_UNMARKED:
      return "Class A PSV Unmarked";
    case CERTIFICATE_TYPES.TYPE_A_TAXI:
      return "Type A Taxi";
    case CERTIFICATE_TYPES.TYPE_D_MOTORCYCLE:
      return "Type D Motorcycle";
    case CERTIFICATE_TYPES.TYPE_D_PSV_MOTORCYCLE:
      return "Type D PSV Motorcycle";
    case CERTIFICATE_TYPES.TYPE_D_MOTORCYCLE_COMM:
      return "Type D Motorcycle Commercial";
    default:
      return `Unknown certificate type: ${certType}`;
  }
}

/**
 * Returns a human-readable description for a vehicle type code.
 *
 * @param vehicleType - One of the {@link VEHICLE_TYPES} values (1–6)
 * @returns Description string, or `"Unknown vehicle type: <code>"` for unrecognised codes
 */
export function getVehicleTypeDescription(vehicleType: number): string {
  switch (vehicleType) {
    case VEHICLE_TYPES.OWN_GOODS:
      return "Own Goods";
    case VEHICLE_TYPES.GENERAL_CARTAGE:
      return "General Cartage";
    case VEHICLE_TYPES.INSTITUTIONAL:
      return "Institutional";
    case VEHICLE_TYPES.SPECIAL:
      return "Special";
    case VEHICLE_TYPES.TANKERS:
      return "Tankers";
    case VEHICLE_TYPES.MOTOR_TRADE:
      return "Motor Trade";
    default:
      return `Unknown vehicle type: ${vehicleType}`;
  }
}

/**
 * Validates a Type A (PSV / Taxi) issuance request.
 *
 * @param req - The issuance request to validate
 * @throws {@link DmvicError} with `invalidInput` if any required field is missing or invalid
 */
export function validateTypeARequest(req: TypeAIssuanceRequest): void {
  if (req.MemberCompanyID <= 0) {
    throw DmvicError.invalidInput("MemberCompanyID is required");
  }
  
  if (req.TypeOfCertificate !== CERTIFICATE_TYPES.CLASS_A_PSV_UNMARKED && 
      req.TypeOfCertificate !== CERTIFICATE_TYPES.TYPE_A_TAXI) {
    throw DmvicError.invalidInput(`Invalid TypeOfCertificate for Type A: ${req.TypeOfCertificate}`);
  }
  
  if (req.Typeofcover !== COVER_TYPES.COMPREHENSIVE &&
      req.Typeofcover !== COVER_TYPES.THIRD_PARTY &&
      req.Typeofcover !== COVER_TYPES.TPTF) {
    throw DmvicError.invalidInput(`Invalid Typeofcover: ${req.Typeofcover}`);
  }
  
  if ((req.Typeofcover === COVER_TYPES.COMPREHENSIVE || req.Typeofcover === COVER_TYPES.TPTF) &&
      req.SumInsured <= 0) {
    throw DmvicError.invalidInput("SumInsured is required for COMP and TPTF cover types");
  }
  
  if (!req.Policyholder) {
    throw DmvicError.invalidInput("Policyholder is required");
  }
  
  if (!req.policynumber) {
    throw DmvicError.invalidInput("policynumber is required");
  }
  
  if (!req.Registrationnumber) {
    throw DmvicError.invalidInput("Registrationnumber is required");
  }
  
  if (!req.Chassisnumber) {
    throw DmvicError.invalidInput("Chassisnumber is required");
  }
}

/**
 * Validates a Type B (commercial vehicle) issuance request.
 *
 * @param req - The issuance request to validate
 * @throws {@link DmvicError} with `invalidInput` if any required field is missing or invalid
 */
export function validateTypeBRequest(req: TypeBIssuanceRequest): void {
  if (req.MemberCompanyID <= 0) {
    throw DmvicError.invalidInput("MemberCompanyID is required");
  }
  
  if (req.VehicleType < VEHICLE_TYPES.OWN_GOODS || req.VehicleType > VEHICLE_TYPES.MOTOR_TRADE) {
    throw DmvicError.invalidInput(`Invalid VehicleType: ${req.VehicleType}`);
  }
  
  if (req.Typeofcover !== COVER_TYPES.COMPREHENSIVE &&
      req.Typeofcover !== COVER_TYPES.THIRD_PARTY &&
      req.Typeofcover !== COVER_TYPES.TPTF) {
    throw DmvicError.invalidInput(`Invalid Typeofcover: ${req.Typeofcover}`);
  }
  
  if ((req.Typeofcover === COVER_TYPES.COMPREHENSIVE || req.Typeofcover === COVER_TYPES.TPTF) &&
      req.SumInsured <= 0) {
    throw DmvicError.invalidInput("SumInsured is required for COMP and TPTF cover types");
  }
  
  if (!req.Policyholder) {
    throw DmvicError.invalidInput("Policyholder is required");
  }
  
  if (!req.policynumber) {
    throw DmvicError.invalidInput("policynumber is required");
  }
  
  if (!req.Registrationnumber) {
    throw DmvicError.invalidInput("Registrationnumber is required");
  }
  
  if (!req.Chassisnumber) {
    throw DmvicError.invalidInput("Chassisnumber is required");
  }
}

/**
 * Validates a Type C (private vehicle) issuance request.
 *
 * @param req - The issuance request to validate
 * @throws {@link DmvicError} with `invalidInput` if any required field is missing or invalid
 */
export function validateTypeCRequest(req: TypeCIssuanceRequest): void {
  if (req.MemberCompanyID <= 0) {
    throw DmvicError.invalidInput("MemberCompanyID is required");
  }
  
  if (req.Typeofcover !== COVER_TYPES.COMPREHENSIVE &&
      req.Typeofcover !== COVER_TYPES.THIRD_PARTY &&
      req.Typeofcover !== COVER_TYPES.TPTF) {
    throw DmvicError.invalidInput(`Invalid Typeofcover: ${req.Typeofcover}`);
  }
  
  if ((req.Typeofcover === COVER_TYPES.COMPREHENSIVE || req.Typeofcover === COVER_TYPES.TPTF) &&
      req.SumInsured <= 0) {
    throw DmvicError.invalidInput("SumInsured is required for COMP and TPTF cover types");
  }
  
  if (!req.Policyholder) {
    throw DmvicError.invalidInput("Policyholder is required");
  }
  
  if (!req.policynumber) {
    throw DmvicError.invalidInput("policynumber is required");
  }
  
  if (!req.Registrationnumber) {
    throw DmvicError.invalidInput("Registrationnumber is required");
  }
  
  if (!req.Chassisnumber) {
    throw DmvicError.invalidInput("Chassisnumber is required");
  }
}

/**
 * Validates a Type D (motorcycle) issuance request.
 *
 * @param req - The issuance request to validate
 * @throws {@link DmvicError} with `invalidInput` if any required field is missing or invalid
 */
export function validateTypeDRequest(req: TypeDIssuanceRequest): void {
  if (req.MemberCompanyID <= 0) {
    throw DmvicError.invalidInput("MemberCompanyID is required");
  }
  
  if (req.TypeOfCertificate !== CERTIFICATE_TYPES.TYPE_D_MOTORCYCLE && 
      req.TypeOfCertificate !== CERTIFICATE_TYPES.TYPE_D_PSV_MOTORCYCLE && 
      req.TypeOfCertificate !== CERTIFICATE_TYPES.TYPE_D_MOTORCYCLE_COMM) {
    throw DmvicError.invalidInput(`Invalid TypeOfCertificate for Type D: ${req.TypeOfCertificate}`);
  }
  
  if (req.Typeofcover !== COVER_TYPES.COMPREHENSIVE &&
      req.Typeofcover !== COVER_TYPES.THIRD_PARTY &&
      req.Typeofcover !== COVER_TYPES.TPTF) {
    throw DmvicError.invalidInput(`Invalid Typeofcover: ${req.Typeofcover}`);
  }
  
  if ((req.Typeofcover === COVER_TYPES.COMPREHENSIVE || req.Typeofcover === COVER_TYPES.TPTF) &&
      req.SumInsured <= 0) {
    throw DmvicError.invalidInput("SumInsured is required for COMP and TPTF cover types");
  }
  
  if (!req.Policyholder) {
    throw DmvicError.invalidInput("Policyholder is required");
  }
  
  if (!req.policynumber) {
    throw DmvicError.invalidInput("policynumber is required");
  }
  
  if (!req.Registrationnumber) {
    throw DmvicError.invalidInput("Registrationnumber is required");
  }
  
  if (!req.Chassisnumber) {
    throw DmvicError.invalidInput("Chassisnumber is required");
  }
}
