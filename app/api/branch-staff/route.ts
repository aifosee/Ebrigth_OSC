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
