import {
  getCancelReasonDescription,
  getCoverTypeDescription,
  getCertificateTypeDescription,
  getVehicleTypeDescription,
  validateTypeARequest,
  validateTypeBRequest,
  validateTypeCRequest,
  validateTypeDRequest,
} from "../src/utils";
import {
  CANCEL_REASONS,
  COVER_TYPES,
  CERTIFICATE_TYPES,
  VEHICLE_TYPES,
} from "../src/constants";
import { DmvicError } from "../src/errors";
import type {
  TypeAIssuanceRequest,
  TypeBIssuanceRequest,
  TypeCIssuanceRequest,
  TypeDIssuanceRequest,
} from "../src/types";
import { ETypeOfCover } from "../src/types";

// --- Description helpers ---

describe("getCancelReasonDescription", () => {
  it.each([
    [CANCEL_REASONS.INSURED_REQUEST, "Insured person requested cancellation"],
    [CANCEL_REASONS.AMEND_PASSENGERS, "Amending no of passengers"],
    [CANCEL_REASONS.CHANGE_SCOPE_OF_COVER, "Change of scope of cover"],
    [CANCEL_REASONS.POLICY_NOT_TAKEN, "Policy Not taken up"],
    [CANCEL_REASONS.VEHICLE_SOLD, "Vehicle sold"],
    [CANCEL_REASONS.AMEND_INSURED_DETAILS, "Amending Insured's Details"],
    [CANCEL_REASONS.AMEND_VEHICLE_DETAILS, "Amending vehicle details"],
    [CANCEL_REASONS.SUSPECTED_FRAUD, "Suspected Fraud"],
    [CANCEL_REASONS.NON_PAYMENT, "Non-payment of premium"],
    [CANCEL_REASONS.FAILURE_TO_PROVIDE_KYC, "Failure to provide KYCs"],
    [CANCEL_REASONS.GOVERNMENT_REQUEST, "Request by a government body"],
    [CANCEL_REASONS.SUBJECT_MATTER_CEASED, "Subject matter ceased to exist"],
    [CANCEL_REASONS.CHANGE_PERIOD, "Change Period of Insurance"],
    [CANCEL_REASONS.COVER_DECLINED, "Cover declined by Insurer"],
    [CANCEL_REASONS.VEHICLE_WRITTEN_OFF, "Motor Vehicle was written off"],
    [CANCEL_REASONS.VEHICLE_STOLEN, "Motor Vehicle was stolen"],
  ])("should return description for reason %i", (reasonID, expected) => {
    expect(getCancelReasonDescription(reasonID)).toBe(expected);
  });

  it("should return unknown for unrecognised reason", () => {
    expect(getCancelReasonDescription(9999)).toBe("Unknown cancel reason: 9999");
  });
});

describe("getCoverTypeDescription", () => {
  it.each([
    [COVER_TYPES.COMPREHENSIVE, "Comprehensive (COMP)"],
    [COVER_TYPES.THIRD_PARTY, "Third-party (TPO)"],
    [COVER_TYPES.TPTF, "Third-party, Theft & Fire (TPTF)"],
  ])("should return description for cover type %i", (coverType, expected) => {
    expect(getCoverTypeDescription(coverType)).toBe(expected);
  });

  it("should return unknown for unrecognised cover type", () => {
    expect(getCoverTypeDescription(9999)).toBe("Unknown cover type: 9999");
  });
});

describe("getCertificateTypeDescription", () => {
  it.each([
    [CERTIFICATE_TYPES.CLASS_A_PSV_UNMARKED, "Class A PSV Unmarked"],
    [CERTIFICATE_TYPES.TYPE_A_TAXI, "Type A Taxi"],
    [CERTIFICATE_TYPES.TYPE_D_MOTORCYCLE, "Type D Motorcycle"],
    [CERTIFICATE_TYPES.TYPE_D_PSV_MOTORCYCLE, "Type D PSV Motorcycle"],
    [CERTIFICATE_TYPES.TYPE_D_MOTORCYCLE_COMM, "Type D Motorcycle Commercial"],
  ])("should return description for cert type %i", (certType, expected) => {
    expect(getCertificateTypeDescription(certType)).toBe(expected);
  });

  it("should return unknown for unrecognised cert type", () => {
    expect(getCertificateTypeDescription(9999)).toBe(
      "Unknown certificate type: 9999",
    );
  });
});

describe("getVehicleTypeDescription", () => {
  it.each([
    [VEHICLE_TYPES.OWN_GOODS, "Own Goods"],
    [VEHICLE_TYPES.GENERAL_CARTAGE, "General Cartage"],
    [VEHICLE_TYPES.INSTITUTIONAL, "Institutional"],
    [VEHICLE_TYPES.SPECIAL, "Special"],
    [VEHICLE_TYPES.TANKERS, "Tankers"],
    [VEHICLE_TYPES.MOTOR_TRADE, "Motor Trade"],
  ])("should return description for vehicle type %i", (vt, expected) => {
    expect(getVehicleTypeDescription(vt)).toBe(expected);
  });

  it("should return unknown for unrecognised vehicle type", () => {
    expect(getVehicleTypeDescription(9999)).toBe("Unknown vehicle type: 9999");
  });
});

// --- Validation helpers ---

function makeBaseFields(overrides: Partial<TypeAIssuanceRequest> = {}): any {
  return {
    MemberCompanyID: 1,
    Typeofcover: ETypeOfCover.ThirdParty,
    Policyholder: "John Doe",
    policynumber: "POL-001",
    Commencingdate: "01/01/2026",
    Expiringdate: "01/01/2027",
    Chassisnumber: "CH123",
    Phonenumber: "0712345678",
    Bodytype: "Saloon",
    Email: "john@example.com",
    SumInsured: 0,
    InsuredPIN: "A123456789B",
    Registrationnumber: "KAA 001A",
    ...overrides,
  };
}

describe("validateTypeARequest", () => {
  it("should pass with valid Type A request", () => {
    const req: TypeAIssuanceRequest = {
      ...makeBaseFields(),
      TypeOfCertificate: CERTIFICATE_TYPES.TYPE_A_TAXI,
      Licensedtocarry: 4,
    };
    expect(() => validateTypeARequest(req)).not.toThrow();
  });

  it("should throw on invalid MemberCompanyID", () => {
    const req: TypeAIssuanceRequest = {
      ...makeBaseFields({ MemberCompanyID: 0 }),
      TypeOfCertificate: CERTIFICATE_TYPES.TYPE_A_TAXI,
      Licensedtocarry: 4,
    };
    expect(() => validateTypeARequest(req)).toThrow("MemberCompanyID is required");
  });

  it("should throw on invalid TypeOfCertificate", () => {
    const req: TypeAIssuanceRequest = {
      ...makeBaseFields(),
      TypeOfCertificate: 99,
      Licensedtocarry: 4,
    };
    expect(() => validateTypeARequest(req)).toThrow("Invalid TypeOfCertificate for Type A");
  });

  it("should throw on invalid Typeofcover", () => {
    const req: TypeAIssuanceRequest = {
      ...makeBaseFields({ Typeofcover: 999 as any }),
      TypeOfCertificate: CERTIFICATE_TYPES.TYPE_A_TAXI,
      Licensedtocarry: 4,
    };
    expect(() => validateTypeARequest(req)).toThrow("Invalid Typeofcover");
  });

  it("should throw when SumInsured missing for COMP cover", () => {
    const req: TypeAIssuanceRequest = {
      ...makeBaseFields({ Typeofcover: ETypeOfCover.Comprehensive, SumInsured: 0 }),
      TypeOfCertificate: CERTIFICATE_TYPES.TYPE_A_TAXI,
      Licensedtocarry: 4,
    };
    expect(() => validateTypeARequest(req)).toThrow(
      "SumInsured is required for COMP and TPTF cover types",
    );
  });

  it("should throw when Policyholder is empty", () => {
    const req: TypeAIssuanceRequest = {
      ...makeBaseFields({ Policyholder: "" }),
      TypeOfCertificate: CERTIFICATE_TYPES.TYPE_A_TAXI,
      Licensedtocarry: 4,
    };
    expect(() => validateTypeARequest(req)).toThrow("Policyholder is required");
  });

  it("should throw when policynumber is empty", () => {
    const req: TypeAIssuanceRequest = {
      ...makeBaseFields({ policynumber: "" }),
      TypeOfCertificate: CERTIFICATE_TYPES.TYPE_A_TAXI,
      Licensedtocarry: 4,
    };
    expect(() => validateTypeARequest(req)).toThrow("policynumber is required");
  });

  it("should throw when Registrationnumber is empty", () => {
    const req: TypeAIssuanceRequest = {
      ...makeBaseFields({ Registrationnumber: "" }),
      TypeOfCertificate: CERTIFICATE_TYPES.TYPE_A_TAXI,
      Licensedtocarry: 4,
    };
    expect(() => validateTypeARequest(req)).toThrow("Registrationnumber is required");
  });

  it("should throw when Chassisnumber is empty", () => {
    const req: TypeAIssuanceRequest = {
      ...makeBaseFields({ Chassisnumber: "" }),
      TypeOfCertificate: CERTIFICATE_TYPES.TYPE_A_TAXI,
      Licensedtocarry: 4,
    };
    expect(() => validateTypeARequest(req)).toThrow("Chassisnumber is required");
  });
});

describe("validateTypeBRequest", () => {
  it("should pass with valid Type B request", () => {
    const req: TypeBIssuanceRequest = {
      ...makeBaseFields(),
      VehicleType: VEHICLE_TYPES.OWN_GOODS,
      Tonnage: 5,
      Licensedtocarry: 2,
    };
    expect(() => validateTypeBRequest(req)).not.toThrow();
  });

  it("should throw on invalid VehicleType", () => {
    const req: TypeBIssuanceRequest = {
      ...makeBaseFields(),
      VehicleType: 99,
      Tonnage: 5,
      Licensedtocarry: 2,
    };
    expect(() => validateTypeBRequest(req)).toThrow("Invalid VehicleType");
  });

  it("should throw on invalid MemberCompanyID", () => {
    const req: TypeBIssuanceRequest = {
      ...makeBaseFields({ MemberCompanyID: -1 }),
      VehicleType: VEHICLE_TYPES.OWN_GOODS,
      Tonnage: 5,
      Licensedtocarry: 2,
    };
    expect(() => validateTypeBRequest(req)).toThrow("MemberCompanyID is required");
  });
});

describe("validateTypeCRequest", () => {
  it("should pass with valid Type C request", () => {
    const req: TypeCIssuanceRequest = makeBaseFields();
    expect(() => validateTypeCRequest(req)).not.toThrow();
  });

  it("should throw on missing Policyholder", () => {
    const req: TypeCIssuanceRequest = makeBaseFields({ Policyholder: "" });
    expect(() => validateTypeCRequest(req)).toThrow("Policyholder is required");
  });
});

describe("validateTypeDRequest", () => {
  it("should pass with valid Type D request", () => {
    const req: TypeDIssuanceRequest = {
      ...makeBaseFields(),
      TypeOfCertificate: CERTIFICATE_TYPES.TYPE_D_MOTORCYCLE,
      Licensedtocarry: 1,
      Tonnage: 0,
    };
    expect(() => validateTypeDRequest(req)).not.toThrow();
  });

  it("should throw on invalid TypeOfCertificate for Type D", () => {
    const req: TypeDIssuanceRequest = {
      ...makeBaseFields(),
      TypeOfCertificate: 1, // Type A cert, invalid for Type D
      Licensedtocarry: 1,
      Tonnage: 0,
    };
    expect(() => validateTypeDRequest(req)).toThrow(
      "Invalid TypeOfCertificate for Type D",
    );
  });
});

