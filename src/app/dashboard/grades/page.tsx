import DashboardNavbar from "@/components/dashboard-navbar";
import { Plus, BookOpen } from "lucide-react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import { Subject, UserGrade } from "@/models";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { addGradeAction } from "../../actions";
import { SubmitButton } from "@/components/submit-button";
import { InfoMessage } from "@/components/info-message";

interface SearchParams {
  message?: string;
  error?: string;
}

export default async function GradesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await getServerSession(authOptions);
  const params = await searchParams;

  if (!session?.user) {
    return redirect("/sign-in");
  }

  await connectToDatabase();

  // Get available subjects
  const subjects = await Subject.find({}).sort({ semester: 1 }).lean();

  // Get user's existing grades with subject details
  const userGrades = await UserGrade.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .lean();

  // Populate subject details for each grade
  const populatedGrades = await Promise.all(
    userGrades.map(async (grade: any) => {
      const subject = await Subject.findById(grade.subjectId).lean();
      return {
        ...grade,
        _id: grade._id.toString(),
        subjects: subject ? {
          name: subject.name,
          code: subject.code,
          credits: subject.credits,
        } : null,
      };
    })
  );

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Manage Grades</h1>
            <p className="text-muted-foreground">
              Add and update your subject grades
            </p>
          </header>

          {/* Success/Error Messages */}
          {params.message && (
            <div className="mb-6">
              <InfoMessage type="success" message={params.message} />
            </div>
          )}
          {params.error && (
            <div className="mb-6">
              <InfoMessage type="error" message={params.error} />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Add Grade Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add New Grade
                </CardTitle>
                <CardDescription>
                  Select a subject and enter your grade
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form action={addGradeAction} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subjectId">Subject</Label>
                    <Select name="subjectId" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects?.map((subject: any) => (
                          <SelectItem key={subject._id.toString()} value={subject._id.toString()}>
                            {subject.name} ({subject.code}) - {subject.credits}{" "}
                            credits
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="semester">Semester</Label>
                      <Select name="semester" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select semester" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                            <SelectItem key={sem} value={sem.toString()}>
                              Semester {sem}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="academicYear">Academic Year</Label>
                      <Select name="academicYear" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2024-25">2024-25</SelectItem>
                          <SelectItem value="2023-24">2023-24</SelectItem>
                          <SelectItem value="2022-23">2022-23</SelectItem>
                          <SelectItem value="2021-22">2021-22</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="grade">Grade</Label>
                    <Select name="grade" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A (10.0 points)</SelectItem>
                        <SelectItem value="AB">AB (9.0 points)</SelectItem>
                        <SelectItem value="B">B (8.0 points)</SelectItem>
                        <SelectItem value="BC">BC (7.0 points)</SelectItem>
                        <SelectItem value="C">C (6.0 points)</SelectItem>
                        <SelectItem value="CD">CD (5.0 points)</SelectItem>
                        <SelectItem value="D">D (4.0 points)</SelectItem>
                        <SelectItem value="F">F (0.0 points)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <SubmitButton
                    className="w-full"
                    pendingText="Adding Grade..."
                  >
                    Add Grade
                  </SubmitButton>
                </form>
              </CardContent>
            </Card>

            {/* Existing Grades */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Your Grades
                </CardTitle>
                <CardDescription>Recently added grades</CardDescription>
              </CardHeader>
              <CardContent>
                {!populatedGrades || populatedGrades.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No grades added yet</p>
                    <p className="text-sm text-muted-foreground">
                      Add your first grade using the form
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {populatedGrades.map((grade: any) => (
                      <div
                        key={grade._id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{grade.subjects?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {grade.subjects?.code} • Semester {grade.semester} •{" "}
                            {grade.academicYear}
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-bold text-lg ${
                              grade.grade === "A"
                                ? "text-green-600"
                                : grade.grade === "AB"
                                  ? "text-green-500"
                                  : grade.grade === "B"
                                    ? "text-blue-600"
                                    : grade.grade === "BC"
                                      ? "text-blue-500"
                                      : grade.grade === "C"
                                        ? "text-yellow-600"
                                        : grade.grade === "CD"
                                          ? "text-yellow-500"
                                          : grade.grade === "D"
                                            ? "text-orange-500"
                                            : "text-red-500"
                            }`}
                          >
                            {grade.grade}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {grade.gradePoints} points
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          {populatedGrades && populatedGrades.length > 0 && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Grade Statistics</CardTitle>
                <CardDescription>Your grade summary</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">
                      A Grades
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {populatedGrades.filter((g: any) => g.grade === "A").length}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">
                      AB Grades
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {populatedGrades.filter((g: any) => g.grade === "AB").length}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">
                      Total Subjects
                    </p>
                    <p className="text-2xl font-bold text-purple-600">
                      {populatedGrades.length}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">
                      Avg. Points
                    </p>
                    <p className="text-2xl font-bold text-gray-600">
                      {(
                        populatedGrades.reduce(
                          (sum: number, g: any) => sum + (g.gradePoints || 0),
                          0
                        ) / populatedGrades.length
                      ).toFixed(1)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </>
  );
}
