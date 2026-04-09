# HR Attendance System - Employee Management & Access Control

A comprehensive Next.js-based Human Resource Attendance System with Super Admin capabilities for managing employee onboarding, biometric credentials, and access control.

## 🎯 Key Features

### 1. **Dynamic Employee ID Generation**
- Automatic unique ID generation using Branch Code + Sequential Number format
- Examples: `HQ-001`, `BR-002`, `BR2-003`, `BR3-004`
- Supports multiple branches: HQ, BR (Branch 1), BR2 (Branch 2), BR3 (Branch 3)

### 2. **Super Admin Dashboard**
- Single-page comprehensive employee management interface
- Responsive design with Tailwind CSS
- Real-time employee table with advanced filtering and search

### 3. **Employee Management Features**

#### Employee Details
- First Name & Last Name
- Email (unique validation)
- Phone Number (unique validation)
- Branch Assignment
- Role Selection (10 roles available)
- Access Status (Authorized/Unauthorized)

#### Available Roles
1. Human Resources
2. Finance
3. Regional Manager
4. Optimisation Department
5. Marketing
6. HQ Operation
7. CEO
8. Super Admin
9. Academy
10. Industrial Psychology

### 4. **Biometric Enrollment**
- Dedicated biometric enrollment trigger
- Encrypted fingerprint template storage
- AES-256 encryption for secure storage
- Template-based authentication (not raw image storage)

### 5. **Access Control**
- Manual Grant/Revoke access toggle
- Default: Employees are "UNAUTHORIZED" until Super Admin enables login
- Real-time access status updates
- Visual indicators for access status

### 6. **Advanced Search & Filtering**
- Search by name, email, or employee ID
- Filter by branch
- Filter by role
- Filter by access status
- Combined filtering capabilities

## 🏗️ System Architecture

### Technology Stack
- **Frontend**: Next.js 16.1, React 19, TypeScript
- **Backend**: Next.js API Routes
- **Database**: SQLite with Prisma ORM
- **Styling**: Tailwind CSS 4
- **Encryption**: Node.js crypto module (AES-256-CBC)

### Project Structure

```
manpower-system/
├── app/
│   ├── api/
│   │   └── employees/
│   │       ├── route.ts              # POST/GET all employees
│   │       ├── [id]/
│   │       │   ├── route.ts          # GET/PUT/DELETE single employee
│   │       │   ├── biometric/
│   │       │   │   └── route.ts      # POST biometric enrollment
│   │       │   └── access/
│   │       │       └── route.ts      # POST access status toggle
│   │       └── route.ts
│   ├── components/
│   │   ├── RegistrationForm.tsx      # Employee registration form
│   │   ├── EmployeeTable.tsx         # Employee management table
│   │   └── BiometricEnrollment.tsx   # Biometric enrollment modal
│   ├── page.tsx                       # Main dashboard
│   ├── layout.tsx                     # Root layout
│   └── globals.css                    # Global styles
├── lib/
│   ├── prisma.ts                      # Prisma client configuration
│   ├── biometric.ts                   # Encryption utilities
│   ├── employee-helper.ts             # Employee logic & validation
│   └── constants.ts                   # Role & branch options
├── prisma/
│   ├── schema.prisma                  # Database schema
│   ├── dev.db                         # SQLite database
│   └── migrations/                    # Database migrations
├── .env.local                         # Environment variables
└── package.json                       # Dependencies

```

## 📋 Database Schema

### Employee Model
```
- id: String (UUID) - Primary key
- employeeId: String (unique) - Branch-based ID (e.g., HQ-001)
- firstName: String
- lastName: String
- email: String (unique)
- phone: String (unique)
- branch: String (HQ, BR, BR2, BR3)
- role: String (default: EMPLOYEE)
- accessStatus: String (AUTHORIZED, UNAUTHORIZED)
- biometricTemplate: String (encrypted)
- registeredAt: DateTime
- updatedAt: DateTime
```

### EmployeeIdSequence Model
```
- branch: String (primary key)
- sequence: Int (incremental counter per branch)
- updatedAt: DateTime
```

## 🔒 Security Features

### Biometric Data Protection
- **Encryption**: AES-256-CBC encryption for all biometric templates
- **Random IV**: Unique initialization vector for each encryption
- **Hashed Keys**: SHA-256 key derivation from environment key
- **No Raw Storage**: Only encrypted templates are stored in database

### Data Validation
- Email uniqueness validation
- Phone number uniqueness validation
- Phone format validation (10+ digits, supports various formats)
- Email format validation
- Required field validation

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Install Dependencies**
```bash
npm install
```

2. **Configure Environment**
Create `.env.local` file:
```env
DATABASE_URL="file:./prisma/dev.db"
ENCRYPTION_KEY="your-32-character-encryption-key"
```

3. **Initialize Database**
```bash
npx prisma db push
```

4. **Start Development Server**
```bash
npm run dev
```

5. **Open Application**
Navigate to `http://localhost:3000`

## 📖 API Routes

### Employees

#### GET `/api/employees`
Fetch all employees with optional filtering
**Query Parameters:**
- `search` - Search by name, email, or ID
- `branch` - Filter by branch
- `role` - Filter by role
- `accessStatus` - Filter by access status

**Example:**
```bash
GET /api/employees?branch=HQ&role=HUMAN_RESOURCES&accessStatus=AUTHORIZED
```

#### POST `/api/employees`
Create new employee
**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "0123456789",
  "branch": "HQ",
  "role": "HUMAN_RESOURCES",
  "biometricTemplate": "fingerprint_data_here"
}
```

#### GET `/api/employees/[id]`
Get specific employee details

#### PUT `/api/employees/[id]`
Update employee details

#### DELETE `/api/employees/[id]`
Delete employee record

#### POST `/api/employees/[id]/biometric`
Enroll biometric template
**Request Body:**
```json
{
  "biometricTemplate": "fingerprint_data_here"
}
```

#### POST `/api/employees/[id]/access`
Toggle access status
**Request Body:**
```json
{
  "accessStatus": "AUTHORIZED"
}
```

## 🎨 User Interface

### Dashboard Components

1. **Header**
   - System title and branding
   - Gradient background styling

2. **Navigation Tabs**
   - Employee Dashboard tab
   - Register New Employee tab

3. **Employee Dashboard View**
   - Advanced search bar
   - Branch filter dropdown
   - Role filter dropdown
   - Access status filter dropdown
   - Employee table with:
     - Employee ID
     - Full Name
     - Email & Phone
     - Branch & Role
     - Biometric Status
     - Access Status
     - Action buttons (Biometric, Grant/Revoke)
   - Summary statistics

4. **Registration Form**
   - Input fields for employee details
   - Dropdown selectors for branch and role
   - Form validation with error messages
   - Submit and cancel buttons

5. **Biometric Enrollment Modal**
   - Status indicators
   - Simulated fingerprint scanning
   - Success/Error feedback
   - Retry capability

## 🔄 Workflow

### Employee Registration
1. Super Admin navigates to "Register New Employee" tab
2. Fills out employee details form
3. System validates inputs (unique email/phone, required fields)
4. Auto-generates unique Employee ID based on selected branch
5. Employee record is created with "UNAUTHORIZED" access status
6. Super Admin can now enroll biometric

### Biometric Enrollment
1. Super Admin clicks "Biometric" button on employee row
2. Enrollment modal opens
3. Employee places finger on scanner (simulated in demo)
4. System captures and encrypts biometric template
5. Template is stored in database linked to employee record
6. Success confirmation is displayed

### Access Control
1. Super Admin sees employee in table
2. Employee has "UNAUTHORIZED" status by default
3. Super Admin clicks "Grant" button to authorize
4. Access status changes to "AUTHORIZED"
5. Super Admin can click "Revoke" to disable access

## 🧪 Testing the System

### Manual Testing Steps

1. **Register an Employee**
   - Go to "Register New Employee" tab
   - Fill in sample employee data:
     - Name: John Doe
     - Email: john@example.com
     - Phone: 0123456789
     - Branch: HQ
     - Role: Human Resources
   - Click "Register Employee"

2. **Enroll Biometric**
   - Click "Biometric" button on the registered employee
   - Confirm enrollment completes successfully

3. **Grant Access**
   - Click "Grant" button to authorize the employee
   - Verify status changes to "AUTHORIZED"

4. **Test Search & Filters**
   - Search for employee by name
   - Filter by branch
   - Filter by role
   - Filter by access status
   - Verify correct results are shown

## 📊 Scalability Considerations

For Phase 2 (Attendance Logging), the system supports:
- Time-based attendance records
- Biometric verification against stored templates
- Attendance reports and analytics
- Clock-in/Clock-out functionality
- Geolocation tracking (optional)

## 🛠️ Build & Production

### Build Application
```bash
npm run build
```

### Start Production Server
```bash
npm run start
```

## 📝 Code Quality

- Full TypeScript support
- Proper error handling
- Input validation
- Database transaction support
- Encrypted sensitive data
- Clean, modular architecture

## 🔐 Security Best Practices

1. **Environment Variables**: Sensitive keys in `.env.local`
2. **Database Validation**: Unique constraints on email and phone
3. **Encryption**: All biometric data encrypted with AES-256
4. **Access Control**: Role-based authorization ready for Phase 2
5. **Error Handling**: Proper error messages without data leakage

## 📚 Future Enhancements

- Real biometric scanner integration
- Attendance logging and tracking
- Multi-location support
- Advanced reporting and analytics
- Email notifications
- Mobile app support
- Two-factor authentication
- Audit logging

## 🤝 Contributing

This is a custom HR system developed for specific organizational needs. Contact the development team for modifications.

## 📄 License

Internal use only.

---

**System Version**: 1.0.0
**Last Updated**: February 28, 2026
