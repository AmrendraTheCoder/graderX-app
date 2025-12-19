"use server";

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongodb";
import { User, Subject, UserGrade, CGPACalculation } from "@/models";
import { authOptions } from "@/lib/auth";

// Helper function for redirect with message
function encodedRedirect(
  type: "error" | "success",
  path: string,
  message: string
) {
  const url = new URL(path, "http://localhost:3000");
  url.searchParams.set(type, message);
  return redirect(url.pathname + url.search);
}

// Get current session helper
async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  
  await connectToDatabase();
  const user = await User.findById(session.user.id);
  return user;
}

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const confirmPassword = formData.get("confirmPassword")?.toString();
  const firstName = formData.get("firstName")?.toString() || "";
  const lastName = formData.get("lastName")?.toString() || "";
  const branch = formData.get("branch")?.toString() || "";
  const fullName = `${firstName} ${lastName}`.trim();

  if (!email || !password) {
    return encodedRedirect("error", "/sign-up", "Email and password are required");
  }

  if (!firstName || !lastName) {
    return encodedRedirect("error", "/sign-up", "First and last name are required");
  }

  if (!branch) {
    return encodedRedirect("error", "/sign-up", "Please select your branch");
  }

  if (password !== confirmPassword) {
    return encodedRedirect("error", "/sign-up", "Passwords do not match");
  }

  if (password.length < 6) {
    return encodedRedirect("error", "/sign-up", "Password must be at least 6 characters long");
  }

  try {
    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return encodedRedirect("error", "/sign-up", "User with this email already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Check if LNMIIT email
    const isLnmiitEmail = email.toLowerCase().endsWith("@lnmiit.ac.in");

    // Create user
    await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      name: fullName,
      fullName,
      branch,
      isLnmiitEmail,
      currentSemester: 1,
      currentAcademicYear: "2024-25",
    });

    return encodedRedirect(
      "success",
      "/sign-in",
      "Account created successfully! Please sign in."
    );
  } catch (error: any) {
    console.error("Sign up error:", error);
    return encodedRedirect("error", "/sign-up", error.message || "Failed to create account");
  }
};

export const signOutAction = async () => {
  // NextAuth handles sign out via /api/auth/signout
  return redirect("/api/auth/signout");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  // Note: For production, you'd want to implement email sending with a token
  // For now, we'll just show a success message
  // In a real implementation, you would:
  // 1. Generate a password reset token
  // 2. Store it in the database with an expiry
  // 3. Send an email with the reset link
  
  await connectToDatabase();
  const user = await User.findOne({ email: email.toLowerCase() });
  
  if (!user) {
    // Don't reveal if email exists for security
    return encodedRedirect(
      "success",
      "/forgot-password",
      "If an account exists with this email, you will receive a reset link."
    );
  }

  // TODO: Implement email sending with reset token
  return encodedRedirect(
    "success",
    "/forgot-password",
    "Password reset functionality coming soon. Please contact support."
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const password = formData.get("password")?.toString();
  const confirmPassword = formData.get("confirmPassword")?.toString();

  if (!password || !confirmPassword) {
    return encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Password and confirm password are required"
    );
  }

  if (password !== confirmPassword) {
    return encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Passwords do not match"
    );
  }

  if (password.length < 6) {
    return encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Password must be at least 6 characters"
    );
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return encodedRedirect("error", "/sign-in", "You must be logged in");
  }

  try {
    await connectToDatabase();
    const hashedPassword = await bcrypt.hash(password, 12);
    
    await User.findByIdAndUpdate(session.user.id, {
      password: hashedPassword,
    });

    return encodedRedirect(
      "success",
      "/dashboard",
      "Password updated successfully"
    );
  } catch (error) {
    console.error("Error resetting password:", error);
    return encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Failed to reset password"
    );
  }
};

export const addGradeAction = async (formData: FormData) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return encodedRedirect("error", "/sign-in", "You must be logged in");
  }

  const subjectId = formData.get("subjectId")?.toString();
  const grade = formData.get("grade")?.toString();
  const semester = parseInt(formData.get("semester")?.toString() || "1");
  const academicYear = formData.get("academicYear")?.toString() || "2024-25";

  if (!subjectId || !grade) {
    return encodedRedirect("error", "/dashboard/grades", "Subject and grade are required");
  }

  // Get grade points
  const gradePoints: { [key: string]: number } = {
    A: 10.0,
    AB: 9.0,
    B: 8.0,
    BC: 7.0,
    C: 6.0,
    CD: 5.0,
    D: 4.0,
    F: 0.0,
  };

  const points = gradePoints[grade] || 0.0;

  try {
    await connectToDatabase();

    // Upsert grade
    await UserGrade.findOneAndUpdate(
      {
        userId: session.user.id,
        subjectId,
        semester,
        academicYear,
      },
      {
        userId: session.user.id,
        subjectId,
        grade,
        gradePoints: points,
        semester,
        academicYear,
      },
      { upsert: true, new: true }
    );

    // Recalculate CGPA
    await calculateAndStoreCGPA(session.user.id);

    return encodedRedirect("success", "/dashboard/grades", "Grade saved successfully");
  } catch (error: any) {
    console.error("Error adding grade:", error);
    return encodedRedirect("error", "/dashboard/grades", "Failed to save grade");
  }
};

// Helper function to calculate and store CGPA
async function calculateAndStoreCGPA(userId: string) {
  try {
    await connectToDatabase();

    // Get all user grades with subject credits
    const grades = await UserGrade.find({ userId }).populate("subjectId");

    if (!grades || grades.length === 0) return;

    // Calculate semester-wise SGPA and overall CGPA
    const semesterData: { [key: number]: { credits: number; points: number } } = {};
    let totalCredits = 0;
    let totalPoints = 0;

    grades.forEach((grade: any) => {
      const credits = grade.subjectId?.credits || 3;
      const points = grade.gradePoints * credits;

      totalCredits += credits;
      totalPoints += points;

      // Semester-wise calculation
      if (!semesterData[grade.semester]) {
        semesterData[grade.semester] = { credits: 0, points: 0 };
      }
      semesterData[grade.semester].credits += credits;
      semesterData[grade.semester].points += points;
    });

    const overallCGPA = totalCredits > 0 ? totalPoints / totalCredits : 0;

    // Store CGPA calculations for each semester
    for (const [semester, data] of Object.entries(semesterData)) {
      const sgpa = data.credits > 0 ? data.points / data.credits : 0;

      await CGPACalculation.findOneAndUpdate(
        {
          userId,
          semester: parseInt(semester),
          academicYear: "2024-25",
        },
        {
          userId,
          semester: parseInt(semester),
          sgpa: parseFloat(sgpa.toFixed(2)),
          cgpa: parseFloat(overallCGPA.toFixed(2)),
          totalCredits: data.credits,
          totalGradePoints: parseFloat(data.points.toFixed(2)),
          academicYear: "2024-25",
        },
        { upsert: true }
      );
    }

    // Store overall CGPA record (semester 0)
    await CGPACalculation.findOneAndUpdate(
      {
        userId,
        semester: 0,
        academicYear: "2024-25",
      },
      {
        userId,
        semester: 0,
        sgpa: parseFloat(overallCGPA.toFixed(2)),
        cgpa: parseFloat(overallCGPA.toFixed(2)),
        totalCredits,
        totalGradePoints: parseFloat(totalPoints.toFixed(2)),
        academicYear: "2024-25",
      },
      { upsert: true }
    );
  } catch (error) {
    console.error("Error calculating CGPA:", error);
  }
}

export const getUserRole = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  await connectToDatabase();
  const user = await User.findById(session.user.id);
  return user?.role || "student";
};

export const addSubjectAction = async (formData: FormData) => {
  const name = formData.get("name") as string;
  const code = formData.get("code") as string;
  const credits = formData.get("credits") as string;
  const semester = formData.get("semester") as string;
  const branch = formData.get("branch") as string;
  const redirectPath = formData.get("redirectPath")?.toString() || "/admin?passcode=admin123";

  if (!name || !code || !semester || !branch || !credits) {
    return encodedRedirect("error", redirectPath, "Missing required fields");
  }

  try {
    await connectToDatabase();

    await Subject.create({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      credits: parseFloat(credits),
      semester: parseInt(semester),
      branch: branch || "Common",
    });

    return encodedRedirect("success", redirectPath, "Subject added successfully");
  } catch (error: any) {
    console.error("Error adding subject:", error);
    if (error.code === 11000) {
      return encodedRedirect("error", redirectPath, "Subject code already exists for this branch");
    }
    return encodedRedirect("error", redirectPath, error.message || "Failed to add subject");
  }
};

export const editSubjectAction = async (formData: FormData) => {
  const subjectId = formData.get("subjectId")?.toString();
  const name = formData.get("name")?.toString();
  const code = formData.get("code")?.toString();
  const credits = parseFloat(formData.get("credits")?.toString() || "3");
  const semester = parseInt(formData.get("semester")?.toString() || "1");
  const branch = formData.get("branch")?.toString() || "Common";
  const redirectPath = formData.get("redirectPath")?.toString() || "/admin?passcode=admin123";

  if (!subjectId || !name || !code) {
    return encodedRedirect("error", redirectPath, "Subject ID, name and code are required");
  }

  try {
    await connectToDatabase();

    // Check if another subject with the same code exists
    const existingSubject = await Subject.findOne({
      code: code.trim().toUpperCase(),
      branch,
      _id: { $ne: subjectId },
    });

    if (existingSubject) {
      return encodedRedirect(
        "error",
        redirectPath,
        `Subject code "${code.toUpperCase()}" already exists for ${branch} branch`
      );
    }

    await Subject.findByIdAndUpdate(subjectId, {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      credits,
      semester,
      branch,
    });

    return encodedRedirect("success", redirectPath, `Subject "${name}" updated successfully`);
  } catch (error: any) {
    console.error("Error updating subject:", error);
    return encodedRedirect("error", redirectPath, error.message || "Failed to update subject");
  }
};

export const deleteSubjectAction = async (formData: FormData) => {
  const subjectId = formData.get("subjectId")?.toString();
  const redirectPath = formData.get("redirectPath")?.toString() || "/admin?passcode=admin123";

  if (!subjectId) {
    return encodedRedirect("error", redirectPath, "Subject ID is required");
  }

  try {
    await connectToDatabase();

    // Check if subject exists
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return encodedRedirect("error", redirectPath, "Subject not found");
    }

    // Check if subject has any grades assigned
    const existingGrades = await UserGrade.findOne({ subjectId });
    if (existingGrades) {
      return encodedRedirect(
        "error",
        redirectPath,
        `Cannot delete subject "${subject.name}" - grades exist for this subject`
      );
    }

    await Subject.findByIdAndDelete(subjectId);

    return encodedRedirect("success", redirectPath, `Subject "${subject.name}" deleted successfully`);
  } catch (error: any) {
    console.error("Error deleting subject:", error);
    return encodedRedirect("error", redirectPath, error.message || "Failed to delete subject");
  }
};

export const verifyAdminPasscode = async (formData: FormData) => {
  const passcode = formData.get("passcode")?.toString();

  if (passcode !== "12345") {
    return encodedRedirect("error", "/dashboard", "Invalid passcode");
  }

  return redirect("/dashboard/admin");
};

export const initializeDefaultSubjects = async () => {
  try {
    await connectToDatabase();
    
    const userRole = await getUserRole();
    if (userRole !== "admin") {
      return encodedRedirect("error", "/dashboard/admin/subjects", "Access denied");
    }

    // Check if subjects already exist
    const existingSubjects = await Subject.findOne();
    if (existingSubjects) {
      return encodedRedirect("success", "/dashboard/admin/subjects", "Subjects already initialized");
    }

    // Default LNMIIT subjects
    const defaultSubjects = [
      // Semester 1 - Common subjects
      { name: "Engineering Mathematics I", code: "MTH101", credits: 4, semester: 1, branch: "Common" },
      { name: "Physics", code: "PHY101", credits: 4, semester: 1, branch: "Common" },
      { name: "Chemistry", code: "CHM101", credits: 4, semester: 1, branch: "Common" },
      { name: "Programming Fundamentals", code: "CSE101", credits: 4, semester: 1, branch: "Common" },
      { name: "English Communication", code: "ENG101", credits: 3, semester: 1, branch: "Common" },
      { name: "Engineering Drawing", code: "ED101", credits: 1.5, semester: 1, branch: "Common" },

      // Semester 2 - Common subjects
      { name: "Engineering Mathematics II", code: "MTH102", credits: 4, semester: 2, branch: "Common" },
      { name: "Data Structures", code: "CSE102", credits: 4, semester: 2, branch: "CSE" },
      { name: "Digital Logic Design", code: "ECE101", credits: 4, semester: 2, branch: "Common" },
      { name: "Engineering Graphics", code: "MEC101", credits: 3, semester: 2, branch: "Common" },
      { name: "Environmental Science", code: "EVS101", credits: 2, semester: 2, branch: "Common" },
      { name: "Workshop Practice", code: "WP101", credits: 1.5, semester: 2, branch: "Common" },

      // Semester 3 - Branch specific
      { name: "Engineering Mathematics III", code: "MTH103", credits: 4, semester: 3, branch: "Common" },
      { name: "Computer Organization", code: "CSE201", credits: 4, semester: 3, branch: "CSE" },
      { name: "Database Management Systems", code: "CSE202", credits: 4, semester: 3, branch: "CSE" },
      { name: "Object Oriented Programming", code: "CSE203", credits: 4, semester: 3, branch: "CSE" },
      { name: "Economics", code: "ECO101", credits: 3, semester: 3, branch: "Common" },

      // ECE Semester 3
      { name: "Signals and Systems", code: "ECE201", credits: 4, semester: 3, branch: "ECE" },
      { name: "Electronic Devices", code: "ECE202", credits: 4, semester: 3, branch: "ECE" },
      { name: "Electromagnetic Theory", code: "ECE203", credits: 4, semester: 3, branch: "ECE" },

      // ME Semester 3
      { name: "Thermodynamics", code: "ME201", credits: 4, semester: 3, branch: "ME" },
      { name: "Strength of Materials", code: "ME202", credits: 4, semester: 3, branch: "ME" },
      { name: "Manufacturing Processes", code: "ME203", credits: 4, semester: 3, branch: "ME" },

      // Semester 4 - CSE
      { name: "Operating Systems", code: "CSE301", credits: 4, semester: 4, branch: "CSE" },
      { name: "Computer Networks", code: "CSE302", credits: 4, semester: 4, branch: "CSE" },
      { name: "Software Engineering", code: "CSE303", credits: 4, semester: 4, branch: "CSE" },
      { name: "Theory of Computation", code: "CSE304", credits: 3, semester: 4, branch: "CSE" },
      { name: "Probability and Statistics", code: "MTH201", credits: 3, semester: 4, branch: "Common" },

      // Semester 5 - CSE
      { name: "Machine Learning", code: "CSE401", credits: 4, semester: 5, branch: "CSE" },
      { name: "Artificial Intelligence", code: "CSE402", credits: 4, semester: 5, branch: "CSE" },
      { name: "Compiler Design", code: "CSE403", credits: 4, semester: 5, branch: "CSE" },
      { name: "Information Security", code: "CSE404", credits: 3, semester: 5, branch: "CSE" },

      // Semester 6 - CSE
      { name: "Web Technologies", code: "CSE501", credits: 4, semester: 6, branch: "CSE" },
      { name: "Mobile Computing", code: "CSE502", credits: 4, semester: 6, branch: "CSE" },
      { name: "Cloud Computing", code: "CSE503", credits: 4, semester: 6, branch: "CSE" },
    ];

    await Subject.insertMany(defaultSubjects);

    return encodedRedirect(
      "success",
      "/admin?passcode=admin123",
      "Default subjects initialized successfully"
    );
  } catch (error: any) {
    console.error("Error initializing subjects:", error);
    return encodedRedirect(
      "error",
      "/admin?passcode=admin123",
      "An unexpected error occurred"
    );
  }
};

// Get subjects for the public calculator and other pages
export const getSubjects = async (branch?: string, semester?: number) => {
  await connectToDatabase();
  
  const query: any = {};
  if (branch && branch !== "all") {
    query.$or = [{ branch }, { branch: "Common" }];
  }
  if (semester) {
    query.semester = semester;
  }
  
  const subjects = await Subject.find(query).sort({ semester: 1, name: 1 });
  return JSON.parse(JSON.stringify(subjects));
};

// Get user grades
export const getUserGrades = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  await connectToDatabase();
  
  const grades = await UserGrade.find({ userId: session.user.id })
    .populate("subjectId")
    .sort({ semester: -1 });
  
  return JSON.parse(JSON.stringify(grades));
};

// Get CGPA data
export const getCGPAData = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  await connectToDatabase();
  
  const cgpaData = await CGPACalculation.find({ userId: session.user.id })
    .sort({ semester: -1 });
  
  return JSON.parse(JSON.stringify(cgpaData));
};

// Make user admin
export const makeUserAdmin = async (formData: FormData) => {
  const passcode = formData.get("passcode")?.toString();
  
  if (passcode !== "LNMIIT_ADMIN_2024") {
    return encodedRedirect("error", "/admin-access", "Invalid admin passcode");
  }
  
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return encodedRedirect("error", "/sign-in", "You must be logged in");
  }

  await connectToDatabase();
  
  await User.findByIdAndUpdate(session.user.id, { role: "admin" });
  
  return encodedRedirect("success", "/dashboard", "Admin access granted!");
};
