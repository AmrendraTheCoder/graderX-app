import DashboardNavbar from "@/components/dashboard-navbar";
import { BookOpen, ArrowLeft, TrendingUp } from "lucide-react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import { UserGrade, CGPACalculation, Subject } from "@/models";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

interface Props {
  params: Promise<{
    semesterId: string;
  }>;
}

export default async function SemesterDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  const { semesterId: semesterIdParam } = await params;
  const semesterId = parseInt(semesterIdParam);

  if (!session?.user) {
    return redirect("/sign-in");
  }

  await connectToDatabase();

  // Get grades for this semester
  const gradesRaw = await UserGrade.find({ 
    userId: session.user.id, 
    semester: semesterId 
  })
    .sort({ createdAt: 1 })
    .lean();

  // Populate subject details
  const gradesData = await Promise.all(
    gradesRaw.map(async (grade: any) => {
      const subject = await Subject.findById(grade.subjectId).lean();
      return {
        id: grade._id.toString(),
        grade: grade.grade,
        grade_points: grade.gradePoints,
        semester: grade.semester,
        academic_year: grade.academicYear,
        subjects: subject ? {
          name: subject.name,
          code: subject.code,
          credits: subject.credits,
        } : null,
      };
    })
  );

  // Get CGPA data for this semester
  const cgpaData = await CGPACalculation.findOne({
    userId: session.user.id,
    semester: semesterId,
  }).lean();

  if (!gradesData || gradesData.length === 0) {
    return (
      <>
        <DashboardNavbar />
        <main className="w-full bg-gray-50 min-h-screen">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
              <Link href="/dashboard/semesters">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Semesters
                </Button>
              </Link>
            </div>

            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No Data for Semester {semesterId}
                </h3>
                <p className="text-muted-foreground mb-4">
                  You haven't added any grades for this semester yet.
                </p>
                <Link href="/dashboard/grades">
                  <Button>Add Grades</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </main>
      </>
    );
  }

  // Calculate semester statistics
  let totalCredits = 0;
  let totalPoints = 0;
  let gradeDistribution: { [key: string]: number } = {};

  gradesData.forEach((grade: any) => {
    const credits = grade.subjects?.credits || 3;
    totalCredits += credits;
    totalPoints += grade.grade_points * credits;

    gradeDistribution[grade.grade] = (gradeDistribution[grade.grade] || 0) + 1;
  });

  const sgpa = totalCredits > 0 ? totalPoints / totalCredits : 0;

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link href="/dashboard/semesters">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Semesters
              </Button>
            </Link>
          </div>

          <header className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Semester {semesterId}</h1>
            <p className="text-muted-foreground">
              Detailed view of your academic performance
            </p>
          </header>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">SGPA</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {sgpa.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Semester Grade Point Average
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Credits
                </CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalCredits}</div>
                <p className="text-xs text-muted-foreground">
                  Credit hours completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Subjects</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{gradesData.length}</div>
                <p className="text-xs text-muted-foreground">
                  Subjects completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Performance
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {sgpa >= 8.5
                    ? "Excellent"
                    : sgpa >= 7.0
                      ? "Good"
                      : sgpa >= 6.0
                        ? "Average"
                        : "Poor"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Academic standing
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Grades Table */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Subject Grades</CardTitle>
                  <CardDescription>
                    All subjects and grades for Semester {semesterId}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead className="text-center">Credits</TableHead>
                        <TableHead className="text-center">Grade</TableHead>
                        <TableHead className="text-center">Points</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {gradesData.map((grade: any) => (
                        <TableRow key={grade.id}>
                          <TableCell className="font-medium">
                            {grade.subjects?.name || "Unknown Subject"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {grade.subjects?.code || "N/A"}
                          </TableCell>
                          <TableCell className="text-center">
                            {grade.subjects?.credits || 3}
                          </TableCell>
                          <TableCell className="text-center">
                            <span
                              className={`font-bold ${
                                grade.grade === "A+" || grade.grade === "A"
                                  ? "text-green-600"
                                  : grade.grade === "AB"
                                    ? "text-green-500"
                                    : grade.grade === "B+" || grade.grade === "B"
                                      ? "text-blue-600"
                                      : grade.grade === "BC"
                                        ? "text-blue-500"
                                        : grade.grade === "C+" || grade.grade === "C"
                                          ? "text-yellow-600"
                                          : grade.grade === "CD"
                                            ? "text-yellow-500"
                                            : grade.grade === "D"
                                              ? "text-orange-500"
                                              : "text-red-500"
                              }`}
                            >
                              {grade.grade}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            {grade.grade_points?.toFixed(1) || "0.0"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {/* Grade Distribution */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Grade Distribution</CardTitle>
                  <CardDescription>
                    Breakdown of grades received
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(gradeDistribution)
                      .sort(([a], [b]) => {
                        const gradeOrder = [
                          "A+",
                          "A",
                          "AB",
                          "B+",
                          "B",
                          "BC",
                          "C+",
                          "C",
                          "CD",
                          "D",
                          "F",
                        ];
                        return gradeOrder.indexOf(a) - gradeOrder.indexOf(b);
                      })
                      .map(([grade, count]) => (
                        <div
                          key={grade}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-bold ${
                                grade === "A+" || grade === "A"
                                  ? "text-green-600"
                                  : grade === "AB"
                                    ? "text-green-500"
                                    : grade === "B+" || grade === "B"
                                      ? "text-blue-600"
                                      : grade === "BC"
                                        ? "text-blue-500"
                                        : grade === "C+" || grade === "C"
                                          ? "text-yellow-600"
                                          : grade === "CD"
                                            ? "text-yellow-500"
                                            : grade === "D"
                                              ? "text-orange-500"
                                              : "text-red-500"
                              }`}
                            >
                              {grade}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  grade === "A+" || grade === "A"
                                    ? "bg-green-600"
                                    : grade === "AB"
                                      ? "bg-green-500"
                                      : grade === "B+" || grade === "B"
                                        ? "bg-blue-600"
                                        : grade === "BC"
                                          ? "bg-blue-500"
                                          : grade === "C+" || grade === "C"
                                            ? "bg-yellow-600"
                                            : grade === "CD"
                                              ? "bg-yellow-500"
                                              : grade === "D"
                                                ? "bg-orange-500"
                                                : "bg-red-500"
                                }`}
                                style={{
                                  width: `${(count / gradesData.length) * 100}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{count}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/dashboard/grades">
                    <Button className="w-full">Add More Grades</Button>
                  </Link>
                  <Link href="/dashboard/calculator">
                    <Button variant="outline" className="w-full">
                      Use Calculator
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
