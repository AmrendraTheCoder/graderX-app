import DashboardNavbar from "@/components/dashboard-navbar";
import {
  Plus,
  BookOpen,
  Save,
  Lock,
  Sparkles,
  GraduationCap,
} from "lucide-react";
import connectToDatabase from "@/lib/mongodb";
import { Subject } from "@/models";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  initializeDefaultSubjects,
} from "../../../actions";
import { SubmitButton } from "@/components/submit-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EditSubjectForm } from "@/components/edit-subject-form";
import { DeleteSubjectForm } from "@/components/delete-subject-form";
import { AddSubjectForm } from "@/components/add-subject-form";
import Link from "next/link";

interface SearchParams {
  message?: string;
  error?: string;
  passcode?: string;
}

export default async function SubjectsManagePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  // Check for admin passcode from environment variable
  const adminPasscode = process.env.ADMIN_PASSCODE || "admin123";
  const providedPasscode = params.passcode;

  if (!adminPasscode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-red-100 to-red-200 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-red-300/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-red-400/15 rounded-full blur-xl animate-pulse delay-1000"></div>
        </div>

        <Card className="w-full max-w-md relative z-10 shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-8">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 rounded-2xl shadow-lg">
                <Lock className="w-10 h-10 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-red-900 mb-2">
              Configuration Error
            </CardTitle>
            <CardDescription className="text-red-700 text-lg">
              Admin passcode is not configured. Please contact the system
              administrator.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (providedPasscode !== adminPasscode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-200 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-300/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-400/15 rounded-full blur-xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-indigo-300/10 rounded-full blur-xl animate-pulse delay-2000"></div>
        </div>

        <Card className="w-full max-w-md relative z-10 shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-2xl shadow-lg animate-pulse">
                <Lock className="w-10 h-10 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Administrator Access
            </CardTitle>
            <CardDescription className="text-gray-600 text-lg">
              Enter the admin passcode to access the subject management system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form method="GET" className="space-y-6">
              <div>
                <Label
                  htmlFor="passcode"
                  className="text-lg font-medium text-gray-700"
                >
                  Admin Passcode
                </Label>
                <Input
                  id="passcode"
                  name="passcode"
                  type="password"
                  placeholder="Enter your secure passcode"
                  className="mt-2 h-12 text-lg border-2 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                  autoFocus
                  required
                />
              </div>
              {params.passcode && params.passcode !== adminPasscode && (
                <div className="text-sm text-red-600 bg-red-50 p-4 rounded-xl border border-red-200 animate-pulse">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                    Invalid passcode. Please try again.
                  </div>
                </div>
              )}
              <Button
                type="submit"
                className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <Lock className="w-5 h-5 mr-3" />
                Access Admin Panel
              </Button>
            </form>
            <div className="mt-6 text-center">
              <Link
                href="/"
                className="text-gray-500 hover:text-blue-600 transition-colors duration-300 text-lg font-medium"
              >
                ← Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  await connectToDatabase();

  // Get all subjects from MongoDB
  const subjects = await Subject.find({})
    .sort({ semester: 1, name: 1 })
    .lean();

  // Convert MongoDB documents to plain objects with string IDs
  const plainSubjects = subjects.map((subject: any) => ({
    id: subject._id.toString(),
    name: subject.name,
    code: subject.code,
    credits: subject.credits,
    semester: subject.semester,
    branch: subject.branch || "Common",
    createdAt: subject.createdAt,
  }));

  // Group subjects by semester
  const subjectsBySemester =
    plainSubjects?.reduce((acc: any, subject: any) => {
      if (!acc[subject.semester]) {
        acc[subject.semester] = [];
      }
      acc[subject.semester].push(subject);
      return acc;
    }, {}) || {};

  return (
    <>
      <DashboardNavbar />
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          {/* Clean Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-2xl mb-6">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Subject Management
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Manage and organize the LNMIIT curriculum
            </p>

            {/* Simple Statistics */}
            <div className="grid grid-cols-3 gap-4 mt-8 max-w-md mx-auto">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">
                  {plainSubjects?.length || 0}
                </div>
                <div className="text-sm text-gray-500">Subjects</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">
                  {Object.keys(subjectsBySemester).length}
                </div>
                <div className="text-sm text-gray-500">Semesters</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">5</div>
                <div className="text-sm text-gray-500">Branches</div>
              </div>
            </div>
          </div>

          {/* Success/Error Messages */}
          {params.message && (
            <div className="mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <div className="font-medium">{params.message}</div>
                </div>
              </div>
            </div>
          )}
          {params.error && (
            <div className="mb-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                  <div className="font-medium">{params.error}</div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Add Subject Form */}
            <div className="lg:col-span-1">
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                    <div className="bg-gray-900 p-2 rounded-lg">
                      <Plus className="w-5 h-5 text-white" />
                    </div>
                    Add New Subject
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Add a new subject to the curriculum
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <AddSubjectForm />
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="mt-6 bg-white border border-gray-200 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                    <div className="bg-gray-700 p-2 rounded-lg">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form action={initializeDefaultSubjects}>
                    <SubmitButton
                      className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white border-0 rounded-lg shadow-sm transition-colors duration-200"
                      variant="outline"
                      pendingText="Initializing..."
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Initialize Default Subjects
                    </SubmitButton>
                  </form>
                  <p className="text-sm text-gray-500 mt-3 leading-relaxed">
                    Adds standard LNMIIT subjects for all branches
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Subjects List */}
            <div className="lg:col-span-2">
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                    <div className="bg-gray-800 p-2 rounded-lg">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    Current Subjects
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {plainSubjects?.length || 0} subjects across{" "}
                    {Object.keys(subjectsBySemester).length} semesters
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!plainSubjects || plainSubjects.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="bg-gray-100 p-6 rounded-xl inline-block mb-4">
                        <BookOpen className="w-12 h-12 text-gray-400 mx-auto" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        No subjects added yet
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Start by adding your first subject or initialize with
                        defaults
                      </p>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 inline-block">
                        <p className="text-blue-700 text-sm">
                          💡 Use "Initialize Default Subjects" to get started
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {Object.entries(subjectsBySemester).map(
                        ([semester, semesterSubjects]: [string, any]) => (
                          <div key={semester}>
                            <div className="flex items-center gap-3 mb-3">
                              <div className="bg-gray-900 text-white px-3 py-1.5 rounded-lg text-sm font-medium">
                                Semester {semester}
                              </div>
                              <div className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs font-medium">
                                {semesterSubjects.length} subjects
                              </div>
                            </div>

                            {/* Mobile Cards View */}
                            <div className="block md:hidden space-y-3">
                              {semesterSubjects.map((subject: any) => (
                                <div
                                  key={subject.id}
                                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-semibold text-gray-900">
                                      {subject.name}
                                    </h4>
                                    <div className="flex gap-1">
                                      <EditSubjectForm subject={subject} />
                                      <DeleteSubjectForm subject={subject} />
                                    </div>
                                  </div>
                                  <div className="text-sm text-gray-600 mb-2">
                                    <span className="font-mono bg-white px-2 py-1 rounded border">
                                      {subject.code}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span
                                      className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                                        subject.branch === "Common"
                                          ? "bg-gray-100 text-gray-800"
                                          : subject.branch === "CSE"
                                            ? "bg-blue-100 text-blue-800"
                                            : subject.branch === "ECE"
                                              ? "bg-purple-100 text-purple-800"
                                              : subject.branch === "ME"
                                                ? "bg-green-100 text-green-800"
                                                : subject.branch === "CE"
                                                  ? "bg-orange-100 text-orange-800"
                                                  : "bg-pink-100 text-pink-800"
                                      }`}
                                    >
                                      {subject.branch || "Common"}
                                    </span>
                                    <span className="bg-gray-900 text-white px-2 py-1 rounded text-xs font-medium">
                                      {subject.credits} credits
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Desktop Table View */}
                            <div className="hidden md:block bg-white rounded-lg overflow-hidden border border-gray-200">
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-gray-50">
                                    <TableHead className="font-semibold text-gray-700">
                                      Subject Name
                                    </TableHead>
                                    <TableHead className="font-semibold text-gray-700">
                                      Code
                                    </TableHead>
                                    <TableHead className="font-semibold text-gray-700">
                                      Branch
                                    </TableHead>
                                    <TableHead className="font-semibold text-gray-700 text-center">
                                      Credits
                                    </TableHead>
                                    <TableHead className="font-semibold text-gray-700 text-center">
                                      Actions
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {semesterSubjects.map((subject: any) => (
                                    <TableRow
                                      key={subject.id}
                                      className="hover:bg-gray-50"
                                    >
                                      <TableCell className="font-medium text-gray-900">
                                        {subject.name}
                                      </TableCell>
                                      <TableCell className="font-mono text-sm bg-gray-100 rounded px-2 py-1 inline-block">
                                        {subject.code}
                                      </TableCell>
                                      <TableCell>
                                        <span
                                          className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                                            subject.branch === "Common"
                                              ? "bg-gray-100 text-gray-800"
                                              : subject.branch === "CSE"
                                                ? "bg-blue-100 text-blue-800"
                                                : subject.branch === "ECE"
                                                  ? "bg-purple-100 text-purple-800"
                                                  : subject.branch === "ME"
                                                    ? "bg-green-100 text-green-800"
                                                    : subject.branch === "CE"
                                                      ? "bg-orange-100 text-orange-800"
                                                      : "bg-pink-100 text-pink-800"
                                          }`}
                                        >
                                          {subject.branch || "Common"}
                                        </span>
                                      </TableCell>
                                      <TableCell className="text-center">
                                        <span className="bg-gray-900 text-white px-2 py-1 rounded text-xs font-medium">
                                          {subject.credits} credits
                                        </span>
                                      </TableCell>
                                      <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-1">
                                          <EditSubjectForm subject={subject} />
                                          <DeleteSubjectForm
                                            subject={subject}
                                          />
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
