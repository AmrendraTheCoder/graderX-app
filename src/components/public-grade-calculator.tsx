"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Calculator,
  Plus,
  Trash2,
  BookOpen,
  Users,
  RotateCcw,
  Trophy,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

interface Subject {
  id: string;
  name: string;
  code: string;
  credits: number;
  semester: number;
  branch?: string;
}

interface GradeRow {
  id: number;
  subjectId: string;
  subject: string;
  credits: number;
  grade: string;
  points: number;
}

interface PublicGradeCalculatorProps {
  subjects: Subject[];
}

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

const branches = [
  { value: "CSE", label: "Computer Science & Engineering" },
  { value: "ECE", label: "Electronics & Communication Engineering" },
  { value: "ME", label: "Mechanical Engineering" },
  { value: "CCE", label: "Computer & Communication Engineering" },
  { value: "Other", label: "Other" },
];

export function PublicGradeCalculator({
  subjects,
}: PublicGradeCalculatorProps) {
  const [selectedBranch, setSelectedBranch] = useState<string>("CSE");
  const [selectedSemester, setSelectedSemester] = useState<string>("1");
  const [selectedAcademicYear, setSelectedAcademicYear] =
    useState<string>("2024-25");
  const [grades, setGrades] = useState<GradeRow[]>([]);
  const [results, setResults] = useState({
    sgpa: 0,
    totalCredits: 0,
    totalPoints: 0,
  });

  // Refs for auto-scrolling
  const gradeCardRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  // Track newly added grade for auto-scroll
  const [newlyAddedGradeId, setNewlyAddedGradeId] = useState<number | null>(
    null
  );

  // Academic year options
  const academicYears = useMemo(
    () => ["2024-25", "2023-24", "2022-23", "2021-22", "2020-21"],
    []
  );

  // Memoize semesterSubjects to prevent infinite loops and filter by branch
  const semesterSubjects = useMemo(() => {
    const filtered =
      subjects?.filter(
        (subject) =>
          subject.semester === parseInt(selectedSemester) &&
          (subject.branch === selectedBranch ||
            subject.branch === "Common" ||
            !subject.branch)
      ) || [];

    return filtered;
  }, [subjects, selectedSemester, selectedBranch]);

  // Memoize calculation function
  const calculateResults = useCallback(() => {
    let totalCredits = 0;
    let totalPoints = 0;

    grades.forEach((grade) => {
      if (grade.grade && grade.credits > 0) {
        totalCredits += grade.credits;
        totalPoints += grade.points * grade.credits;
      }
    });

    const sgpa = totalCredits > 0 ? totalPoints / totalCredits : 0;

    setResults({
      sgpa,
      totalCredits,
      totalPoints,
    });
  }, [grades]);

  // Initialize with semester subjects when semester or branch changes
  useEffect(() => {
    if (semesterSubjects.length > 0) {
      const initialGrades = semesterSubjects.map((subject, index) => ({
        id: index + 1,
        subjectId: subject.id,
        subject: subject.name,
        credits: subject.credits,
        grade: "",
        points: 0,
      }));
      setGrades(initialGrades);
    } else {
      // If no subjects for semester, start with one empty row for manual entry
      setGrades([
        { id: 1, subjectId: "", subject: "", credits: 3, grade: "", points: 0 },
      ]);
    }
  }, [semesterSubjects]);

  // Recalculate when grades change
  useEffect(() => {
    calculateResults();
  }, [calculateResults]);

  const addGradeRow = useCallback(() => {
    setGrades((prev) => {
      const newId =
        prev.length > 0 ? Math.max(...prev.map((g) => g.id)) + 1 : 1;

      // Set the newly added grade ID for useEffect backup scroll
      setNewlyAddedGradeId(newId);

      const newGrades = [
        ...prev,
        {
          id: newId,
          subjectId: "",
          subject: "",
          credits: 3,
          grade: "",
          points: 0,
        },
      ];

      // More robust auto-scroll for production
      const scrollToNewCard = (retryCount = 0) => {
        const newCardElement = gradeCardRefs.current[newId];

        if (newCardElement) {
          // Method 1: Standard scrollIntoView
          try {
            newCardElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          } catch (e) {
            console.log("ScrollIntoView failed, trying alternative method");
          }

          // Method 2: Fallback scroll to bottom of page
          setTimeout(() => {
            try {
              const rect = newCardElement.getBoundingClientRect();
              const scrollTop =
                window.pageYOffset || document.documentElement.scrollTop;
              const targetY = rect.top + scrollTop - window.innerHeight / 2;

              window.scrollTo({
                top: Math.max(0, targetY),
                behavior: "smooth",
              });
            } catch (e) {
              // Final fallback - scroll to bottom
              window.scrollTo({
                top: document.body.scrollHeight,
                behavior: "smooth",
              });
            }
          }, 200);

          // Focus on the subject input field
          setTimeout(() => {
            const subjectInput = newCardElement.querySelector(
              'input[placeholder="Enter subject name"]'
            ) as HTMLInputElement;
            if (subjectInput) {
              subjectInput.focus();
            }
          }, 500);
        } else if (retryCount < 3) {
          // Retry if element not found (up to 3 times)
          setTimeout(() => scrollToNewCard(retryCount + 1), 200);
        } else {
          // Final fallback - just scroll to bottom
          setTimeout(() => {
            window.scrollTo({
              top: document.body.scrollHeight,
              behavior: "smooth",
            });
          }, 100);
        }
      };

      // Start scroll process with longer initial delay for production
      setTimeout(() => scrollToNewCard(), 300);

      return newGrades;
    });
  }, []);

  const removeGradeRow = useCallback((id: number) => {
    setGrades((prev) =>
      prev.length > 1 ? prev.filter((g) => g.id !== id) : prev
    );
  }, []);

  const updateGrade = useCallback(
    (id: number, field: keyof GradeRow, value: string | number) => {
      setGrades((prev) =>
        prev.map((g) => {
          if (g.id === id) {
            const updated = { ...g, [field]: value };

            // Update points when grade changes
            if (field === "grade" && typeof value === "string") {
              updated.points = value
                ? gradePoints[value as keyof typeof gradePoints] || 0
                : 0;
            }

            // Allow manual credits update only for custom subjects (no subjectId)
            if (field === "credits" && !g.subjectId) {
              updated.credits =
                typeof value === "number"
                  ? value
                  : parseInt(value.toString()) || 3;
            }

            return updated;
          }
          return g;
        })
      );
    },
    []
  );

  const resetCalculator = useCallback(() => {
    if (semesterSubjects.length > 0) {
      const initialGrades = semesterSubjects.map((subject, index) => ({
        id: index + 1,
        subjectId: subject.id,
        subject: subject.name,
        credits: subject.credits,
        grade: "",
        points: 0,
      }));
      setGrades(initialGrades);
    } else {
      setGrades([
        { id: 1, subjectId: "", subject: "", credits: 3, grade: "", points: 0 },
      ]);
    }
  }, [semesterSubjects]);

  // Auto-scroll effect for newly added grades (backup method)
  useEffect(() => {
    if (newlyAddedGradeId && gradeCardRefs.current[newlyAddedGradeId]) {
      const scrollToElement = () => {
        const element = gradeCardRefs.current[newlyAddedGradeId];
        if (element) {
          try {
            element.scrollIntoView({
              behavior: "smooth",
              block: "center",
              inline: "nearest",
            });
          } catch (e) {
            // Fallback scroll method
            const rect = element.getBoundingClientRect();
            const scrollTop =
              window.pageYOffset || document.documentElement.scrollTop;
            const targetY = rect.top + scrollTop - window.innerHeight / 2;

            window.scrollTo({
              top: Math.max(0, targetY),
              behavior: "smooth",
            });
          }
        }
      };

      // Multiple attempts with increasing delays for production
      setTimeout(scrollToElement, 100);
      setTimeout(scrollToElement, 300);
      setTimeout(scrollToElement, 600);

      // Clear the flag after scrolling
      setTimeout(() => setNewlyAddedGradeId(null), 1000);
    }
  }, [newlyAddedGradeId, grades.length]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className="pb-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-3 rounded-xl">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  SGPA Calculator
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Calculate your semester grade point average instantly
                </CardDescription>
              </div>
            </div>
            <div className="w-full sm:w-auto">
              <div className="flex flex-wrap gap-2">
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  📱 Mobile Friendly
                </div>
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  🔒 No Registration Required
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          {/* Selection Controls - Mobile Optimized */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Branch
              </label>
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger className="h-12 text-left">
                  <SelectValue placeholder="Select Branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.value} value={branch.value}>
                      <div className="text-left">
                        <div className="font-medium">{branch.value}</div>
                        <div className="text-xs text-gray-500 truncate">
                          {branch.label}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Academic Year
              </label>
              <Select
                value={selectedAcademicYear}
                onValueChange={setSelectedAcademicYear}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Semester
              </label>
              <Select
                value={selectedSemester}
                onValueChange={setSelectedSemester}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select Semester" />
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
          </div>

          {/* Mobile-First Grade Entry */}
          <div className="space-y-4 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Enter Your Grades
              </h3>
              <div className="text-sm text-gray-600">
                {semesterSubjects.length} subjects available for{" "}
                {selectedBranch} • Semester {selectedSemester}
                {semesterSubjects.length > 0 && (
                  <span className="text-xs text-gray-500 block">
                    (Includes {selectedBranch} subjects + Common subjects)
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <Button
                  onClick={addGradeRow}
                  size="sm"
                  variant="outline"
                  className="flex-1 sm:flex-none"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Subject
                </Button>
                <Button
                  onClick={resetCalculator}
                  size="sm"
                  variant="outline"
                  className="flex-1 sm:flex-none"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>

            {/* Mobile-Optimized Grade Cards */}
            <div className="space-y-3">
              {semesterSubjects.length === 0 && subjects?.length === 0 ? (
                <Card className="border-2 border-dashed border-gray-300">
                  <CardContent className="p-8 text-center">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No Subjects in Database
                    </h3>
                    <p className="text-gray-600 mb-4">
                      The subjects database needs to be initialized with LNMIIT
                      curriculum data.
                    </p>
                    <div className="space-y-3">
                      <p className="text-sm text-gray-500">
                        To initialize subjects:
                      </p>
                      <ol className="text-sm text-gray-600 text-left max-w-sm mx-auto space-y-1">
                        <li>
                          1.{" "}
                          <Link
                            href="/sign-up"
                            className="text-blue-600 hover:underline"
                          >
                            Create an account
                          </Link>
                        </li>
                        <li>
                          2.{" "}
                          <Link
                            href="/admin-access"
                            className="text-blue-600 hover:underline"
                          >
                            Get admin access
                          </Link>{" "}
                          with passcode
                        </li>
                        <li>3. Initialize default LNMIIT subjects</li>
                      </ol>
                      <div className="pt-2">
                        <Link href="/admin-access">
                          <Button variant="outline" size="sm">
                            <Users className="w-4 h-4 mr-2" />
                            Get Admin Access
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : semesterSubjects.length === 0 ? (
                <Card className="border-2 border-dashed border-gray-300">
                  <CardContent className="p-8 text-center">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No Subjects Available
                    </h3>
                    <p className="text-gray-600 mb-4">
                      No subjects found for <strong>{selectedBranch}</strong> in{" "}
                      <strong>Semester {selectedSemester}</strong>.
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      Try selecting a different branch or semester, or add
                      subjects manually below.
                    </p>
                    <Button onClick={addGradeRow} variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Custom Subject
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                grades.map((grade) => (
                  <Card
                    key={grade.id}
                    ref={(el) => {
                      gradeCardRefs.current[grade.id] = el;
                    }}
                    className={`border border-gray-200 shadow-sm ${
                      newlyAddedGradeId === grade.id
                        ? "ring-2 ring-blue-500 ring-opacity-50 bg-blue-50/30"
                        : ""
                    }`}
                  >
                    <CardContent className="p-4">
                      {/* Mobile Layout - Stacked */}
                      <div className="space-y-3">
                        {/* Pre-populated subject (read-only) */}
                        {grade.subjectId ? (
                          <>
                            {/* Subject Info Display */}
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium text-gray-900">
                                    {grade.subject}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    Credits: {grade.credits} •{" "}
                                    {selectedBranch === "Common"
                                      ? "All Branches"
                                      : selectedBranch}{" "}
                                    Subject
                                  </p>
                                </div>
                                <div className="text-right">
                                  <span className="text-xs text-gray-500">
                                    Semester {selectedSemester}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Grade Selection Only */}
                            <div className="grid grid-cols-12 gap-3 items-end">
                              <div className="col-span-9 space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                  Select Your Grade
                                </label>
                                <Select
                                  value={grade.grade}
                                  onValueChange={(value) =>
                                    updateGrade(grade.id, "grade", value)
                                  }
                                >
                                  <SelectTrigger className="h-11">
                                    <SelectValue placeholder="Choose Grade" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="A">A (10.0)</SelectItem>
                                    <SelectItem value="AB">AB (9.0)</SelectItem>
                                    <SelectItem value="B">B (8.0)</SelectItem>
                                    <SelectItem value="BC">BC (7.0)</SelectItem>
                                    <SelectItem value="C">C (6.0)</SelectItem>
                                    <SelectItem value="CD">CD (5.0)</SelectItem>
                                    <SelectItem value="D">D (4.0)</SelectItem>
                                    <SelectItem value="F">F (0.0)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="col-span-3 flex justify-end">
                                <div className="text-center">
                                  <div className="text-lg font-bold text-blue-600">
                                    {grade.points || "0"}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Points
                                  </div>
                                </div>
                              </div>
                            </div>
                          </>
                        ) : (
                          /* Manual subject entry (editable) */
                          <>
                            {/* Row 1: Subject Selection */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">
                                Custom Subject
                              </label>
                              <Input
                                placeholder="Enter subject name"
                                value={grade.subject}
                                onChange={(e) =>
                                  updateGrade(
                                    grade.id,
                                    "subject",
                                    e.target.value
                                  )
                                }
                                className="h-11"
                              />
                            </div>

                            {/* Row 2: Credits, Grade, and Actions */}
                            <div className="grid grid-cols-12 gap-3 items-end">
                              <div className="col-span-4 space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                  Credits
                                </label>
                                <Input
                                  type="number"
                                  step="0.5"
                                  min="1"
                                  max="6"
                                  value={grade.credits}
                                  onChange={(e) =>
                                    updateGrade(
                                      grade.id,
                                      "credits",
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                  className="h-11"
                                />
                              </div>

                              <div className="col-span-5 space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                  Grade
                                </label>
                                <Select
                                  value={grade.grade}
                                  onValueChange={(value) =>
                                    updateGrade(grade.id, "grade", value)
                                  }
                                >
                                  <SelectTrigger className="h-11">
                                    <SelectValue placeholder="Grade" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="A">A (10.0)</SelectItem>
                                    <SelectItem value="AB">AB (9.0)</SelectItem>
                                    <SelectItem value="B">B (8.0)</SelectItem>
                                    <SelectItem value="BC">BC (7.0)</SelectItem>
                                    <SelectItem value="C">C (6.0)</SelectItem>
                                    <SelectItem value="CD">CD (5.0)</SelectItem>
                                    <SelectItem value="D">D (4.0)</SelectItem>
                                    <SelectItem value="F">F (0.0)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="col-span-3 flex justify-end">
                                <Button
                                  onClick={() => removeGradeRow(grade.id)}
                                  size="sm"
                                  variant="outline"
                                  disabled={grades.length <= 1}
                                  className="h-11 w-11 p-0"
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </div>
                            </div>
                          </>
                        )}

                        {/* Grade Points Display */}
                        {grade.grade && grade.subjectId && (
                          <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            Points: {grade.points} × {grade.credits} credits ={" "}
                            {grade.points * grade.credits} total points
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Results Section - Mobile Optimized */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 sm:p-6">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                📊 Your Results
              </h3>
              <p className="text-gray-600 text-sm">
                Calculated for {selectedBranch} • Semester {selectedSemester} •{" "}
                {selectedAcademicYear}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">
                  {results.sgpa.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">SGPA</div>
                <div className="text-xs text-gray-500 mt-1">
                  {results.sgpa >= 9
                    ? "🏆 Excellent"
                    : results.sgpa >= 8
                      ? "🌟 Very Good"
                      : results.sgpa >= 7
                        ? "👍 Good"
                        : results.sgpa >= 6
                          ? "✅ Satisfactory"
                          : "📈 Needs Improvement"}
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">
                  {results.totalCredits}
                </div>
                <div className="text-sm text-gray-600">Total Credits</div>
                <div className="text-xs text-gray-500 mt-1">This Semester</div>
              </div>

              <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-1">
                  {results.totalPoints.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Grade Points</div>
                <div className="text-xs text-gray-500 mt-1">Total Earned</div>
              </div>
            </div>

            {/* Performance Indicator */}
            {results.sgpa > 0 && (
              <div className="mt-4 p-3 bg-white rounded-lg">
                <div className="flex items-center justify-center gap-2 text-sm">
                  {results.sgpa >= 9 ? (
                    <>
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      <span className="text-yellow-700 font-medium">
                        Outstanding Performance! 🎉
                      </span>
                    </>
                  ) : results.sgpa >= 8 ? (
                    <>
                      <Target className="w-4 h-4 text-green-500" />
                      <span className="text-green-700 font-medium">
                        Great Job! Keep it up! 💪
                      </span>
                    </>
                  ) : results.sgpa >= 6 ? (
                    <>
                      <Target className="w-4 h-4 text-blue-500" />
                      <span className="text-blue-700 font-medium">
                        Good work! Room for improvement 📚
                      </span>
                    </>
                  ) : (
                    <>
                      <BookOpen className="w-4 h-4 text-orange-500" />
                      <span className="text-orange-700 font-medium">
                        Focus on your studies! You can do it! 🚀
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Call to Action */}
          {/* <div className="mt-6 p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white text-center">
            <h4 className="font-semibold mb-2">
              Want to track your progress across all semesters?
            </h4>
            <p className="text-sm text-blue-100 mb-4">
              Create a free account to save your grades, calculate CGPA, and get
              detailed analytics!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/sign-up">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full sm:w-auto bg-white text-blue-600 hover:bg-gray-100"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Create Free Account
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto border-white text-blue-600 hover:bg-gray-100 hover:scale-100 hover:text-blue-600"
                >
                  Already have an account? Sign In
                </Button>
              </Link>
            </div>
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
}
