# API Documentation - HR Attendance System

## Base URL
```
http://localhost:3000/api
```

## Authentication
Currently no authentication required (Super Admin context assumed). Phase 2 will include authentication.

## Response Format

All responses are JSON with the following structure:

### Success Response (200, 201)
```json
{
  "id": "cuid123...",
  "employeeId": "HQ-001",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "branch": "HQ",
  "role": "HUMAN_RESOURCES",
  "accessStatus": "AUTHORIZED",
  "biometricTemplate": "encrypted_template_...",
  "registeredAt": "2026-02-28T10:30:00Z",
  "updatedAt": "2026-02-28T10:30:00Z"
}
```

### Error Response (4xx, 5xx)
```json
{
  "error": "Descriptive error message"
}
```

---

## 📌 Endpoints

### 1. GET /employees
**Fetch all employees with advanced filtering**

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| search | string | No | Search by name, email, or employee ID (case-insensitive) |
| branch | string | No | Filter by branch: HQ, BR, BR2, BR3 |
| role | string | No | Filter by role (see Role Values below) |
| accessStatus | string | No | Filter by status: AUTHORIZED, UNAUTHORIZED |

#### Role Values
```
HUMAN_RESOURCES
FINANCE
REGIONAL_MANAGER
OPTIMISATION_DEPARTMENT
MARKETING
HQ_OPERATION
CEO
SUPER_ADMIN
ACADEMY
INDUSTRIAL_PSYCHOLOGY
EMPLOYEE (default)
```

#### Examples
```bash
# Get all employees
GET /employees

# Search for "john"
GET /employees?search=john

# Get all HQ employees
GET /employees?branch=HQ

# Get all authorized employees in Finance
GET /employees?branch=HQ&role=FINANCE&accessStatus=AUTHORIZED

# Get all unauthorized employees
GET /employees?accessStatus=UNAUTHORIZED
```

#### Response
```json
[
  {
    "id": "cuid...",
    "employeeId": "HQ-001",
    "firstName": "John",
    ...
  },
  {
    "id": "cuid...",
    "employeeId": "HQ-002",
    "firstName": "Jane",
    ...
  }
]
```

#### Status Codes
- `200 OK` - Success
- `500 Internal Server Error` - Server error

---

### 2. POST /employees
**Create a new employee and auto-generate unique ID**

#### Request Body
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@company.com",
  "phone": "+1-234-567-8900",
  "branch": "HQ",
  "role": "HUMAN_RESOURCES",
  "biometricTemplate": "optional_template_data"
}
```

#### Field Descriptions
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| firstName | string | Yes | Non-empty |
| lastName | string | Yes | Non-empty |
| email | string | Yes | Valid email format, unique |
| phone | string | Yes | Unique, min 10 chars |
| branch | string | Yes | HQ, BR, BR2, or BR3 |
| role | string | No | See Role Values (defaults to EMPLOYEE) |
| biometricTemplate | string | No | Fingerprint data, will be encrypted |

#### Response (201 Created)
```json
{
  "id": "cuid123...",
  "employeeId": "HQ-001",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@company.com",
  "phone": "+1-234-567-8900",
  "branch": "HQ",
  "role": "HUMAN_RESOURCES",
  "accessStatus": "UNAUTHORIZED",
  "biometricTemplate": "encrypted_...",
  "registeredAt": "2026-02-28T10:30:00Z",
  "updatedAt": "2026-02-28T10:30:00Z"
}
```

#### Status Codes
- `201 Created` - Employee created successfully
- `400 Bad Request` - Invalid input or duplicate email/phone
- `500 Internal Server Error` - Server error

#### Error Examples
```json
{"error": "Email already registered"}
{"error": "Phone number already registered"}
{"error": "Missing required fields"}
```

---

### 3. GET /employees/[id]
**Fetch a specific employee by ID**

#### Path Parameter
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Employee CUID (not Employee ID like HQ-001) |

#### Example
```bash
GET /employees/cuid123abc...
```

#### Response
```json
{
  "id": "cuid123...",
  "employeeId": "HQ-001",
  ...
}
```

#### Status Codes
- `200 OK` - Success
- `404 Not Found` - Employee not found
- `500 Internal Server Error` - Server error

---

### 4. PUT /employees/[id]
**Update employee details**

#### Path Parameter
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Employee CUID |

#### Request Body (All Optional)
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "email": "john.smith@company.com",
  "phone": "+1-234-567-8901",
  "role": "FINANCE",
  "biometricTemplate": "new_template_data"
}
```

#### Response
```json
{
  "id": "cuid123...",
  "employeeId": "HQ-001",
  "firstName": "John",
  "lastName": "Smith",
  "email": "john.smith@company.com",
  "phone": "+1-234-567-8901",
  "role": "FINANCE",
  ...
}
```

#### Status Codes
- `200 OK` - Updated successfully
- `400 Bad Request` - Invalid data or duplicate email/phone
- `404 Not Found` - Employee not found
- `500 Internal Server Error` - Server error

---

### 5. DELETE /employees/[id]
**Delete an employee record**

#### Path Parameter
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Employee CUID |

#### Example
```bash
DELETE /employees/cuid123abc...
```

#### Response
```json
{
  "id": "cuid123...",
  "employeeId": "HQ-001",
  ...
}
```

#### Status Codes
- `200 OK` - Deleted successfully
- `404 Not Found` - Employee not found
- `500 Internal Server Error` - Server error

---

### 6. POST /employees/[id]/biometric
**Enroll or update biometric template**

#### Path Parameter
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Employee CUID |

#### Request Body
```json
{
  "biometricTemplate": "fingerprint_template_data"
}
```

#### Response
```json
{
  "message": "Biometric enrolled successfully",
  "employee": {
    "id": "cuid123...",
    "employeeId": "HQ-001",
    "biometricTemplate": "encrypted_template_...",
    ...
  }
}
```

#### Status Codes
- `200 OK` - Biometric enrolled
- `400 Bad Request` - Missing template
- `404 Not Found` - Employee not found
- `500 Internal Server Error` - Encryption error

#### Notes
- Template is automatically encrypted with AES-256-CBC
- Each enrollment generates a new encrypted template
- Raw fingerprint data is never stored

---

### 7. POST /employees/[id]/access
**Grant or revoke access authorization**

#### Path Parameter
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Employee CUID |

#### Request Body
```json
{
  "accessStatus": "AUTHORIZED"
}
```

#### Valid Status Values
- `AUTHORIZED` - Grant access
- `UNAUTHORIZED` - Revoke access

#### Response
```json
{
  "message": "Access authorized",
  "employee": {
    "id": "cuid123...",
    "employeeId": "HQ-001",
    "accessStatus": "AUTHORIZED",
    ...
  }
}
```

#### Status Codes
- `200 OK` - Access updated
- `400 Bad Request` - Invalid access status
- `404 Not Found` - Employee not found
- `500 Internal Server Error` - Server error

---

## 🔐 Data Security

### Biometric Encryption
- **Algorithm**: AES-256-CBC
- **Key Derivation**: SHA-256 hash of ENCRYPTION_KEY environment variable
- **IV**: Random 16-byte initialization vector (prepended to encrypted data)
- **Format**: `{iv_hex}:{encrypted_hex}`

### Data Validation
- Email: RFC 5322 basic validation + uniqueness check
- Phone: 10+ characters, accepts digits, spaces, hyphens, plus signs
- Names: Non-empty strings
- Required fields enforced at database level

---

## 🚀 Usage Examples

### Complete Employee Workflow

#### Step 1: Register Employee
```bash
curl -X POST http://localhost:3000/api/employees \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@company.com",
    "phone": "+1-234-567-8900",
    "branch": "HQ",
    "role": "HUMAN_RESOURCES"
  }'

# Response: Employee ID HQ-001 automatically generated
```

#### Step 2: Enroll Biometric
```bash
curl -X POST http://localhost:3000/api/employees/{id}/biometric \
  -H "Content-Type: application/json" \
  -d '{
    "biometricTemplate": "fingerprint_binary_data"
  }'
```

#### Step 3: Grant Access
```bash
curl -X POST http://localhost:3000/api/employees/{id}/access \
  -H "Content-Type: application/json" \
  -d '{
    "accessStatus": "AUTHORIZED"
  }'
```

#### Step 4: Verify Employee
```bash
curl http://localhost:3000/api/employees/{id}

# Response shows: accessStatus: AUTHORIZED, biometricTemplate: encrypted_...
```

---

## 📊 Rate Limiting
Currently no rate limiting. To be implemented in Phase 2.

## 🔄 API Versioning
Current version: v1 (included in base path)

## 📝 Logging
All operations are logged to console for debugging. Implement proper logging in production.

---

## 🛠️ Integration Notes

### For Frontend Development
- Use `/api/employees` endpoints for CRUD operations
- Always validate phone and email format on client side
- Handle 400/404/500 errors appropriately
- Display success messages for 201/200 responses

### For Third-Party Integration
- All endpoints are RESTful and stateless
- JSON request/response format
- Use employee CUID (not employeeId) for internal operations
- Employee ID (HQ-001 format) is for display/reporting only

### Future Enhancements
- JWT authentication tokens
- OAuth 2.0 support
- API key management
- Rate limiting
- Request logging and auditing
- Webhook notifications
- Batch operations

---

**API Version**: 1.0.0
**Last Updated**: February 28, 2026
