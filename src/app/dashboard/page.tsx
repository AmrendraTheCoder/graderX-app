import DashboardNavbar from "@/components/dashboard-navbar";
import {
  InfoIcon,
  Calculator,
  BookOpen,
  Settings,
  Shield,
  Users,
  BarChart3,
  TrendingUp,
  Calendar,
  Bell,
  MessageSquare,
  FileText,
} from "lucide-react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import { User, Subject, UserGrade, CGPACalculation } from "@/models";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { QuickGradeCalculator } from "@/components/quick-grade-calculator";
import { Badge } from "@/components/ui/badge";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return redirect("/sign-in");
  }

  await connectToDatabase();

  // Get user data
  const userData = await User.findById(session.user.id);
  if (!userData) {
    return redirect("/sign-in");
  }

  const userRole = userData.role || "student";

  // If admin, show admin dashboard
  if (userRole === "admin") {
    const totalUsers = await User.countDocuments();
    const totalSubjects = await Subject.countDocuments();
    const totalGrades = await UserGrade.countDocuments();
    const cgpaData = await CGPACalculation.find({ semester: 0 });
    const avgCGPA =
      cgpaData && cgpaData.length > 0
        ? (cgpaData.reduce((sum, item) => sum + item.cgpa, 0) / cgpaData.length).toFixed(2)
        : "0.00";

    return (
      <>
        <DashboardNavbar />
        <main className="w-full bg-gray-50 min-h-screen">
          <div className="container mx-auto px-4 py-8">
            <header className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              </div>
              <p className="text-muted-foreground">
                Welcome, {userData.name || session.user.email?.split("@")[0]}! Manage
                the LNMIIT grading system.
              </p>
            </header>

            {/* Admin Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalUsers}</div>
                  <p className="text-xs text-muted-foreground">Registered students</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalSubjects}</div>
                  <p className="text-xs text-muted-foreground">Available subjects</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Grades</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalGrades}</div>
                  <p className="text-xs text-muted-foreground">Grades recorded</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average CGPA</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{avgCGPA}</div>
                  <p className="text-xs text-muted-foreground">System average</p>
                </CardContent>
              </Card>
            </div>

            {/* Admin Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <Link href="/admin">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Manage Subjects
                    </CardTitle>
                    <CardDescription>
                      Add, edit, and organize subjects by semester
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">Manage Subjects</Button>
                  </CardContent>
                </Link>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    View Users
                    <Badge variant="secondary" className="ml-auto">
                      Coming Soon
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Monitor student registrations and activity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" disabled>
                    View All Users
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Analytics
                    <Badge variant="secondary" className="ml-auto">
                      Coming Soon
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    View system performance and grade statistics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" disabled>
                    View Analytics
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </>
    );
  }

  // Student dashboard
  const cgpaData = await CGPACalculation.find({ userId: session.user.id })
    .sort({ semester: -1 })
    .limit(1);

  const gradesData = await UserGrade.find({ userId: session.user.id })
    .populate("subjectId")
    .sort({ semester: -1 });

  const currentCGPA = cgpaData?.[0]?.cgpa || 0;
  const totalSubjects = gradesData?.length || 0;
  const currentSemester = userData.currentSemester || 1;
  const currentAcademicYear = userData.currentAcademicYear || "2024-25";

  // Serialize for client components
  const serializedGrades = JSON.parse(JSON.stringify(gradesData));

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
          {/* Header Section */}
          <header className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">
                  Welcome back, {userData.name || session.user.email?.split("@")[0]}
                </h1>
                <p className="text-muted-foreground">
                  Semester {currentSemester} • {currentAcademicYear} • Track
                  your academic progress at LNMIIT
                </p>
              </div>
            </div>
          </header>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current CGPA</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentCGPA.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Out of 10.00</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalSubjects}</div>
                <p className="text-xs text-muted-foreground">Subjects completed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Grade Status</CardTitle>
                <InfoIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {currentCGPA >= 8.5
                    ? "Excellent"
                    : currentCGPA >= 7.0
                      ? "Good"
                      : currentCGPA >= 6.0
                        ? "Average"
                        : "Needs Improvement"}
                </div>
                <p className="text-xs text-muted-foreground">Academic performance</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Grade Calculator */}
          <Card className="border-2 border-blue-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50">
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-6 h-6 text-blue-600" />⚡ Quick Grade
                Calculator
              </CardTitle>
              <CardDescription>
                Instantly calculate your SGPA/CGPA by adding subjects and grades
                below
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <QuickGradeCalculator existingGrades={serializedGrades} />
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <Link href="/dashboard/calculator">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5" />
                    Advanced Calculator
                  </CardTitle>
                  <CardDescription>
                    Use the full-featured CGPA calculator with more options
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Open Advanced Calculator</Button>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <Link href="/dashboard/grades">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Manage Grades
                  </CardTitle>
                  <CardDescription>
                    Add or update your subject grades permanently
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Manage Grades
                  </Button>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <Link href="/dashboard/semesters">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    View Semesters
                  </CardTitle>
                  <CardDescription>
                    Browse your semester-wise performance history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    View Semesters
                  </Button>
                </CardContent>
              </Link>
            </Card>
          </div>

          {/* Coming Soon Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Coming Soon Features
              </CardTitle>
              <CardDescription>
                Exciting new features we&apos;re working on for you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <h4 className="font-medium text-blue-900">Study Groups</h4>
                    <Badge variant="outline" className="ml-auto">
                      Coming Soon
                    </Badge>
                  </div>
                  <p className="text-sm text-blue-700">
                    Connect with classmates and form study groups for better
                    collaboration
                  </p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-green-600" />
                    <h4 className="font-medium text-green-900">Grade Reports</h4>
                    <Badge variant="outline" className="ml-auto">
                      Coming Soon
                    </Badge>
                  </div>
                  <p className="text-sm text-green-700">
                    Generate detailed academic reports and transcripts
                  </p>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    <h4 className="font-medium text-purple-900">Goal Tracking</h4>
                    <Badge variant="outline" className="ml-auto">
                      Coming Soon
                    </Badge>
                  </div>
                  <p className="text-sm text-purple-700">
                    Set academic goals and track your progress over time
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Grades */}
          {serializedGrades && serializedGrades.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Grades</CardTitle>
                <CardDescription>Your latest subject grades</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {serializedGrades.slice(0, 5).map((grade: any) => (
                    <div
                      key={grade._id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{grade.subjectId?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {grade.subjectId?.code} • Semester {grade.semester} •{" "}
                          {grade.academicYear}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{grade.grade}</p>
                        <p className="text-sm text-muted-foreground">
                          {grade.gradePoints} points
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </>
  );
}
