import DashboardNavbar from "@/components/dashboard-navbar";
import { Shield, Users, BookOpen, Plus, BarChart3 } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  addSubjectAction,
  getUserRole,
  verifyAdminPasscode,
} from "../../actions";
import { SubmitButton } from "@/components/submit-button";

interface AdminPageProps {
  searchParams: Promise<{
    passcode?: string;
    error?: string;
    success?: string;
  }>;
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const supabase = await createClient();
  const params = await searchParams;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Check if user is admin
  const userRole = await getUserRole();
  if (userRole !== "admin") {
    return redirect("/dashboard");
  }

  // Check if passcode verification is needed
  if (!params.passcode || params.passcode !== "12345") {
    return (
      <>
        <DashboardNavbar />
        <main className="w-full bg-gray-50 min-h-screen">
          <div className="container mx-auto px-4 py-8">
            <div className="flex min-h-[60vh] items-center justify-center">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-6 h-6 text-blue-600" />
                    Admin Access Required
                  </CardTitle>
                  <CardDescription>
                    Enter the admin passcode to access the admin panel
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form action={verifyAdminPasscode} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="passcode">Admin Passcode</Label>
                      <Input
                        id="passcode"
                        name="passcode"
                        type="password"
                        placeholder="Enter passcode"
                        required
                      />
                    </div>
                    {params.error && (
                      <div className="text-sm text-red-600">{params.error}</div>
                    )}
                    <SubmitButton className="w-full" pendingText="Verifying...">
                      Access Admin Panel
                    </SubmitButton>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </>
    );
  }

  // Get statistics
  const { data: users } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: subjects } = await supabase
    .from("subjects")
    .select("*")
    .order("semester", { ascending: true });

  const { data: grades } = await supabase.from("user_grades").select("*");

  const { data: cgpaData } = await supabase
    .from("cgpa_calculations")
    .select("*");

  const totalUsers = users?.length || 0;
  const totalSubjects = subjects?.length || 0;
  const totalGrades = grades?.length || 0;
  const avgCGPA =
    cgpaData && cgpaData.length > 0
      ? (
          cgpaData.reduce((sum, item) => sum + item.cgpa, 0) / cgpaData.length
        ).toFixed(2)
      : "0.00";

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold">Admin Panel</h1>
            </div>
            <p className="text-muted-foreground">
              Manage users, subjects, and view system analytics
            </p>
          </header>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  Registered students
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
                <div className="text-2xl font-bold">{totalSubjects}</div>
                <p className="text-xs text-muted-foreground">
                  Available subjects
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Grades
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalGrades}</div>
                <p className="text-xs text-muted-foreground">Grades recorded</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Average CGPA
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgCGPA}</div>
                <p className="text-xs text-muted-foreground">System average</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Add Subject Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add New Subject
                </CardTitle>
                <CardDescription>
                  Add a new subject to the curriculum
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form action={addSubjectAction} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Subject Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="e.g., Data Structures and Algorithms"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="code">Subject Code</Label>
                    <Input
                      id="code"
                      name="code"
                      placeholder="e.g., CS201"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="credits">Credits</Label>
                      <Select name="credits" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select credits" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Credit</SelectItem>
                          <SelectItem value="2">2 Credits</SelectItem>
                          <SelectItem value="3">3 Credits</SelectItem>
                          <SelectItem value="4">4 Credits</SelectItem>
                          <SelectItem value="5">5 Credits</SelectItem>
                          <SelectItem value="6">6 Credits</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="semester">Semester</Label>
                      <Select name="semester" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Sem." />
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

                  <Button type="submit" className="w-full">
                    Add Subject
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Recent Users */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Recent Users
                </CardTitle>
                <CardDescription>Latest registered users</CardDescription>
              </CardHeader>
              <CardContent>
                {!users || users.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No users registered yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {users.slice(0, 10).map((user: any) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">
                            {user.name || user.email?.split("@")[0]}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium capitalize">
                            {user.role || "student"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(user.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Subjects Table */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>All Subjects</CardTitle>
              <CardDescription>
                Complete list of subjects in the curriculum
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!subjects || subjects.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No subjects added yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead className="text-center">Credits</TableHead>
                      <TableHead className="text-center">Semester</TableHead>
                      <TableHead className="text-center">Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjects.map((subject: any) => (
                      <TableRow key={subject.id}>
                        <TableCell className="font-medium">
                          {subject.name}
                        </TableCell>
                        <TableCell>{subject.code}</TableCell>
                        <TableCell className="text-center">
                          {subject.credits}
                        </TableCell>
                        <TableCell className="text-center">
                          {subject.semester}
                        </TableCell>
                        <TableCell className="text-center">
                          {new Date(subject.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
