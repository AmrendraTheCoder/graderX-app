"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Calculator } from "lucide-react";
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

interface Subject {
  id: string;
  name: string;
  code: string;
  credits: number;
  semester: number;
}

interface ExistingGrade {
  id: string;
  grade: string;
  grade_points: number;
  semester: number;
  academic_year: string;
  subjects: {
    name: string;
    code: string;
    credits: number;
  };
}

interface GradeRow {
  id: number;
  subject: string;
  credits: number;
  grade: string;
  points: number;
}

interface DashboardGradeCalculatorProps {
  subjects: Subject[];
  existingGrades: ExistingGrade[];
  currentSemester: number;
  currentAcademicYear: string;
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

const gradeOptions = ["A", "AB", "B", "BC", "C", "CD", "D", "F"];

export function DashboardGradeCalculator({
  subjects,
  existingGrades,
  currentSemester,
  currentAcademicYear,
}: DashboardGradeCalculatorProps) {
  const [selectedSemester, setSelectedSemester] = useState(
    currentSemester.toString()
  );
  const [selectedYear, setSelectedYear] = useState(currentAcademicYear);
  const [grades, setGrades] = useState<GradeRow[]>([
    { id: 1, subject: "", credits: 3, grade: "", points: 0 },
  ]);
  const [results, setResults] = useState({
    sgpa: 0,
    cgpa: 0,
    totalCredits: 0,
    totalPoints: 0,
  });

  // Calculate existing CGPA
  const calculateExistingCGPA = () => {
    if (!existingGrades || existingGrades.length === 0) return 0;

    let totalCredits = 0;
    let totalPoints = 0;

    existingGrades.forEach((grade) => {
      const credits = grade.subjects?.credits || 3;
      totalCredits += credits;
      totalPoints += grade.grade_points * credits;
    });

    return totalCredits > 0 ? totalPoints / totalCredits : 0;
  };

  const addGradeRow = () => {
    const newId = Math.max(...grades.map((g) => g.id)) + 1;
    setGrades([
      ...grades,
      { id: newId, subject: "", credits: 3, grade: "", points: 0 },
    ]);
  };

  const removeGradeRow = (id: number) => {
    if (grades.length > 1) {
      setGrades(grades.filter((g) => g.id !== id));
    }
  };

  const updateGrade = (
    id: number,
    field: keyof GradeRow,
    value: string | number
  ) => {
    setGrades(
      grades.map((g) => {
        if (g.id === id) {
          const updated = { ...g, [field]: value };

          // Update points when grade changes
          if (field === "grade" && typeof value === "string") {
            updated.points = value
              ? gradePoints[value as keyof typeof gradePoints] || 0
              : 0;
          }

          return updated;
        }
        return g;
      })
    );
  };

  const calculateResults = () => {
    let totalCredits = 0;
    let totalPoints = 0;

    grades.forEach((grade) => {
      if (grade.grade && grade.credits > 0) {
        totalCredits += grade.credits;
        totalPoints += grade.points * grade.credits;
      }
    });

    const sgpa = totalCredits > 0 ? totalPoints / totalCredits : 0;

    // Calculate CGPA including existing grades
    const existingCGPA = calculateExistingCGPA();
    const existingTotalCredits =
      existingGrades?.reduce(
        (sum, grade) => sum + (grade.subjects?.credits || 3),
        0
      ) || 0;
    const existingTotalPoints =
      existingGrades?.reduce(
        (sum, grade) =>
          sum + grade.grade_points * (grade.subjects?.credits || 3),
        0
      ) || 0;

    const combinedCredits = existingTotalCredits + totalCredits;
    const combinedPoints = existingTotalPoints + totalPoints;
    const cgpa = combinedCredits > 0 ? combinedPoints / combinedCredits : 0;

    setResults({
      sgpa,
      cgpa,
      totalCredits,
      totalPoints,
    });
  };

  const resetCalculator = () => {
    setGrades([{ id: 1, subject: "", credits: 3, grade: "", points: 0 }]);
  };

  // Auto-populate with subjects from selected semester
  const populateWithSemesterSubjects = () => {
    const semesterSubjects = subjects.filter(
      (s) => s.semester === parseInt(selectedSemester)
    );
    if (semesterSubjects.length > 0) {
      const newGrades = semesterSubjects.map((subject, index) => ({
        id: index + 1,
        subject: `${subject.name} (${subject.code})`,
        credits: subject.credits,
        grade: "",
        points: 0,
      }));
      setGrades(newGrades);
    }
  };

  // Recalculate when grades change
  useEffect(() => {
    calculateResults();
  }, [grades, existingGrades]);

  return (
    <div className="space-y-6">
      {/* Semester and Year Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
        <div className="space-y-2">
          <Label htmlFor="semester">Semester</Label>
          <Select value={selectedSemester} onValueChange={setSelectedSemester}>
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
          <Select value={selectedYear} onValueChange={setSelectedYear}>
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

        <div className="space-y-2">
          <Label>Quick Actions</Label>
          <Button
            type="button"
            variant="outline"
            onClick={populateWithSemesterSubjects}
            className="w-full"
          >
            Load Semester {selectedSemester} Subjects
          </Button>
        </div>
      </div>

      {/* Grade Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Subject</TableHead>
              <TableHead className="w-[100px]">Credits</TableHead>
              <TableHead className="w-[150px]">Grade</TableHead>
              <TableHead className="w-[100px]">Points</TableHead>
              <TableHead className="w-[80px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {grades.map((grade) => (
              <TableRow key={grade.id}>
                <TableCell>
                  <Input
                    placeholder="Subject name"
                    value={grade.subject}
                    onChange={(e) =>
                      updateGrade(grade.id, "subject", e.target.value)
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="1"
                    max="6"
                    value={grade.credits}
                    onChange={(e) =>
                      updateGrade(
                        grade.id,
                        "credits",
                        parseInt(e.target.value) || 3
                      )
                    }
                    className="w-full"
                  />
                </TableCell>
                <TableCell>
                  <Select
                    value={grade.grade}
                    onValueChange={(value) =>
                      updateGrade(grade.id, "grade", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {gradeOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Input
                    readOnly
                    value={grade.points.toFixed(1)}
                    className="bg-muted text-center"
                  />
                </TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeGradeRow(grade.id)}
                    disabled={grades.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button onClick={addGradeRow} variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Add Subject
        </Button>
        <Button onClick={resetCalculator} variant="outline">
          Reset All
        </Button>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">Current SGPA</p>
          <p className="text-2xl font-bold text-blue-600">
            {results.sgpa.toFixed(2)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">Expected CGPA</p>
          <p className="text-2xl font-bold text-green-600">
            {results.cgpa.toFixed(2)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">Credits</p>
          <p className="text-xl font-bold text-gray-600">
            {results.totalCredits}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">Grade Points</p>
          <p className="text-xl font-bold text-gray-600">
            {results.totalPoints.toFixed(1)}
          </p>
        </div>
      </div>

      {existingGrades && existingGrades.length > 0 && (
        <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg">
          <p>
            <strong>Note:</strong> CGPA calculation includes your{" "}
            {existingGrades.length} existing grade(s). Current base CGPA:{" "}
            {calculateExistingCGPA().toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
}
