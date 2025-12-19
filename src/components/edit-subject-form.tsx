"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Edit } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SubmitButton } from "@/components/submit-button";
import { editSubjectAction } from "@/app/actions";

interface Subject {
  _id?: string;
  id?: string;
  name: string;
  code: string;
  credits: number;
  semester: number;
  branch: string;
}

interface EditSubjectFormProps {
  subject: Subject;
}

export function EditSubjectForm({ subject }: EditSubjectFormProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [selectedCredits, setSelectedCredits] = useState(
    subject.credits.toString()
  );
  const [selectedSemester, setSelectedSemester] = useState(
    subject.semester.toString()
  );
  const [selectedBranch, setSelectedBranch] = useState(
    subject.branch || "Common"
  );

  // Determine redirect path based on current route
  const getRedirectPath = () => {
    if (pathname?.includes("/dashboard/admin/subjects")) {
      return "/dashboard/admin/subjects";
    }
    return "/admin?passcode=admin123";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="hover:bg-blue-50 hover:border-blue-300"
        >
          <Edit className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Subject</DialogTitle>
          <DialogDescription>
            Make changes to the subject details. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form action={editSubjectAction} className="space-y-4">
          <input type="hidden" name="subjectId" value={subject._id || subject.id} />
          <input type="hidden" name="redirectPath" value={getRedirectPath()} />

          <div className="space-y-2">
            <Label htmlFor="edit-name">Subject Name</Label>
            <Input
              id="edit-name"
              name="name"
              defaultValue={subject.name}
              placeholder="e.g. Engineering Mathematics I"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-code">Subject Code</Label>
            <Input
              id="edit-code"
              name="code"
              defaultValue={subject.code}
              placeholder="e.g. MTH101"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-credits">Credits</Label>
              <Select
                value={selectedCredits}
                onValueChange={(value) => {
                  console.log("📝 Credits selected:", value);
                  setSelectedCredits(value);
                }}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Credits" />
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
              <input type="hidden" name="credits" value={selectedCredits} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-semester">Semester</Label>
              <Select
                value={selectedSemester}
                onValueChange={(value) => {
                  console.log("📝 Semester selected:", value);
                  setSelectedSemester(value);
                }}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Semester" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <SelectItem key={sem} value={sem.toString()}>
                      Semester {sem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" name="semester" value={selectedSemester} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-branch">Branch</Label>
            <Select
              value={selectedBranch}
              onValueChange={(value) => {
                console.log("📝 Branch selected:", value);
                setSelectedBranch(value);
              }}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Branch" />
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
            <input type="hidden" name="branch" value={selectedBranch} />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <SubmitButton
              pendingText="Saving..."
              className="bg-blue-600 hover:bg-blue-700"
            >
              Save Changes
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
