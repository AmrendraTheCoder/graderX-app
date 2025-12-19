import DashboardNavbar from "@/components/dashboard-navbar";
import { BookOpen, TrendingUp, Calendar } from "lucide-react";
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
import Link from "next/link";

export default async function SemestersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Get semester-wise CGPA data
  const { data: cgpaData } = await supabase
    .from("cgpa_calculations")
    .select("*")
    .eq("user_id", user.id)
    .order("semester", { ascending: true });

  // Get grades grouped by semester
  const { data: gradesData } = await supabase
    .from("user_grades")
    .select(
      `
      *,
      subjects:subject_id (
        name,
        code,
        credits
      )
    `,
    )
    .eq("user_id", user.id)
    .order("semester", { ascending: true });

  // Group grades by semester
  const semesterGroups =
    gradesData?.reduce((acc: any, grade: any) => {
      const semester = grade.semester;
      if (!acc[semester]) {
        acc[semester] = [];
      }
      acc[semester].push(grade);
      return acc;
    }, {}) || {};

  const semesters = Object.keys(semesterGroups)
    .map((sem) => parseInt(sem))
    .sort((a, b) => a - b);

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Semester Overview</h1>
            <p className="text-muted-foreground">
              View your academic performance across all semesters
            </p>
          </header>

          {semesters.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Semester Data</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't added any grades yet.
                </p>
                <Link href="/dashboard/grades">
                  <Button>Add Your First Grade</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Overall Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Overall CGPA
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {cgpaData && cgpaData.length > 0
                        ? cgpaData[cgpaData.length - 1].cgpa.toFixed(2)
                        : "0.00"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Out of 10.00
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Completed Semesters
                    </CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{semesters.length}</div>
                    <p className="text-xs text-muted-foreground">
                      Semesters with grades
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Subjects
                    </CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {gradesData?.length || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Subjects completed
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Semester Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {semesters.map((semester) => {
                  const semesterGrades = semesterGroups[semester];
                  const semesterCGPA = cgpaData?.find(
                    (c) => c.semester === semester,
                  );

                  // Calculate SGPA for this semester
                  let totalCredits = 0;
                  let totalPoints = 0;

                  semesterGrades.forEach((grade: any) => {
                    const credits = grade.subjects?.credits || 3;
                    totalCredits += credits;
                    totalPoints += grade.grade_points * credits;
                  });

                  const sgpa =
                    totalCredits > 0 ? totalPoints / totalCredits : 0;

                  return (
                    <Card
                      key={semester}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>Semester {semester}</span>
                          <span className="text-lg font-bold text-blue-600">
                            {sgpa.toFixed(2)}
                          </span>
                        </CardTitle>
                        <CardDescription>
                          {semesterGrades.length} subjects • {totalCredits}{" "}
                          credits
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 mb-4">
                          {semesterGrades.slice(0, 3).map((grade: any) => (
                            <div
                              key={grade.id}
                              className="flex justify-between text-sm"
                            >
                              <span className="truncate">
                                {grade.subjects?.name}
                              </span>
                              <span className="font-medium">{grade.grade}</span>
                            </div>
                          ))}
                          {semesterGrades.length > 3 && (
                            <p className="text-xs text-muted-foreground">
                              +{semesterGrades.length - 3} more subjects
                            </p>
                          )}
                        </div>
                        <Link href={`/dashboard/semester/${semester}`}>
                          <Button variant="outline" className="w-full">
                            View Details
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
