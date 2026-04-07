import { NextResponse } from 'next/server';
import { prisma as _prisma } from '@/lib/prisma';
const prisma = _prisma as any;

// Position level code (pos2)
function getPositionCode(role: string): string {
  const r = role.toUpperCase();
  if (r.includes('CEO')) return '11';
  if (r.includes('HOD')) return '22';
  if (r.includes('EXEC') || r.includes('BM') || r.startsWith('FT - COACH') || r.startsWith('PT - COACH') || r.includes('FT - COACH ') || r.includes('PT - COACH ')) return '33';
  if (r.startsWith('FT - ') || r.startsWith('PT - ')) return '33'; // FT/PT Coaches
  if (r.includes('INT')) return '44';
  return '33';
}

// Department code (pos1.1) from branch field
function getDeptCode(branch: string): string {
  const map: Record<string, string> = {
    'HQ':  '01',
    'OD':  '08',
    'ACD': '03',
    'HR':  '04',
    'FNC': '05',
    'FIN': '05',
    'IOP': '06',
    'MKT': '07',
  };
  return map[branch.toUpperCase()] ?? '09';
}

function buildEmployeeId(role: string, branch: string, seq: number): string {
  // Format: [pos2][pos1.1][branch_code][pos3]
  // HQ departments use branch code "00"; physical branches will use their own codes later
  return `${getPositionCode(role)}${getDeptCode(branch)}00${String(seq).padStart(2, '0')}`;
}

// Map BranchStaff DB row → Employee shape expected by the frontend
function toEmployee(s: Record<string, unknown>) {
  return {
    id: String(s.id),
    employeeId: (s.employeeId as string) || `BS-${String(s.id).padStart(3, '0')}`,
    fullName: (s.name as string) || '',
    gender: (s.gender as string) || '',
    nickName: (s.nickname as string) || '',
    email: (s.email as string) || '',
    phone: (s.phone as string) || '',
    nric: (s.nric as string) || '',
    dob: (s.dob as string) || '',
    homeAddress: (s.home_address as string) || '',
    branch: (s.branch as string) || '',
    role: (s.role as string) || '',
    contract: (s.contract as string) || '',
    startDate: (s.start_date as string) || '',
    endDate: (s.endDate as string) || '',
    probation: (s.probation as string) || '',
    rate: (s.rate as string) || '',
    Emc_Number: (s.emergency_phone as string) || '',
    Emc_Email: (s.emergency_name as string) || '',
    Emc_Relationship: (s.emergency_relation as string) || '',
    Signed_Date: (s.signed_date as string) || '',
    Emp_Hire_Date: (s.start_date as string) || '',
    Emp_Type: (s.employment_type as string) || '',
    Emp_Status: (s.status as string) || '',
    Bank: (s.bank as string) || '',
    Bank_Name: (s.bank_name as string) || '',
    Bank_Account: (s.bank_account as string) || '',
    University: (s.university as string) || '',
    accessStatus: (s.accessStatus as string) || 'AUTHORIZED',
    biometricTemplate: (s.biometricTemplate as string) || null,
    registeredAt: s.createdAt ? new Date(s.createdAt as string).toISOString() : '',
    updatedAt: s.updatedAt ? new Date(s.updatedAt as string).toISOString() : '',
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.toLowerCase() || '';
  const branch = searchParams.get('branch') || '';
  const role = searchParams.get('role') || '';
  const accessStatus = searchParams.get('accessStatus') || '';

  const where: Record<string, unknown> = {};
  if (branch) where.branch = branch;
  if (role) where.role = role;
  if (accessStatus) where.accessStatus = accessStatus;

  const staff = await prisma.branchStaff.findMany({ where, orderBy: { id: 'asc' } });

  let results = staff.map(toEmployee);

  if (search) {
    results = results.filter(
      (e: any) =>
        e.fullName.toLowerCase().includes(search) ||
        e.email.toLowerCase().includes(search) ||
        e.employeeId.toLowerCase().includes(search)
    );
  }

  return NextResponse.json(results);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, phone, branch, role, gender, nickName, nric, dob,
            homeAddress, contract, startDate, endDate, probation, rate,
            Emc_Number, Emc_Email, Emc_Relationship, Signed_Date, Emp_Hire_Date,
            Emp_Type, Emp_Status, Bank, Bank_Name, Bank_Account, University } = body;

    if (!fullName || !email || !phone || !branch || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const normalizedFullName = fullName.toUpperCase();
    const normalizedNickName = nickName ? nickName.toUpperCase() : null;
    const normalizedHomeAddress = homeAddress ? homeAddress.toUpperCase() : null;

    const existing = await prisma.branchStaff.findFirst({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }

    const count = await prisma.branchStaff.count();
    const employeeId = buildEmployeeId(role, branch, count + 1);

    const newStaff = await prisma.branchStaff.create({
      data: {
        name: normalizedFullName,
        gender: gender || 'MALE',
        nickname: normalizedNickName,
        email,
        phone,
        nric: nric || null,
        dob: dob || null,
        home_address: normalizedHomeAddress,
        branch,
        role,
        contract: contract || '12 MONTH',
        start_date: startDate || null,
        endDate: endDate || null,
        probation: probation || null,
        rate: rate || null,
        emergency_phone: Emc_Number || null,
        emergency_name: Emc_Email || null,
        emergency_relation: Emc_Relationship || null,
        signed_date: Signed_Date || null,
        employment_type: Emp_Type || null,
        status: Emp_Status || null,
        bank: Bank || null,
        bank_name: Bank_Name || null,
        bank_account: Bank_Account || null,
        university: University || null,
        employeeId,
        accessStatus: 'AUTHORIZED',
      },
    });

    return NextResponse.json(
      { message: 'Employee registered successfully', data: toEmployee(newStaff as unknown as Record<string, unknown>) },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error registering employee:', error);
    return NextResponse.json({ error: 'Failed to register employee' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, fullName, email, phone, branch, role, gender, nickName, nric, dob,
            homeAddress, contract, startDate, endDate, probation, rate, accessStatus,
            Emc_Number, Emc_Email, Emc_Relationship, Signed_Date, Emp_Hire_Date,
            Emp_Type, Emp_Status, Bank, Bank_Name, Bank_Account, University,
            employeeId, biometricTemplate } = body;

    if (!id) {
      return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
    }

    // Recalculate employee ID if branch or role changed
    let recalculatedEmployeeId: string | undefined;
    if (branch !== undefined || role !== undefined) {
      const current = await prisma.branchStaff.findUnique({ where: { id: parseInt(id) } });
      if (current) {
        const newBranch = branch ?? current.branch ?? 'HQ';
        const newRole = role ?? current.role ?? '';
        // Use DB primary key as the canonical sequence number (avoids parsing issues with old IDs)
        recalculatedEmployeeId = buildEmployeeId(newRole, newBranch, current.id);
      }
    }

    const updated = await prisma.branchStaff.update({
      where: { id: parseInt(id) },
      data: {
        ...(fullName !== undefined && { name: fullName.toUpperCase() }),
        ...(gender !== undefined && { gender }),
        ...(nickName !== undefined && { nickname: nickName.toUpperCase() }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(nric !== undefined && { nric }),
        ...(dob !== undefined && { dob }),
        ...(homeAddress !== undefined && { home_address: homeAddress.toUpperCase() }),
        ...(branch !== undefined && { branch }),
        ...(role !== undefined && { role }),
        ...(contract !== undefined && { contract }),
        ...(startDate !== undefined && { start_date: startDate }),
        ...(endDate !== undefined && { endDate }),
        ...(probation !== undefined && { probation }),
        ...(rate !== undefined && { rate }),
        ...(accessStatus !== undefined && { accessStatus }),
        ...(biometricTemplate !== undefined && { biometricTemplate }),
        ...(Emc_Number !== undefined && { emergency_phone: Emc_Number }),
        ...(Emc_Email !== undefined && { emergency_name: Emc_Email }),
        ...(Emc_Relationship !== undefined && { emergency_relation: Emc_Relationship }),
        ...(Signed_Date !== undefined && { signed_date: Signed_Date }),
        ...(Emp_Type !== undefined && { employment_type: Emp_Type }),
        ...(Emp_Status !== undefined && { status: Emp_Status }),
        ...(Bank !== undefined && { bank: Bank }),
        ...(Bank_Name !== undefined && { bank_name: Bank_Name }),
        ...(Bank_Account !== undefined && { bank_account: Bank_Account }),
        ...(University !== undefined && { university: University }),
        ...(recalculatedEmployeeId !== undefined && { employeeId: recalculatedEmployeeId }),
      },
    });

    return NextResponse.json({
      message: 'Employee updated successfully',
      data: toEmployee(updated as unknown as Record<string, unknown>),
    });
  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json({ error: 'Failed to update employee' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
    }

    const deleted = await prisma.branchStaff.delete({ where: { id: parseInt(id) } });

    return NextResponse.json({
      message: 'Employee deleted successfully',
      data: toEmployee(deleted as unknown as Record<string, unknown>),
    });
  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json({ error: 'Failed to delete employee' }, { status: 500 });
  }
}
