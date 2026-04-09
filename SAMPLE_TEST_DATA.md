# Sample Test Data - HR Attendance System

## 📋 Pre-Populated Sample Employees

Use these examples to quickly test the system. Copy and paste into your requests or use the form.

---

## 🏢 Headquarters (HQ) Department

### HQ-001: HR Manager
```json
{
  "firstName": "Sarah",
  "lastName": "Johnson",
  "email": "sarah.johnson@company.com",
  "phone": "+1-555-001-0001",
  "branch": "HQ",
  "role": "HUMAN_RESOURCES"
}
```
**Expected ID**: HQ-001
**Use Case**: Test HR role registration

### HQ-002: Finance Director
```json
{
  "firstName": "Michael",
  "lastName": "Chen",
  "email": "michael.chen@company.com",
  "phone": "+1-555-001-0002",
  "branch": "HQ",
  "role": "FINANCE"
}
```
**Expected ID**: HQ-002
**Use Case**: Test Finance role

### HQ-003: CEO
```json
{
  "firstName": "Emily",
  "lastName": "Richardson",
  "email": "emily.richardson@company.com",
  "phone": "+1-555-001-0003",
  "branch": "HQ",
  "role": "CEO"
}
```
**Expected ID**: HQ-003
**Use Case**: Test CEO role

### HQ-004: Super Admin
```json
{
  "firstName": "David",
  "lastName": "Martinez",
  "email": "david.martinez@company.com",
  "phone": "+1-555-001-0004",
  "branch": "HQ",
  "role": "SUPER_ADMIN"
}
```
**Expected ID**: HQ-004
**Use Case**: Test Super Admin role

### HQ-005: Marketing Manager
```json
{
  "firstName": "Jessica",
  "lastName": "Taylor",
  "email": "jessica.taylor@company.com",
  "phone": "+1-555-001-0005",
  "branch": "HQ",
  "role": "MARKETING"
}
```
**Expected ID**: HQ-005
**Use Case**: Test Marketing role

---

## 🏪 Branch 1 (BR) Team

### BR-001: Regional Manager
```json
{
  "firstName": "Robert",
  "lastName": "Williams",
  "email": "robert.williams@company.com",
  "phone": "+1-555-002-0001",
  "branch": "BR",
  "role": "REGIONAL_MANAGER"
}
```
**Expected ID**: BR-001
**Use Case**: Test branch assignment and Regional Manager role

### BR-002: Operations Manager
```json
{
  "firstName": "Linda",
  "lastName": "Anderson",
  "email": "linda.anderson@company.com",
  "phone": "+1-555-002-0002",
  "branch": "BR",
  "role": "HQ_OPERATION"
}
```
**Expected ID**: BR-002
**Use Case**: Test HQ Operation role

### BR-003: Optimization Specialist
```json
{
  "firstName": "Christopher",
  "lastName": "Lee",
  "email": "christopher.lee@company.com",
  "phone": "+1-555-002-0003",
  "branch": "BR",
  "role": "OPTIMISATION_DEPARTMENT"
}
```
**Expected ID**: BR-003
**Use Case**: Test Optimization Department role

---

## 🏢 Branch 2 (BR2) Team

### BR2-001: HR Specialist
```json
{
  "firstName": "Amanda",
  "lastName": "Brown",
  "email": "amanda.brown@company.com",
  "phone": "+1-555-003-0001",
  "branch": "BR2",
  "role": "HUMAN_RESOURCES"
}
```
**Expected ID**: BR2-001
**Use Case**: Test second branch numbering

### BR2-002: Training Coordinator
```json
{
  "firstName": "Kevin",
  "lastName": "Davis",
  "email": "kevin.davis@company.com",
  "phone": "+1-555-003-0002",
  "branch": "BR2",
  "role": "ACADEMY"
}
```
**Expected ID**: BR2-002
**Use Case**: Test Academy role

### BR2-003: Wellness Officer
```json
{
  "firstName": "Nicole",
  "lastName": "Garcia",
  "email": "nicole.garcia@company.com",
  "phone": "+1-555-003-0003",
  "branch": "BR2",
  "role": "INDUSTRIAL_PSYCHOLOGY"
}
```
**Expected ID**: BR2-003
**Use Case**: Test Industrial Psychology role

---

## 🏢 Branch 3 (BR3) Team

### BR3-001: Operations Staff
```json
{
  "firstName": "James",
  "lastName": "Wilson",
  "email": "james.wilson@company.com",
  "phone": "+1-555-004-0001",
  "branch": "BR3",
  "role": "EMPLOYEE"
}
```
**Expected ID**: BR3-001
**Use Case**: Test third branch and default EMPLOYEE role

---

## 🧪 Testing Scenarios

### Scenario 1: Complete Employee Onboarding
1. Register **Sarah Johnson** (HQ-001) - HUMAN_RESOURCES
2. Enroll biometric for Sarah
3. Grant access to Sarah
4. Verify in dashboard: ✓ Enrolled, Status: AUTHORIZED

### Scenario 2: Multi-Branch Testing
1. Register **Robert Williams** (BR-001) - REGIONAL_MANAGER
2. Register **Amanda Brown** (BR2-001) - HUMAN_RESOURCES
3. Register **James Wilson** (BR3-001) - EMPLOYEE
4. Use branch filter to verify each appears in correct branch view

### Scenario 3: Role-Based Filtering
1. Register all HQ employees (001-005)
2. Filter by role: HUMAN_RESOURCES
3. Should show: Sarah Johnson (HQ-001), Amanda Brown (BR2-001)
4. Filter by role: FINANCE
5. Should show: Michael Chen (HQ-002) only

### Scenario 4: Access Control Testing
1. Register **Michael Chen** (HQ-002) - FINANCE
2. Verify access status is UNAUTHORIZED
3. Click "Grant" button
4. Verify access status changes to AUTHORIZED
5. Click "Revoke" button
6. Verify access status changes back to UNAUTHORIZED

### Scenario 5: Search Functionality
Test these searches:
- Search: "sarah" → Should find Sarah Johnson
- Search: "finance" → Should find nothing (finance is role, not searchable in full-text)
- Search: "Michael" → Should find Michael Chen
- Search: "@company.com" → Should find all employees (email search)
- Search: "555-001" → Should find HQ employees (phone search)

### Scenario 6: Duplicate Prevention
1. Try to register with email: sarah.johnson@company.com
2. Should get error: "Email already registered"
3. Try to register with phone: +1-555-001-0001
4. Should get error: "Phone number already registered"

---

## 📊 Test Data Summary Table

| Employee | ID | Branch | Role | Email | Phone |
|----------|----|----|------|-------|-------|
| Sarah Johnson | HQ-001 | HQ | Human Resources | sarah.johnson@company.com | +1-555-001-0001 |
| Michael Chen | HQ-002 | HQ | Finance | michael.chen@company.com | +1-555-001-0002 |
| Emily Richardson | HQ-003 | HQ | CEO | emily.richardson@company.com | +1-555-001-0003 |
| David Martinez | HQ-004 | HQ | Super Admin | david.martinez@company.com | +1-555-001-0004 |
| Jessica Taylor | HQ-005 | HQ | Marketing | jessica.taylor@company.com | +1-555-001-0005 |
| Robert Williams | BR-001 | BR | Regional Manager | robert.williams@company.com | +1-555-002-0001 |
| Linda Anderson | BR-002 | BR | HQ Operation | linda.anderson@company.com | +1-555-002-0002 |
| Christopher Lee | BR-003 | BR | Optimisation Dept | christopher.lee@company.com | +1-555-002-0003 |
| Amanda Brown | BR2-001 | BR2 | Human Resources | amanda.brown@company.com | +1-555-003-0001 |
| Kevin Davis | BR2-002 | BR2 | Academy | kevin.davis@company.com | +1-555-003-0002 |
| Nicole Garcia | BR2-003 | BR2 | Industrial Psychology | nicole.garcia@company.com | +1-555-003-0003 |
| James Wilson | BR3-001 | BR3 | Employee | james.wilson@company.com | +1-555-004-0001 |

---

## 🧑‍💼 Role Coverage

Test data includes examples of all 10 roles:

| Role | Example Employee | Branch |
|------|------------------|--------|
| ✅ Human Resources | Sarah Johnson | HQ |
| ✅ Finance | Michael Chen | HQ |
| ✅ Regional Manager | Robert Williams | BR |
| ✅ Optimisation Department | Christopher Lee | BR |
| ✅ Marketing | Jessica Taylor | HQ |
| ✅ HQ Operation | Linda Anderson | BR |
| ✅ CEO | Emily Richardson | HQ |
| ✅ Super Admin | David Martinez | HQ |
| ✅ Academy | Kevin Davis | BR2 |
| ✅ Industrial Psychology | Nicole Garcia | BR2 |

---

## 🔍 Expected Query Results

### Query: Filter by Branch = "HQ"
```
Expected Results (5 employees):
- HQ-001: Sarah Johnson
- HQ-002: Michael Chen
- HQ-003: Emily Richardson
- HQ-004: David Martinez
- HQ-005: Jessica Taylor
```

### Query: Filter by Role = "HUMAN_RESOURCES"
```
Expected Results (2 employees):
- HQ-001: Sarah Johnson (HQ)
- BR2-001: Amanda Brown (BR2)
```

### Query: Filter by Role = "REGIONAL_MANAGER"
```
Expected Results (1 employee):
- BR-001: Robert Williams (BR)
```

### Query: Search = "lee"
```
Expected Results (1 employee):
- BR-003: Christopher Lee
(Partial name match in search)
```

### Query: Branch = "BR2" AND Role = "ACADEMY"
```
Expected Results (1 employee):
- BR2-002: Kevin Davis
```

---

## 💾 ID Generation Verification

Expected IDs when registering in order:

```
Branch HQ:   HQ-001, HQ-002, HQ-003, HQ-004, HQ-005
Branch BR:   BR-001, BR-002, BR-003
Branch BR2:  BR2-001, BR2-002, BR2-003
Branch BR3:  BR3-001
```

Each branch maintains independent counters.

---

## 🧬 Biometric Testing

For all test employees, you can enroll biometric:

1. Click "Biometric" button
2. Modal appears with fingerprint scanning simulation
3. Click "Start Enrollment"
4. Wait 2 seconds for scan to complete
5. Status changes to "✓ Enrolled"

Test template in code simulates random binary data (64 bytes hex).

---

## ✈️ Quick Setup with Test Data

```bash
# 1. Start the application
npm run dev

# 2. Register all test employees using the form
# (Or refer to QUICK_START.md for instructions)

# 3. Run test scenarios from "Testing Scenarios" section

# 4. Verify all filters work correctly

# 5. System is ready for production deployment
```

---

**Test Data Version**: 1.0
**Last Updated**: February 28, 2026
**Total Test Employees**: 12 across 4 branches
**All 10 Roles Covered**: Yes ✅
