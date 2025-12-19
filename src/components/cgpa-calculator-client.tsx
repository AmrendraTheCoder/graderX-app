"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
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

interface ExistingGrade {
  id: string;
  grade: string;
  grade_points: number;
  semester: number;
  subjects: {
    name: string;
    code: string;
    credits: number;
  };
}

interface Subject {
  id: number;
  subject: string;
  credits: number;
  grade: string;
  points: number;
}

interface CGPACalculatorClientProps {
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

export function CGPACalculatorClient({
  existingGrades,
}: CGPACalculatorClientProps) {
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: 1, subject: "", credits: 3, grade: "", points: 0 },
  ]);
  const [results, setResults] = useState({
    sgpa: 0,
    cgpa: 0,
    totalCredits: 0,
    totalPoints: 0,
    gradeStatus: "-",
  });

  // Calculate existing CGPA from recorded grades
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

  const addSubject = () => {
    const newId = Math.max(...subjects.map((s) => s.id)) + 1;
    setSubjects([
      ...subjects,
      { id: newId, subject: "", credits: 3, grade: "", points: 0 },
    ]);
  };

  const removeSubject = (id: number) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter((s) => s.id !== id));
    }
  };

  const updateSubject = (
    id: number,
    field: keyof Subject,
    value: string | number
  ) => {
    setSubjects(
      subjects.map((s) => {
        if (s.id === id) {
          const updated = { ...s, [field]: value };

          // Update points when grade changes
          if (field === "grade" && typeof value === "string") {
            updated.points = value
              ? gradePoints[value as keyof typeof gradePoints] || 0
              : 0;
          }

          return updated;
        }
        return s;
      })
    );
  };

  const calculateResults = () => {
    let totalCredits = 0;
    let totalPoints = 0;

    subjects.forEach((subject) => {
      if (subject.grade && subject.credits > 0) {
        totalCredits += subject.credits;
        totalPoints += subject.points * subject.credits;
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

    let gradeStatus = "Needs Improvement";
    if (cgpa >= 8.5) gradeStatus = "Excellent";
    else if (cgpa >= 7.0) gradeStatus = "Good";
    else if (cgpa >= 6.0) gradeStatus = "Average";

    setResults({
      sgpa,
      cgpa,
      totalCredits,
      totalPoints,
      gradeStatus,
    });
  };

  const resetCalculator = () => {
    setSubjects([{ id: 1, subject: "", credits: 3, grade: "", points: 0 }]);
    setResults({
      sgpa: 0,
      cgpa: 0,
      totalCredits: 0,
      totalPoints: 0,
      gradeStatus: "-",
    });
  };

  // Recalculate when subjects change
  useEffect(() => {
    calculateResults();
  }, [subjects, existingGrades]);

  return (
    <div className="space-y-6">
      {/* Subjects Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Subjects</h3>
          <Button type="button" size="sm" onClick={addSubject}>
            <Plus className="w-4 h-4 mr-2" />
            Add Subject
          </Button>
        </div>

        <div className="space-y-4">
          {subjects.map((subject) => (
            <div key={subject.id} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-4">
                <Label htmlFor={`subject-${subject.id}`}>Subject</Label>
                <Input
                  id={`subject-${subject.id}`}
                  placeholder="Subject name"
                  value={subject.subject}
                  onChange={(e) =>
                    updateSubject(subject.id, "subject", e.target.value)
                  }
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor={`credits-${subject.id}`}>Credits</Label>
                <Input
                  id={`credits-${subject.id}`}
                  type="number"
                  min="1"
                  max="6"
                  value={subject.credits}
                  onChange={(e) =>
                    updateSubject(
                      subject.id,
                      "credits",
                      parseInt(e.target.value) || 3
                    )
                  }
                />
              </div>

              <div className="col-span-3">
                <Label htmlFor={`grade-${subject.id}`}>Grade</Label>
                <Select
                  value={subject.grade}
                  onValueChange={(value) =>
                    updateSubject(subject.id, "grade", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
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

              <div className="col-span-2">
                <Label>Points</Label>
                <Input
                  readOnly
                  value={subject.points.toFixed(1)}
                  className="bg-muted"
                />
              </div>

              <div className="col-span-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeSubject(subject.id)}
                  disabled={subjects.length === 1}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button onClick={calculateResults} className="flex-1">
          Calculate SGPA/CGPA
        </Button>
        <Button variant="outline" onClick={resetCalculator}>
          Reset
        </Button>
      </div>

      {/* Results Section */}
      <div className="space-y-6 p-6 bg-muted/50 rounded-lg">
        <h3 className="text-lg font-semibold">Calculation Results</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Current SGPA</p>
            <p className="text-3xl font-bold text-blue-600">
              {results.sgpa.toFixed(2)}
            </p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Expected CGPA</p>
            <p className="text-3xl font-bold text-green-600">
              {results.cgpa.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span>New Semester Credits:</span>
            <span>{results.totalCredits}</span>
          </div>
          <div className="flex justify-between">
            <span>New Semester Points:</span>
            <span>{results.totalPoints.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Existing CGPA:</span>
            <span>{calculateExistingCGPA().toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Grade Status:</span>
            <span>{results.gradeStatus}</span>
          </div>
        </div>

        {existingGrades && existingGrades.length > 0 && (
          <div className="text-sm text-muted-foreground">
            <p>
              * CGPA calculation includes your {existingGrades.length} existing
              grade(s)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
