# dmvic-ts

TypeScript client for the **DMVIC** (Digital Motor Vehicle Insurance Certificate) API — issue, validate, cancel, and manage motor vehicle insurance certificates in Kenya.

[![npm version](https://img.shields.io/npm/v/dmvic-ts.svg)](https://www.npmjs.com/package/dmvic-ts)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

## Features

- Full DMVIC API coverage (V4 endpoints)
- X.509 mutual-TLS certificate authentication
- Automatic token caching with TTL
- Input validation for all issuance types (A, B, C, D)
- Typed request/response interfaces
- Built-in error handling with structured error codes
- Zero runtime dependencies — uses only Node.js built-ins

## Installation

```bash
npm install dmvic-ts
```

## Quick Start

```typescript
import { DmvicClient } from "dmvic-ts";

const client = new DmvicClient({
  environment: "production", // or 'development' / 'staging'
  credentials: {
    username: "your-username",
    password: "your-password",
  },
  clientId: "your-client-id",
  certificates: {
    certPath: "/path/to/client.crt",
    keyPath: "/path/to/client.key",
    caPath: "/path/to/ca.crt", // optional
  },
});

// Login (auto-caches the token)
await client.login();

// Validate insurance
const validation = await client.validateInsurance({
  vehicleRegistrationnumber: "KAA 001A",
  Chassisnumber: "CH123456",
  certificateNumber: "CERT-001",
});
```

## Configuration

```typescript
interface DmvicConfig {
  environment?: "development" | "staging" | "production";
  baseURL?: string; // override the default endpoint
  credentials: {
    username: string;
    password: string;
  };
  clientId: string;
  timeout?: number; // default: 30000 ms
  tokenTTL?: number; // default: 86400000 ms (24h)
  insecureSkipVerify?: boolean; // skip TLS verification (dev only)
  debug?: boolean; // enable debug logging
  certificates?: {
    certPath: string;
    keyPath: string;
    caPath?: string;
  };
}
```

## API Reference

### Authentication

```typescript
await client.login(); // authenticate and cache the token
client.isTokenValid(); // check if token is still valid
client.getToken(); // get the current token string
```

### Certificate Operations

```typescript
// Get certificate details
const cert = await client.getCertificate("CERT-001");

// Cancel a certificate
const result = await client.cancelCertificate("CERT-001", 8); // 8 = Insured Request
```

### Insurance Validation

```typescript
// Validate insurance
const result = await client.validateInsurance({
  vehicleRegistrationnumber: "KAA 001A",
  Chassisnumber: "CH123456",
  certificateNumber: "CERT-001",
});

// Check for double insurance
const doubleCheck = await client.validateDoubleInsurance({
  policystartdate: "01/01/2026",
  policyenddate: "01/01/2027",
  vehicleregistrationnumber: "KAA 001A",
  chassisnumber: "CH123456",
});
```

### Certificate Issuance

```typescript
import { ETypeOfCover, CERTIFICATE_TYPES, VEHICLE_TYPES } from "dmvic-ts";

// Type A — PSV / Taxi
const typeA = await client.issueTypeACertificate({
  MemberCompanyID: 1,
  TypeOfCertificate: CERTIFICATE_TYPES.TYPE_A_TAXI,
  Typeofcover: ETypeOfCover.ThirdParty,
  Policyholder: "John Doe",
  policynumber: "POL-001",
  Commencingdate: "01/01/2026",
  Expiringdate: "01/01/2027",
  Chassisnumber: "CH123",
  Registrationnumber: "KAA 001A",
  Phonenumber: "0712345678",
  Bodytype: "Saloon",
  Email: "john@example.com",
  SumInsured: 0,
  InsuredPIN: "A123456789B",
  Licensedtocarry: 4,
});

// Type B — Commercial Vehicles
const typeB = await client.issueTypeBCertificate({
  MemberCompanyID: 1,
  VehicleType: VEHICLE_TYPES.OWN_GOODS,
  Typeofcover: ETypeOfCover.ThirdParty,
  Policyholder: "Jane Doe",
  policynumber: "POL-002",
  Commencingdate: "01/01/2026",
  Expiringdate: "01/01/2027",
  Chassisnumber: "CH456",
  Registrationnumber: "KAB 002B",
  Phonenumber: "0712345678",
  Bodytype: "Truck",
  Email: "jane@example.com",
  SumInsured: 0,
  InsuredPIN: "B987654321C",
  Tonnage: 5,
  Licensedtocarry: 2,
});

// Type C — Private Vehicles
const typeC = await client.issueTypeCCertificate({
  MemberCompanyID: 1,
  Typeofcover: ETypeOfCover.Comprehensive,
  Policyholder: "Alice",
  policynumber: "POL-003",
  Commencingdate: "01/01/2026",
  Expiringdate: "01/01/2027",
  Chassisnumber: "CH789",
  Registrationnumber: "KAC 003C",
  Phonenumber: "0712345678",
  Bodytype: "SUV",
  Email: "alice@example.com",
  SumInsured: 2000000,
  InsuredPIN: "C111222333D",
});

// Type D — Motorcycles
const typeD = await client.issueTypeDCertificate({
  MemberCompanyID: 1,
  TypeOfCertificate: CERTIFICATE_TYPES.TYPE_D_MOTORCYCLE,
  Typeofcover: ETypeOfCover.ThirdParty,
  Policyholder: "Bob",
  policynumber: "POL-004",
  Commencingdate: "01/01/2026",
  Expiringdate: "01/01/2027",
  Chassisnumber: "MC001",
  Registrationnumber: "KMCA 001",
  Phonenumber: "0712345678",
  Bodytype: "Motorcycle",
  Email: "bob@example.com",
  SumInsured: 0,
  InsuredPIN: "D444555666E",
  Licensedtocarry: 1,
  Tonnage: 0,
});
```

### Confirmation & Stock

```typescript
// Confirm certificate issuance
const confirmation = await client.confirmCertificateIssuance({
  IssuanceRequestID: "REQ-001",
  IsApproved: true,
  IsLogBookVerified: true,
  IsVehicleInspected: true,
  AdditionalComments: "",
  UserName: "admin",
});

// Get member company stock
const stock = await client.getMemberCompanyStock(1);
```

### Cancel Reasons

| ID  | Reason                         |
| --- | ------------------------------ |
| 8   | Insured person requested       |
| 12  | Amending no of passengers      |
| 13  | Change of scope of cover       |
| 14  | Policy not taken up            |
| 15  | Vehicle sold                   |
| 18  | Amending Insured's details     |
| 19  | Amending vehicle details       |
| 20  | Suspected Fraud                |
| 21  | Non-payment of premium         |
| 24  | Failure to provide KYCs        |
| 25  | Request by a government body   |
| 26  | Subject matter ceased to exist |
| 27  | Change period of insurance     |
| 28  | Cover declined by Insurer      |
| 29  | Motor vehicle was written off  |
| 30  | Motor vehicle was stolen       |

### Error Handling

All errors are instances of `DmvicError`:

```typescript
import { DmvicError } from "dmvic-ts";

try {
  await client.getCertificate("CERT-001");
} catch (error) {
  if (error instanceof DmvicError) {
    console.log(error.type); // 'InternalError' | 'ExternalError'
    console.log(error.code); // numeric error code
    console.log(error.message); // human-readable message
    console.log(error.details); // additional context
  }
}
```

### Factory Function

```typescript
import { createDmvicClient } from "dmvic-ts";

const client = createDmvicClient({
  credentials: { username: "user", password: "pass" },
  clientId: "client-id",
});
```

## Utility Functions

```typescript
import {
  getCancelReasonDescription,
  getCoverTypeDescription,
  getCertificateTypeDescription,
  getVehicleTypeDescription,
} from "dmvic-ts";

getCancelReasonDescription(8); // "Insured person requested cancellation"
getCoverTypeDescription(100); // "Comprehensive (COMP)"
getCertificateTypeDescription(4); // "Type D Motorcycle"
getVehicleTypeDescription(1); // "Own Goods"
```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build
npm run build

# Clean build output
npm run clean

# Generate API documentation (outputs to ./docs)
npm run docs
```

## API Documentation

Full API documentation is generated with [TypeDoc](https://typedoc.org/) and can be found in the `docs/` directory after running:

```bash
npm run docs
```

Open `docs/index.html` in your browser to browse the complete API reference with all types, interfaces, classes, and functions.

## License

[ISC](LICENSE)
