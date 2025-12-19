"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteSubjectAction } from "@/app/actions";

interface Subject {
  _id?: string;
  id?: string;
  name: string;
  code: string;
  credits: number;
  semester: number;
  branch: string;
}

interface DeleteSubjectFormProps {
  subject: Subject;
}

export function DeleteSubjectForm({ subject }: DeleteSubjectFormProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Determine redirect path based on current route
  const getRedirectPath = () => {
    if (pathname?.includes("/dashboard/admin/subjects")) {
      return "/dashboard/admin/subjects";
    }
    return "/admin?passcode=admin123";
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="hover:bg-red-50 hover:border-red-300"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Delete Subject
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete {subject.name} ({subject.code})?
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3">
          <div className="bg-red-50 p-3 rounded-lg border border-red-200">
            <div className="text-sm text-red-800">
              <strong>Warning:</strong> The subject will be permanently removed
              from the system.
            </div>
            <div className="text-xs text-red-600 mt-1">
              Note: Subjects with existing grades cannot be deleted.
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <div className="font-medium mb-2">Subject Details:</div>
            <div className="space-y-1 text-xs bg-gray-50 p-2 rounded">
              <div>Code: {subject.code}</div>
              <div>Credits: {subject.credits}</div>
              <div>Semester: {subject.semester}</div>
              <div>Branch: {subject.branch}</div>
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <form action={deleteSubjectAction} className="inline">
            <input type="hidden" name="subjectId" value={subject._id || subject.id} />
            <input
              type="hidden"
              name="redirectPath"
              value={getRedirectPath()}
            />
            <AlertDialogAction
              type="submit"
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Subject
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
