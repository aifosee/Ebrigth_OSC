import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET ALL STAFF FROM Employee TABLE
export async function GET() {
  try {
    const staff = await prisma.employee.findMany({
      select: { id: true, name: true, nickname: true, branch: true, position: true }
    });
    // Map position to role field so existing frontend logic still works
    const mapped = staff.map(s => ({
      ...s,
      role: s.position?.toLowerCase().includes('branch manager') ? `branch_manager_${s.branch.substring(0,3).toLowerCase()}` : null
    }));
    return NextResponse.json(mapped);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

// ADD A NEW EMPLOYEE TO A BRANCH
export async function POST(request: Request) {
  try {
    const { name, branch, position } = await request.json();
    if (!name?.trim() || !branch) {
      return NextResponse.json({ error: "Name and branch are required" }, { status: 400 });
    }
    const employee = await prisma.employee.create({
      data: { name: name.trim(), branch, position: position?.trim() || null }
    });
    return NextResponse.json({ success: true, employee });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "This employee already exists in this branch" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create employee" }, { status: 500 });
  }
}
