import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Prisma "upsert": Update if it exists, Create if it doesn't!
    const schedule = await prisma.manpowerSchedule.upsert({
      where: { 
        id: body.id 
      },
      update: {
        selections: body.selections,
        notes: body.notes,
        status: "Finalized",
      },
      create: {
        id: body.id,
        branch: body.branch,
        startDate: body.startDate,
        endDate: body.endDate,
        selections: body.selections,
        notes: body.notes,
        originalSelections: body.originalSelections,
        originalNotes: body.originalNotes,
        status: body.status,
        originalAuthor: body.originalAuthor,
      }
    });

    return NextResponse.json({ success: true, schedule });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save schedule to database" }, 
      { status: 500 }
    );
  }
}