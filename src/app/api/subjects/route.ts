import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Subject } from "@/models";

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const branch = searchParams.get("branch");
    const semester = searchParams.get("semester");

    const query: any = {};
    
    if (branch && branch !== "all") {
      query.$or = [{ branch }, { branch: "Common" }];
    }
    
    if (semester) {
      query.semester = parseInt(semester);
    }

    const subjects = await Subject.find(query).sort({ semester: 1, name: 1 });

    return NextResponse.json(subjects);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json({ error: "Failed to fetch subjects" }, { status: 500 });
  }
}
