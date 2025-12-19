import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Users,
  BookOpen,
  GraduationCap,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-blue-600 p-4 rounded-full">
              <Clock className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Coming Soon</h1>
          <p className="text-xl text-gray-600">
            User authentication features are under development
          </p>
        </div>

        {/* Main Card */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <GraduationCap className="w-6 h-6 text-blue-600" />
              GraderX - LNMIIT Grading System
            </CardTitle>
            <CardDescription className="text-lg">
              We're building something amazing for LNMIIT students and faculty
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Features List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Student Portal</h3>
                  <p className="text-sm text-gray-600">
                    Grade tracking and CGPA calculation
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Subject Management</h3>
                  <p className="text-sm text-gray-600">
                    Complete curriculum organization
                  </p>
                </div>
              </div>
              {/* <div className="flex items-start gap-3">
                <GraduationCap className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Faculty Dashboard</h3>
                  <p className="text-sm text-gray-600">Grade entry and analytics</p>
                </div>
              </div> */}
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-orange-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Real-time Updates</h3>
                  <p className="text-sm text-gray-600">
                    Instant grade notifications
                  </p>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                Current Status
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-700">
                    Subject Management System - Completed
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-yellow-700">
                    User Authentication - In Development
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-yellow-700">
                    Student Portal - Coming Soon
                  </span>
                </div>
                {/* <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-gray-600">Faculty Dashboard - Planned</span>
                </div>
               */}
              </div>
            </div>

            {/* Admin Access */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                Administrator Access
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                While user features are being developed, administrators can
                access the subject management system directly.
              </p>
              <Link href="/admin">
                <Button variant="outline" className="w-full">
                  <Shield className="w-4 h-4 mr-2" />
                  Admin Portal
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-4">
          <p className="text-gray-600">
            Need immediate access? Contact the development team.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
