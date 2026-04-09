# HR Attendance System - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The application will be available at: **http://localhost:3000**

## 📱 Using the Dashboard

### Register Your First Employee

1. Click the **"Register New Employee"** tab
2. Fill in the form:
   - **First Name**: John
   - **Last Name**: Doe
   - **Email**: john.doe@company.com
   - **Phone**: +1-234-567-8900
   - **Branch**: Headquarters (HQ)
   - **Role**: Human Resources
3. Click **"Register Employee"**

✅ Success! Your first employee is registered with ID: **HQ-001**

### Enroll Biometric

1. Go back to **"Employee Dashboard"** tab
2. Find your newly registered employee in the table
3. Click the **"Biometric"** button
4. Follow the enrollment steps:
   - System will simulate fingerprint scanning
   - Wait for scan to complete
   - Click **"Done"** when finished

✅ Biometric enrolled! Status will now show "✓ Enrolled"

### Grant Access

1. Find your employee in the table
2. Click the **"Grant"** button (red button in Actions)
3. Confirm the operation

✅ Access granted! Status will change to **"AUTHORIZED"**

## 🔍 Search & Filter

Use the advanced search bar at the top of the Employee Dashboard:

- **Search Box**: Find by name, email, or employee ID
- **Branch Filter**: Filter by HQ, BR, BR2, or BR3
- **Role Filter**: Filter by any of 10 available roles
- **Access Status**: Filter by AUTHORIZED or UNAUTHORIZED

### Example Filters
```
Search: "john" → Shows all employees named John
Branch: "HQ" → Shows only HQ employees
Access: "UNAUTHORIZED" → Shows employees without access
```

## 📋 Employee Dashboard Features

| Column | Description |
|--------|-------------|
| **Employee ID** | Auto-generated: Branch-XXX (e.g., HQ-001) |
| **Name** | Employee's full name |
| **Email** | Contact email address |
| **Phone** | Contact phone number |
| **Branch** | Assigned branch location |
| **Role** | Job role/position |
| **Biometric** | ✓ Enrolled or ✗ Not Enrolled |
| **Access Status** | AUTHORIZED or UNAUTHORIZED (green/red) |
| **Actions** | Biometric enrollment & Access toggle buttons |

## 📊 Dashboard Statistics

At the bottom of the Employee Dashboard:
- **Total Employees**: Count of all registered employees
- **Authorized**: Number of employees with access enabled
- **Unauthorized**: Number of employees waiting for access

## 🏢 Multiple Branches

Register employees in different branches:

```
HQ-001, HQ-002, HQ-003          → Headquarters
BR-001, BR-002, BR-003          → Branch 1
BR2-001, BR2-002                → Branch 2
BR3-001                         → Branch 3
```

Each branch maintains its own sequential numbering.

## 10 Available Roles

1. 👨‍💼 **Human Resources** - HR management
2. 💰 **Finance** - Financial management
3. 🗺️ **Regional Manager** - Branch operations
4. 🔧 **Optimisation Department** - Process improvement
5. 📢 **Marketing** - Marketing team
6. 🏢 **HQ Operation** - Headquarters operations
7. 👑 **CEO** - Chief Executive Officer
8. 🔐 **Super Admin** - System administrator
9. 🎓 **Academy** - Training & development
10. 🧠 **Industrial Psychology** - Employee wellness

## 🔒 Default Behavior

- New employees start with **"UNAUTHORIZED"** status
- Must be manually authorized by Super Admin
- No access to system until authorization
- Biometric templates are encrypted and stored securely

## 📈 Common Tasks

### Task: Register Department Head
1. Register New Employee
2. Select "Regional Manager" role
3. Assign to relevant branch
4. Enroll biometric
5. Grant access

### Task: Find Unauthorized Employees
1. Use Access Status filter
2. Select "UNAUTHORIZED"
3. Click view to see list
4. Grant access to those ready

### Task: Manage Branch Employees
1. Use Branch filter
2. Select specific branch
3. See all branch employees
4. Manage their access and biometrics

## ❓ Troubleshooting

| Issue | Solution |
|-------|----------|
| **Duplicate Email Error** | Email already exists. Use different email. |
| **Duplicate Phone Error** | Phone already registered. Use different phone. |
| **Biometric Won't Enroll** | Try clicking Biometric button again |
| **Can't Find Employee** | Use search function or adjust filters |

## 💡 Tips

- ✅ Use consistent email format (e.g., firstname.lastname@company.com)
- ✅ Use complete phone numbers with country code
- ✅ Assign appropriate roles for better organization
- ✅ Enroll biometric immediately after registration
- ✅ Verify access authorization in dashboard
- ✅ Use branch filters for large employee lists

## 🔄 Next Steps

After setting up employees:
1. **Monitor Access Status**: Ensure all active employees are authorized
2. **Update Information**: Edit employee details as needed
3. **Track Biometrics**: Verify all employees have biometric enrollment
4. **Prepare for Phase 2**: System is ready for attendance logging integration

---

**Ready to use!** Start registering employees and managing access. 🎉
