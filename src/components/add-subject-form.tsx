"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
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
import { SubmitButton } from "@/components/submit-button";
import { addSubjectAction } from "@/app/actions";

export function AddSubjectForm() {
  const pathname = usePathname();
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [selectedBranch, setSelectedBranch] = useState<string>("Common");
  const [selectedCredits, setSelectedCredits] = useState<string>("3");

  // Determine redirect path based on current route
  const getRedirectPath = () => {
    if (pathname?.includes("/dashboard/admin/subjects")) {
      return "/dashboard/admin/subjects";
    }
    return "/admin?passcode=admin123";
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    console.log("🚀🚀🚀 FORM SUBMISSION TRIGGERED - CLIENT SIDE 🚀🚀🚀");
    console.log("Form element:", e.currentTarget);

    const formData = new FormData(e.currentTarget);
    console.log("📝 Form data being submitted:");
    const formDataEntries = Array.from(formData.entries());
    for (const [key, value] of formDataEntries) {
      console.log(`- ${key}:`, value);
    }

    console.log("📝 Total form fields found:", formDataEntries.length);
    console.log("📝 FormData object:", formData);
    console.log("📝 Selected semester:", selectedSemester);
    console.log("📝 Selected branch:", selectedBranch);
    console.log("📝 Selected credits:", selectedCredits);
    console.log("📝 Redirect path:", getRedirectPath());
  };

  return (
    <form
      action={addSubjectAction}
      className="space-y-4"
      onSubmit={handleSubmit}
    >
      <input type="hidden" name="redirectPath" value={getRedirectPath()} />

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Subject Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="e.g., Data Structures"
            required
            onChange={(e) => console.log("📝 Name changed:", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="code">Subject Code</Label>
          <Input
            id="code"
            name="code"
            placeholder="e.g., CS102"
            required
            onChange={(e) => console.log("📝 Code changed:", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="credits">Credits</Label>
          <Select
            value={selectedCredits}
            onValueChange={(value) => {
              console.log("📝 Credits selected:", value);
              setSelectedCredits(value);
            }}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select credits" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0.5">0.5 Credits</SelectItem>
              <SelectItem value="1">1 Credit</SelectItem>
              <SelectItem value="1.5">1.5 Credits</SelectItem>
              <SelectItem value="2">2 Credits</SelectItem>
              <SelectItem value="2.5">2.5 Credits</SelectItem>
              <SelectItem value="3">3 Credits</SelectItem>
              <SelectItem value="3.5">3.5 Credits</SelectItem>
              <SelectItem value="4">4 Credits</SelectItem>
              <SelectItem value="4.5">4.5 Credits</SelectItem>
              <SelectItem value="5">5 Credits</SelectItem>
              <SelectItem value="6">6 Credits</SelectItem>
            </SelectContent>
          </Select>
          {/* Hidden input to ensure credits is submitted with form */}
          <input type="hidden" name="credits" value={selectedCredits} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="semester">Semester</Label>
          <Select
            value={selectedSemester}
            onValueChange={(value) => {
              console.log("📝 Semester selected:", value);
              setSelectedSemester(value);
            }}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Semester?" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <SelectItem key={sem} value={sem.toString()}>
                  Semester {sem}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* Hidden input to ensure semester is submitted with form */}
          <input type="hidden" name="semester" value={selectedSemester} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="branch">Branch</Label>
          <Select
            value={selectedBranch}
            onValueChange={(value) => {
              console.log("📝 Branch selected:", value);
              setSelectedBranch(value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select branch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Common">Common</SelectItem>
              <SelectItem value="CSE">CSE</SelectItem>
              <SelectItem value="ECE">ECE</SelectItem>
              <SelectItem value="ME">ME</SelectItem>
              <SelectItem value="CE">CE</SelectItem>
              <SelectItem value="CCE">CCE</SelectItem>
            </SelectContent>
          </Select>
          {/* Hidden input to ensure branch is submitted with form */}
          <input type="hidden" name="branch" value={selectedBranch} />
        </div>
      </div>

      <SubmitButton
        className="w-full"
        pendingText="Adding..."
        onClick={() => console.log("🎯 Submit button clicked!")}
        disabled={!selectedSemester} // Disable button until semester is selected
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Subject
      </SubmitButton>
    </form>
  );
}
