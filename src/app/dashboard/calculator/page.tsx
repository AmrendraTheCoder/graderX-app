import DashboardNavbar from "@/components/dashboard-navbar";
import { Calculator } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "../../../../supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CGPACalculatorClient } from "@/components/cgpa-calculator-client";

export default async function CGPACalculator() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Get existing grades for CGPA calculation
  const { data: existingGrades } = await supabase
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
    .eq("user_id", user.id);

  const { data: subjects } = await supabase
    .from("subjects")
    .select("*")
    .order("semester", { ascending: true });

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold mb-2">CGPA Calculator</h1>
            <p className="text-muted-foreground">
              Calculate your expected SGPA and CGPA based on grades
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Calculator Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5" />
                    Grade Calculator
                  </CardTitle>
                  <CardDescription>
                    Add subjects and grades to calculate your SGPA/CGPA
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CGPACalculatorClient existingGrades={existingGrades || []} />
                </CardContent>
              </Card>
            </div>

            {/* Existing Grades Summary */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Your Current Grades</CardTitle>
                  <CardDescription>Previously recorded grades</CardDescription>
                </CardHeader>
                <CardContent>
                  {!existingGrades || existingGrades.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        No grades recorded yet
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Add grades in the Manage Grades section
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {existingGrades.map((grade: any) => (
                        <div
                          key={grade.id}
                          className="flex items-center justify-between p-2 bg-muted/50 rounded"
                        >
                          <div>
                            <p className="font-medium text-sm">
                              {grade.subjects?.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {grade.subjects?.credits} credits • Sem{" "}
                              {grade.semester}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{grade.grade}</p>
                            <p className="text-xs text-muted-foreground">
                              {grade.grade_points} pts
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Grade Scale</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>A+</span>
                      <span>10.0 points</span>
                    </div>
                    <div className="flex justify-between">
                      <span>A</span>
                      <span>9.0 points</span>
                    </div>
                    <div className="flex justify-between">
                      <span>B+</span>
                      <span>8.0 points</span>
                    </div>
                    <div className="flex justify-between">
                      <span>B</span>
                      <span>7.0 points</span>
                    </div>
                    <div className="flex justify-between">
                      <span>C+</span>
                      <span>6.0 points</span>
                    </div>
                    <div className="flex justify-between">
                      <span>C</span>
                      <span>5.0 points</span>
                    </div>
                    <div className="flex justify-between">
                      <span>D</span>
                      <span>4.0 points</span>
                    </div>
                    <div className="flex justify-between">
                      <span>F</span>
                      <span>0.0 points</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
