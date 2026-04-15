import * as path from "path";
import { DmvicClient } from "../src/client";

describe("DmvicClient", () => {
  let client: DmvicClient;

  beforeAll(() => {
    client = new DmvicClient({
      baseURL: "https://uat-api.dmvic.com/api",
      credentials: {
        username: "test-user",
        password: "test-pass",
      },
      clientId: "test-client-id",
      timeout: 30000,
      debug: false,
      environment: "development",
      certificates: {
        certPath: path.resolve(__dirname, "client.crt"),
        keyPath: path.resolve(__dirname, "client.key"),
        caPath: path.resolve(__dirname, "ca.crt"),
      },
      insecureSkipVerify: true,
    });
  });

  it("should create a client instance", () => {
    expect(client).toBeDefined();
    expect(client).toBeInstanceOf(DmvicClient);
  });

  it("should report token as invalid before login", () => {
    expect(client.isTokenValid()).toBe(false);
  });

  it("should return empty string when no token is set", () => {
    expect(client.getToken()).toBe("");
  });

  it("should throw on empty certificate number", async () => {
    await expect(client.getCertificate("")).rejects.toThrow(
      "Certificate number is required",
    );
  });

  it("should throw on invalid cancel reason ID", async () => {
    await expect(client.cancelCertificate("CERT-001", 0)).rejects.toThrow(
      "Reason ID must be a positive integer",
    );
  });

  it("should throw on empty vehicle registration for insurance validation", async () => {
    await expect(
      client.validateInsurance({
        vehicleRegistrationnumber: "",
        Chassisnumber: "CH123",
        certificateNumber: "CERT-001",
      }),
    ).rejects.toThrow("Vehicle registration number is required");
  });

  it("should throw on empty vehicle registration for double insurance", async () => {
    await expect(
      client.validateDoubleInsurance({
        policystartdate: "01/01/2026",
        policyenddate: "01/01/2027",
        vehicleregistrationnumber: "",
        chassisnumber: "CH123",
      }),
    ).rejects.toThrow("Vehicle registration number is required");
  });

  it("should throw on invalid member company ID", async () => {
    await expect(client.getMemberCompanyStock(-1)).rejects.toThrow(
      "Member company ID must be a positive integer",
    );
  });

  it("should throw on empty issuance request ID for confirmation", async () => {
    await expect(
      client.confirmCertificateIssuance({
        IssuanceRequestID: "",
        IsApproved: true,
        IsLogBookVerified: true,
        IsVehicleInspected: true,
        AdditionalComments: "",
        UserName: "admin",
      }),
    ).rejects.toThrow("Issuance request ID is required for confirmation");
  });
});