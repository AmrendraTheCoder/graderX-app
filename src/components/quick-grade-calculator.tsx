"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Calculator, Trash2 } from "lucide-react";
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

interface QuickGradeRow {
  id: number;
  subject: string;
  credits: number;
  grade: string;
  points: number;
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

interface QuickGradeCalculatorProps {
  existingGrades: ExistingGrade[];
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

const gradeOptions = [
  { value: "A", label: "A (10.0)", points: 10.0 },
  { value: "AB", label: "AB (9.0)", points: 9.0 },
  { value: "B", label: "B (8.0)", points: 8.0 },
  { value: "BC", label: "BC (7.0)", points: 7.0 },
  { value: "C", label: "C (6.0)", points: 6.0 },
  { value: "CD", label: "CD (5.0)", points: 5.0 },
  { value: "D", label: "D (4.0)", points: 4.0 },
  { value: "F", label: "F (0.0)", points: 0.0 },
];

export function QuickGradeCalculator({
  existingGrades,
}: QuickGradeCalculatorProps) {
  const [grades, setGrades] = useState<QuickGradeRow[]>([
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
    field: keyof QuickGradeRow,
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

  // Recalculate when grades change
  useEffect(() => {
    calculateResults();
  }, [grades, existingGrades]);

  return (
    <div className="space-y-4">
      {/* Grade Input Rows */}
      <div className="space-y-3">
        {grades.map((grade) => (
          <div
            key={grade.id}
            className="grid grid-cols-12 gap-3 items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="col-span-5">
              <Input
                placeholder="Subject name"
                value={grade.subject}
                onChange={(e) =>
                  updateGrade(grade.id, "subject", e.target.value)
                }
                className="text-sm"
              />
            </div>
            <div className="col-span-2">
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
                className="text-sm text-center"
                placeholder="Credits"
              />
            </div>
            <div className="col-span-3">
              <Select
                value={grade.grade}
                onValueChange={(value) => updateGrade(grade.id, "grade", value)}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Grade" />
                </SelectTrigger>
                <SelectContent>
                  {gradeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-1">
              <Input
                readOnly
                value={grade.points.toFixed(1)}
                className="bg-muted text-center text-sm"
              />
            </div>
            <div className="col-span-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeGradeRow(grade.id)}
                disabled={grades.length === 1}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}

        {/* Add Subject Button - Moved to bottom of table */}
        <div className="flex justify-center pt-2">
          <Button
            onClick={addGradeRow}
            variant="outline"
            size="sm"
            className="w-full max-w-xs"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Subject
          </Button>
        </div>
      </div>

      {/* Action Buttons - Only Reset button now */}
      <div className="flex justify-center">
        <Button onClick={resetCalculator} variant="outline" size="sm">
          Reset
        </Button>
      </div>

      {/* Results Display */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-600 mb-1">Current SGPA</p>
          <p className="text-2xl font-bold text-blue-600">
            {results.sgpa.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500">
            {results.totalCredits} credits
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-600 mb-1">
            Expected CGPA
          </p>
          <p className="text-2xl font-bold text-green-600">
            {results.cgpa.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500">
            {results.totalCredits > 0 ? "Including new grades" : "Current CGPA"}
          </p>
        </div>
      </div>

      {/* Note for existing grades */}
      {existingGrades && existingGrades.length > 0 && (
        <div className="text-xs text-gray-500 text-center bg-blue-50 p-2 rounded">
          📊 CGPA includes your {existingGrades.length} existing grade(s) (Base:{" "}
          {calculateExistingCGPA().toFixed(2)})
        </div>
      )}
    </div>
  );
}
