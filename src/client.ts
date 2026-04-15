/**
 * DMVIC Client Implementation with X.509 Certificate Support
 */

import { readFileSync } from "fs";
import * as https from "https";
import * as http from "http";
import { Agent as HttpsAgent } from "https";
import { URL } from "url";
import {
  DmvicConfig,
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
} from "./types";
import {
  API_ENDPOINTS,
  DEFAULT_TIMEOUT,
  DEFAULT_TOKEN_TTL,
  DMVIC_ERROR_CODES,
  ENDPOINTS,
  ERROR_CODES,
} from "./constants";
import { DmvicError } from "./errors";
import { TTLCache } from "./cache";
import {
  validateTypeARequest,
  validateTypeBRequest,
  validateTypeCRequest,
  validateTypeDRequest,
} from "./utils";

export interface IDmvicClient {
  login(): Promise<void>;
  getCertificate(certificateNumber: string): Promise<CertificateResponse>;
  cancelCertificate(
    certificateNumber: string,
    reasonID: number,
  ): Promise<CancellationResponse>;
  validateInsurance(
    req: InsuranceValidationRequest,
  ): Promise<InsuranceValidationResponse>;
  validateDoubleInsurance(
    req: DoubleInsuranceRequest,
  ): Promise<DoubleInsuranceResponse>;
  issueTypeACertificate(req: TypeAIssuanceRequest): Promise<InsuranceResponse>;
  issueTypeBCertificate(req: TypeBIssuanceRequest): Promise<InsuranceResponse>;
  issueTypeCCertificate(req: TypeCIssuanceRequest): Promise<InsuranceResponse>;
  issueTypeDCertificate(req: TypeDIssuanceRequest): Promise<InsuranceResponse>;
  confirmCertificateIssuance(
    req: ConfirmationRequest,
  ): Promise<InsuranceResponse>;
  getMemberCompanyStock(memberCompanyID: number): Promise<StockResponse>;
  getToken(): string;
  isTokenValid(): boolean;
}

export class DmvicClient implements IDmvicClient {
  private config: DmvicConfig;
  private tokenCache: TTLCache<string, string>;
  private baseURL: string;
  private httpsAgent?: HttpsAgent;

  constructor(config: DmvicConfig) {
    this.config = {
      ...config,
      timeout: config.timeout ?? DEFAULT_TIMEOUT,
    };

    this.baseURL =
      config.baseURL ??
      (config.environment === "production"
        ? ENDPOINTS.production
        : ENDPOINTS.uat);

    this.tokenCache = new TTLCache<string, string>(DEFAULT_TOKEN_TTL);

    if (config.certificates) {
      this.setupX509Certificates();
    }
  }

  /**
   * Setup X.509 certificate authentication
   */
  private setupX509Certificates(): void {
    try {
      if (!this.config.certificates) {
        throw DmvicError.invalidConfig(
          "Certificates configuration is required",
        );
      }

      const { certPath, keyPath, caPath } = this.config.certificates;

      const cert = readFileSync(certPath, "utf8");
      const key = readFileSync(keyPath, "utf8");

      const agentOptions: https.AgentOptions = {
        cert,
        key,
        rejectUnauthorized: !this.config.insecureSkipVerify,
      };

      if (caPath) {
        agentOptions.ca = readFileSync(caPath, "utf8");
      }

      this.httpsAgent = new HttpsAgent(agentOptions);

      if (this.config.debug) {
        console.log("[DMVIC] X.509 certificates loaded successfully");
      }
    } catch (error) {
      if (error instanceof DmvicError) {
        throw error;
      }
      throw DmvicError.invalidConfig(
        `Failed to load X.509 certificates: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Parse DMVIC API error messages to standardized error codes
   */
  private parseDmvicError(errorMsg: string): string {
    switch (errorMsg) {
      case "Input json format is Incorrect":
        return DMVIC_ERROR_CODES.INVALID_JSON;
      case "Unknown Error":
        return DMVIC_ERROR_CODES.UNKNOWN_ERROR;
      case "Mandatory field is missing":
        return DMVIC_ERROR_CODES.MANDATORY_FIELD;
      case "Input not valid":
        return DMVIC_ERROR_CODES.INVALID_INPUT;
      case "Double Insurance":
        return DMVIC_ERROR_CODES.DOUBLE_INSURANCE;
      case "No sufficient Inventory":
        return DMVIC_ERROR_CODES.INSUFFICIENT_STOCK;
      case "Data Validation Error":
        return DMVIC_ERROR_CODES.DATA_VALIDATION;
      default:
        if (errorMsg.length >= 5 && errorMsg.startsWith("ER")) {
          return errorMsg.substring(0, 5);
        }
        return "";
    }
  }

  /**
   * Debug logging utility
   */
  private debugLog(message: string, ...args: unknown[]): void {
    if (this.config.debug) {
      console.log(`[DMVIC DEBUG] ${message}`, ...args);
    }
  }

  /**
   * Makes HTTP/HTTPS requests with optional X.509 certificate support
   */
  private async makeRequest<T>(
    endpoint: string,
    options: {
      method?: "GET" | "POST" | "PUT" | "DELETE";
      body?: unknown;
      params?: Record<string, string | number>;
      headers?: Record<string, string>;
      requiresAuth?: boolean;
    } = {},
  ): Promise<T> {
    const {
      method = "GET",
      body,
      params,
      requiresAuth = false,
    } = options;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": "dmvic-ts/1.0.0",
      ClientID: this.config.clientId,
      ...(options.headers || {}),
    };

    if (requiresAuth) {
      const token = await this.ensureValidToken();
      headers["Authorization"] = `Bearer ${token}`;
    }

    const url = new URL(`${this.baseURL}${endpoint}`);
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        url.searchParams.append(k, String(v));
      }
    }

    this.debugLog(`Making ${method} request to: ${url.toString()}`);
    if (body) {
      this.debugLog("Request body:", JSON.stringify(body, null, 2));
    }

    return new Promise<T>((resolve, reject) => {
      const isHttps = url.protocol === "https:";
      const protocol = isHttps ? https : http;

      const requestOptions: http.RequestOptions = {
        method,
        headers,
        timeout: this.config.timeout,
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
      };

      if (isHttps && this.httpsAgent) {
        requestOptions.agent = this.httpsAgent;
      }

      const req = protocol.request(requestOptions, (res) => {
        let responseData = "";
        res.on("data", (chunk: Buffer) => {
          responseData += chunk.toString();
        });
        res.on("end", () => {
          this.debugLog("Response status:", res.statusCode);

          if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
            this.debugLog("Error response body:", responseData);
            if (res.statusCode === 403) {
              reject(DmvicError.apiError(responseData, res.statusCode));
            } else {
              reject(
                DmvicError.networkError(
                  `HTTP error! status: ${res.statusCode}, response: ${responseData}`,
                ),
              );
            }
            return;
          }

          try {
            const data = responseData ? (JSON.parse(responseData) as T) : ({} as T);
            this.debugLog("Response received:", data);
            resolve(data);
          } catch (parseErr) {
            reject(
              DmvicError.networkError(
                `Failed to parse response: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`,
              ),
            );
          }
        });
      });

      req.on("error", (error: Error) => {
        this.debugLog("Request error:", error);
        reject(
          DmvicError.networkError(
            `Request failed: ${error.message}`,
          ),
        );
      });

      req.on("timeout", () => {
        req.destroy();
        reject(
          DmvicError.networkError(
            `Request timeout after ${this.config.timeout}ms`,
          ),
        );
      });

      if (body) {
        req.write(typeof body === "string" ? body : JSON.stringify(body));
      }

      req.end();
    });
  }

  private async ensureValidToken(): Promise<string> {
    const cached = this.tokenCache.get("dmvictoken");
    if (cached) {
      this.debugLog("Using cached token");
      return cached;
    }

    this.debugLog("Token not found or expired, refreshing...");
    await this.login();
    const token = this.tokenCache.get("dmvictoken");
    if (!token) {
      throw DmvicError.authenticationError("Failed to obtain valid token");
    }

    return token;
  }

  async login(): Promise<void> {
    try {
      this.debugLog(
        "Performing login for:",
        this.config.credentials.username,
      );
      const response = await this.makeRequest<LoginResponse>(
        API_ENDPOINTS.LOGIN,
        {
          method: "POST",
          body: {
            username: this.config.credentials.username,
            password: this.config.credentials.password,
          },
          requiresAuth: false,
        },
      );

      if (!response.token) {
        throw DmvicError.authenticationError("No token in login response");
      }

      const duration = this.calculateTokenDuration(response.expires);
      this.tokenCache.set("dmvictoken", response.token, duration);

      this.debugLog("Login successful, token expires in:", duration);
    } catch (error) {
      if (error instanceof DmvicError) {
        throw error;
      }
      throw DmvicError.authenticationError(
        `Login failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Calculate token duration to expiry
   */
  private calculateTokenDuration(expiresString: string): number {
    try {
      const expiresDate = new Date(expiresString);
      const now = new Date();
      const duration = expiresDate.getTime() - now.getTime();
      return Math.max(duration, 0);
    } catch {
      this.debugLog("Error calculating token duration, using default TTL");
      return DEFAULT_TOKEN_TTL;
    }
  }

  async getCertificate(
    certificateNumber: string,
  ): Promise<CertificateResponse> {
    if (!certificateNumber?.trim()) {
      throw DmvicError.invalidInput("Certificate number is required");
    }

    // Use POST with request body to match Go implementation
    const response = await this.makeRequest<CertificateResponse>(
      API_ENDPOINTS.GET_CERTIFICATE,
      {
        method: "POST",
        body: { CertificateNumber: certificateNumber },
        requiresAuth: true,
      },
    );

    // Handle DMVIC API errors
    if (!response.success && response.error && response.error.length > 0) {
      const dmvicCode = this.parseDmvicError(response.error[0]!.errorText || "");
      throw DmvicError.apiError(
        response.error[0]!.errorText || "Certificate retrieval failed",
        ERROR_CODES.GET_CERTIFICATE,
        {
          dmvicErrorCode: response.error[0]!.errorCode || dmvicCode,
          originalError: response.error[0]!,
        },
      );
    }

    return response;
  }

  async cancelCertificate(
    certificateNumber: string,
    reasonID: number,
  ): Promise<CancellationResponse> {
    if (!certificateNumber?.trim()) {
      throw DmvicError.invalidInput("Certificate number is required");
    }
    if (!Number.isInteger(reasonID) || reasonID < 1) {
      throw DmvicError.invalidInput("Reason ID must be a positive integer");
    }

    const response = await this.makeRequest<CancellationResponse>(
      API_ENDPOINTS.CANCEL_CERTIFICATE,
      {
        method: "POST",
        body: {
          CertificateNumber: certificateNumber,
          cancelreasonid: reasonID,
        },
        requiresAuth: true,
      },
    );

    // Handle DMVIC API errors
    if (!response.success && response.error && response.error.length > 0) {
      const dmvicCode = this.parseDmvicError(response.error[0]!.errorText || "");
      throw DmvicError.apiError(
        response.error[0]!.errorText || "Certificate cancellation failed",
        ERROR_CODES.CANCEL_CERTIFICATE,
        {
          dmvicErrorCode: response.error[0]!.errorCode || dmvicCode,
          originalError: response.error[0]!,
        },
      );
    }

    return response;
  }

  async validateInsurance(
    req: InsuranceValidationRequest,
  ): Promise<InsuranceValidationResponse> {
    if (!req.vehicleRegistrationnumber?.trim()) {
      throw DmvicError.invalidInput("Vehicle registration number is required");
    }

    const response = await this.makeRequest<InsuranceValidationResponse>(
      API_ENDPOINTS.VALIDATE_INSURANCE,
      {
        method: "POST",
        body: req,
        requiresAuth: true,
      },
    );

    // Handle DMVIC API errors
    if (!response.success && response.error && response.error.length > 0) {
      const dmvicCode = this.parseDmvicError(response.error[0]!.errorText || "");
      throw DmvicError.apiError(
        response.error[0]!.errorText || "Insurance validation failed",
        ERROR_CODES.VALIDATE_INSURANCE,
        {
          dmvicErrorCode: response.error[0]!.errorCode || dmvicCode,
          originalError: response.error[0]!,
        },
      );
    }

    return response;
  }

  async validateDoubleInsurance(
    req: DoubleInsuranceRequest,
  ): Promise<DoubleInsuranceResponse> {
    if (!req.vehicleregistrationnumber?.trim()) {
      throw DmvicError.invalidInput("Vehicle registration number is required");
    }

    const response = await this.makeRequest<DoubleInsuranceResponse>(
      API_ENDPOINTS.VALIDATE_DOUBLE_INSURANCE,
      {
        method: "POST",
        body: req,
        requiresAuth: true,
      },
    );

    // Handle DMVIC API errors
    if (!response.success && response.error && response.error.length > 0) {
      const dmvicCode = this.parseDmvicError(response.error[0]!.errorText || "");
      throw DmvicError.apiError(
        response.error[0]!.errorText || "Double insurance validation failed",
        ERROR_CODES.VALIDATE_DOUBLE_INSURANCE,
        {
          dmvicErrorCode: response.error[0]!.errorCode || dmvicCode,
          originalError: response.error[0]!,
        },
      );
    }

    return response;
  }

  async issueTypeACertificate(
    req: TypeAIssuanceRequest,
  ): Promise<InsuranceResponse> {
    validateTypeARequest(req);

    const response = await this.makeRequest<InsuranceResponse>(
      API_ENDPOINTS.ISSUANCE_TYPE_A,
      {
        method: "POST",
        body: req,
        requiresAuth: true,
      },
    );

    // Handle DMVIC API errors - note: InsuranceResponse uses uppercase Error
    if (!response.success && response.Error && response.Error.length > 0) {
      const dmvicCode = this.parseDmvicError(response.Error[0]!.errorText || "");
      throw DmvicError.apiError(
        response.Error[0]!.errorText || "Type A certificate issuance failed",
        ERROR_CODES.ISSUANCE_TYPE_A,
        {
          dmvicErrorCode: response.Error[0]!.errorCode || dmvicCode,
          originalError: response.Error[0]!,
        },
      );
    }

    return response;
  }

  async issueTypeBCertificate(
    req: TypeBIssuanceRequest,
  ): Promise<InsuranceResponse> {
    validateTypeBRequest(req);

    const response = await this.makeRequest<InsuranceResponse>(
      API_ENDPOINTS.ISSUANCE_TYPE_B,
      {
        method: "POST",
        body: req,
        requiresAuth: true,
      },
    );

    // Handle DMVIC API errors - note: InsuranceResponse uses uppercase Error
    if (!response.success && response.Error && response.Error.length > 0) {
      const dmvicCode = this.parseDmvicError(response.Error[0]!.errorText || "");
      throw DmvicError.apiError(
        response.Error[0]!.errorText || "Type B certificate issuance failed",
        ERROR_CODES.ISSUANCE_TYPE_B,
        {
          dmvicErrorCode: response.Error[0]!.errorCode || dmvicCode,
          originalError: response.Error[0]!,
        },
      );
    }

    return response;
  }

  async issueTypeCCertificate(
    req: TypeCIssuanceRequest,
  ): Promise<InsuranceResponse> {
    validateTypeCRequest(req);

    const response = await this.makeRequest<InsuranceResponse>(
      API_ENDPOINTS.ISSUANCE_TYPE_C,
      {
        method: "POST",
        body: req,
        requiresAuth: true,
      },
    );

    // Handle DMVIC API errors - note: InsuranceResponse uses uppercase Error
    if (!response.success && response.Error && response.Error.length > 0) {
      const dmvicCode = this.parseDmvicError(response.Error[0]!.errorText || "");
      throw DmvicError.apiError(
        response.Error[0]!.errorText || "Type C certificate issuance failed",
        ERROR_CODES.ISSUANCE_TYPE_C,
        {
          dmvicErrorCode: response.Error[0]!.errorCode || dmvicCode,
          originalError: response.Error[0]!,
        },
      );
    }

    return response;
  }

  async issueTypeDCertificate(
    req: TypeDIssuanceRequest,
  ): Promise<InsuranceResponse> {
    validateTypeDRequest(req);

    const response = await this.makeRequest<InsuranceResponse>(
      API_ENDPOINTS.ISSUANCE_TYPE_D,
      {
        method: "POST",
        body: req,
        requiresAuth: true,
      },
    );

    // Handle DMVIC API errors - note: InsuranceResponse uses uppercase Error
    if (!response.success && response.Error && response.Error.length > 0) {
      const dmvicCode = this.parseDmvicError(response.Error[0]!.errorText || "");
      throw DmvicError.apiError(
        response.Error[0]!.errorText || "Type D certificate issuance failed",
        ERROR_CODES.ISSUANCE_TYPE_D,
        {
          dmvicErrorCode: response.Error[0]!.errorCode || dmvicCode,
          originalError: response.Error[0]!,
        },
      );
    }

    return response;
  }

  async confirmCertificateIssuance(
    req: ConfirmationRequest,
  ): Promise<InsuranceResponse> {
    if (!req.IssuanceRequestID?.trim()) {
      throw DmvicError.invalidInput(
        "Issuance request ID is required for confirmation",
      );
    }
    if (!req.UserName?.trim()) {
      throw DmvicError.invalidInput(
        "User name is required for confirmation",
      );
    }

    const response = await this.makeRequest<InsuranceResponse>(
      API_ENDPOINTS.CONFIRM_CERTIFICATE_ISSUANCE,
      {
        method: "POST",
        body: req,
        requiresAuth: true,
      },
    );

    // Handle DMVIC API errors - note: InsuranceResponse uses uppercase Error
    if (!response.success && response.Error && response.Error.length > 0) {
      const dmvicCode = this.parseDmvicError(response.Error[0]!.errorText || "");
      throw DmvicError.apiError(
        response.Error[0]!.errorText || "Certificate confirmation failed",
        ERROR_CODES.CONFIRM_ISSUANCE,
        {
          dmvicErrorCode: response.Error[0]!.errorCode || dmvicCode,
          originalError: response.Error[0]!,
        },
      );
    }

    return response;
  }

  async getMemberCompanyStock(memberCompanyID: number): Promise<StockResponse> {
    if (!Number.isInteger(memberCompanyID) || memberCompanyID < 1) {
      throw DmvicError.invalidInput(
        "Member company ID must be a positive integer",
      );
    }

    const response = await this.makeRequest<StockResponse>(
      API_ENDPOINTS.MEMBER_COMPANY_STOCK,
      {
        method: "POST",
        body: { MemberCompanyId: memberCompanyID },
        requiresAuth: true,
      },
    );

    // Handle DMVIC API errors
    if (!response.success && response.error && response.error.length > 0) {
      const dmvicCode = this.parseDmvicError(response.error[0]!.errorText || "");
      throw DmvicError.apiError(
        response.error[0]!.errorText || "Member company stock retrieval failed",
        ERROR_CODES.MEMBER_COMPANY_STOCK,
        {
          dmvicErrorCode: response.error[0]!.errorCode || dmvicCode,
          originalError: response.error[0]!,
        },
      );
    }

    return response;
  }

  /**
   * Get current authentication token
   */
  getToken(): string {
    const token = this.tokenCache.get("dmvictoken");
    if (!token) {
      this.debugLog("Error getting token from storage");
      return "";
    }
    return token;
  }

  /**
   * Check if current token is valid and not expired
   */
  isTokenValid(): boolean {
    return this.tokenCache.has("dmvictoken");
  }
}

