import { Plus, BookOpen, Save, Lock, GraduationCap } from "lucide-react";
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
  addSubjectAction,
  initializeDefaultSubjects,
} from "../actions";
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
  success?: string;
  passcode?: string;
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  // Check for admin passcode (simpler passcode without special characters)
  const adminPasscode = process.env.ADMIN_PASSCODE || "admin123";
  const providedPasscode = params.passcode;

  if (providedPasscode !== adminPasscode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl shadow-lg">
                <Lock className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Admin Access Required
            </CardTitle>
            <CardDescription className="text-gray-600">
              Enter the admin passcode to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form method="GET" className="space-y-4">
              <div>
                <Label htmlFor="passcode" className="text-gray-700 font-medium">
                  Admin Passcode
                </Label>
                <Input
                  id="passcode"
                  name="passcode"
                  type="password"
                  placeholder="Enter passcode"
                  className="mt-1 border-2 focus:border-blue-400 focus:ring-blue-400"
                  autoFocus
                  required
                />
              </div>
              {params.passcode && params.passcode !== adminPasscode && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                  Invalid passcode. Please try again.
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md"
              >
                <Lock className="w-4 h-4 mr-2" />
                Access Admin Panel
              </Button>
            </form>
            <div className="mt-4 text-center">
              <Link
                href="/"
                className="text-blue-600 hover:text-blue-700 font-medium"
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

  // Serialize MongoDB documents
  const serializedSubjects = JSON.parse(JSON.stringify(subjects));

  // Group subjects by semester
  const subjectsBySemester = serializedSubjects.reduce(
    (acc: any, subject: any) => {
      if (!acc[subject.semester]) {
        acc[subject.semester] = [];
      }
      acc[subject.semester].push(subject);
      return acc;
    },
    {}
  );

  // Get display message
  const displayMessage = params.message || params.success;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-blue-100 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg shadow-md">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  GraderX Admin
                </h1>
                <p className="text-sm text-blue-600/70">Subject Management</p>
              </div>
            </div>
            <Link href="/">
              <Button
                variant="outline"
                size="sm"
                className="border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                ← Home
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Success/Error Messages */}
        {displayMessage && (
          <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 text-green-800 shadow-sm">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              {displayMessage}
            </div>
          </div>
        )}
        {params.error && (
          <div className="mb-6 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-lg p-4 text-red-800 shadow-sm">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
              {params.error}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Subject Form */}
          <div className="lg:col-span-1">
            <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-1.5 rounded-lg">
                    <Plus className="w-4 h-4 text-white" />
                  </div>
                  Add New Subject
                </CardTitle>
                <CardDescription className="text-blue-600/70">
                  Add a new subject to the curriculum
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <AddSubjectForm />
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-6 bg-white/80 backdrop-blur-sm border-purple-100 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-purple-800">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-1.5 rounded-lg">
                    <Save className="w-4 h-4 text-white" />
                  </div>
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <form action={initializeDefaultSubjects}>
                  <SubmitButton
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-md"
                    variant="outline"
                    pendingText="Initializing..."
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Initialize Default Subjects
                  </SubmitButton>
                </form>
                <p className="text-sm text-purple-600/70 mt-3 leading-relaxed">
                  Adds standard LNMIIT subjects
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Subjects List */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm border-emerald-100 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-emerald-800">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-1.5 rounded-lg">
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  Current Subjects
                </CardTitle>
                <CardDescription className="text-emerald-600/70">
                  {serializedSubjects.length || 0} subjects across{" "}
                  {Object.keys(subjectsBySemester).length} semesters
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {serializedSubjects.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-6 rounded-xl inline-block mb-4">
                      <BookOpen className="w-12 h-12 text-blue-500 mx-auto" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      No subjects yet
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Add your first subject or initialize defaults
                    </p>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 inline-block">
                      <p className="text-blue-700 text-sm">
                        💡 Use &quot;Initialize Default Subjects&quot; to get started
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(subjectsBySemester).map(
                      ([semester, semesterSubjects]: [string, any]) => (
                        <div key={semester}>
                          <div className="flex items-center gap-3 mb-3">
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-md">
                              Semester {semester}
                            </div>
                            <div className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-2 py-1 rounded-md text-xs font-medium">
                              {semesterSubjects.length} subjects
                            </div>
                          </div>

                          {/* Mobile Cards */}
                          <div className="block md:hidden space-y-3">
                            {semesterSubjects.map((subject: any) => (
                              <div
                                key={subject._id}
                                className="bg-gradient-to-r from-white to-blue-50/50 rounded-lg p-4 border border-blue-100 shadow-sm hover:shadow-md transition-shadow"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <h4 className="font-semibold text-gray-800">
                                    {subject.name}
                                  </h4>
                                  <div className="flex gap-1">
                                    <EditSubjectForm subject={subject} />
                                    <DeleteSubjectForm subject={subject} />
                                  </div>
                                </div>
                                <div className="text-sm text-gray-600 mb-2">
                                  <span className="font-mono bg-white px-2 py-1 rounded border border-blue-200 text-xs">
                                    {subject.code}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span
                                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                                      subject.branch === "Common"
                                        ? "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800"
                                        : subject.branch === "CSE"
                                          ? "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800"
                                          : subject.branch === "ECE"
                                            ? "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800"
                                            : subject.branch === "ME"
                                              ? "bg-gradient-to-r from-green-100 to-green-200 text-green-800"
                                              : subject.branch === "CE"
                                                ? "bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800"
                                                : "bg-gradient-to-r from-pink-100 to-pink-200 text-pink-800"
                                    }`}
                                  >
                                    {subject.branch || "Common"}
                                  </span>
                                  <span className="text-xs bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-2 py-1 rounded-full font-medium shadow-sm">
                                    {subject.credits} credits
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Desktop Table */}
                          <div className="hidden md:block bg-white/90 backdrop-blur-sm rounded-lg border border-blue-100 overflow-hidden shadow-sm">
                            <Table>
                              <TableHeader>
                                <TableRow className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
                                  <TableHead className="font-semibold text-blue-800">
                                    Subject Name
                                  </TableHead>
                                  <TableHead className="font-semibold text-blue-800">
                                    Code
                                  </TableHead>
                                  <TableHead className="font-semibold text-blue-800">
                                    Branch
                                  </TableHead>
                                  <TableHead className="text-center font-semibold text-blue-800">
                                    Credits
                                  </TableHead>
                                  <TableHead className="text-center font-semibold text-blue-800">
                                    Actions
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {semesterSubjects.map((subject: any) => (
                                  <TableRow
                                    key={subject._id}
                                    className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-colors"
                                  >
                                    <TableCell className="font-medium text-gray-800">
                                      {subject.name}
                                    </TableCell>
                                    <TableCell>
                                      <span className="font-mono text-sm bg-gradient-to-r from-blue-50 to-indigo-50 px-2 py-1 rounded border border-blue-200">
                                        {subject.code}
                                      </span>
                                    </TableCell>
                                    <TableCell>
                                      <span
                                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                                          subject.branch === "Common"
                                            ? "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800"
                                            : subject.branch === "CSE"
                                              ? "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800"
                                              : subject.branch === "ECE"
                                                ? "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800"
                                                : subject.branch === "ME"
                                                  ? "bg-gradient-to-r from-green-100 to-green-200 text-green-800"
                                                  : subject.branch === "CE"
                                                    ? "bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800"
                                                    : "bg-gradient-to-r from-pink-100 to-pink-200 text-pink-800"
                                        }`}
                                      >
                                        {subject.branch || "Common"}
                                      </span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                      <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">
                                        {subject.credits}
                                      </span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                      <div className="flex justify-center gap-1">
                                        <EditSubjectForm subject={subject} />
                                        <DeleteSubjectForm subject={subject} />
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
  );
}
