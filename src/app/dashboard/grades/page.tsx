import DashboardNavbar from "@/components/dashboard-navbar";
import { Plus, BookOpen } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "../../../../supabase/server";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const supabase = await createClient();
  const params = await searchParams;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Get available subjects
  const { data: subjects } = await supabase
    .from("subjects")
    .select("*")
    .order("semester", { ascending: true });

  // Get user's existing grades
  const { data: userGrades } = await supabase
    .from("user_grades")
    .select(
      `
      *,
      subjects:subject_id (
        name,
        code,
        credits
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

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
                        {subjects?.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
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
                {!userGrades || userGrades.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No grades added yet</p>
                    <p className="text-sm text-muted-foreground">
                      Add your first grade using the form
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {userGrades.map((grade: any) => (
                      <div
                        key={grade.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{grade.subjects?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {grade.subjects?.code} • Semester {grade.semester} •{" "}
                            {grade.academic_year}
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
                            {grade.grade_points} points
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
          {userGrades && userGrades.length > 0 && (
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
                      {userGrades.filter((g: any) => g.grade === "A").length}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">
                      AB Grades
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {userGrades.filter((g: any) => g.grade === "AB").length}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">
                      Total Subjects
                    </p>
                    <p className="text-2xl font-bold text-purple-600">
                      {userGrades.length}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">
                      Avg. Points
                    </p>
                    <p className="text-2xl font-bold text-gray-600">
                      {(
                        userGrades.reduce(
                          (sum: number, g: any) => sum + g.grade_points,
                          0
                        ) / userGrades.length
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
