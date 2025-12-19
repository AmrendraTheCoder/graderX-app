"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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
import { Shield, Eye, EyeOff, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { makeUserAdmin } from "@/app/actions";

const ADMIN_PASSCODE = "LNMIIT_ADMIN_2024";

export default function AdminAccessPage() {
  const [passcode, setPasscode] = useState("");
  const [showPasscode, setShowPasscode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const { data: session } = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    if (passcode !== ADMIN_PASSCODE) {
      setMessage("Invalid passcode. Please try again.");
      setIsLoading(false);
      return;
    }

    if (!session?.user) {
      setMessage("You must be signed in to access admin features.");
      setIsLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("userId", session.user.id);
      
      await makeUserAdmin(formData);
      
      setMessage("Admin access granted! Redirecting...");
      setTimeout(() => {
        router.push("/admin");
      }, 1500);
    } catch (error) {
      setMessage("An error occurred. Please try again.");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Access</h1>
          <p className="text-gray-600 mt-2">
            Enter the admin passcode to gain administrative privileges
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Admin Verification</CardTitle>
            <CardDescription>
              This will grant you access to subject management and other admin
              features.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="passcode">Admin Passcode</Label>
                <div className="relative">
                  <Input
                    id="passcode"
                    type={showPasscode ? "text" : "password"}
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Enter admin passcode"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasscode(!showPasscode)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasscode ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Grant Admin Access"}
              </Button>

              {message && (
                <div
                  className={`text-sm p-3 rounded-md ${
                    message.includes("granted") ||
                    message.includes("Redirecting")
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {message}
                </div>
              )}
            </form>

            <div className="mt-6 p-4 bg-gray-100 rounded-md">
              <h4 className="font-medium text-gray-900 mb-2">
                What you'll get:
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Access to subject management portal</li>
                <li>• Ability to add/edit LNMIIT subjects</li>
                <li>• Initialize default curriculum data</li>
                <li>• Enhanced dashboard features</li>
              </ul>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                Don't have an account?{" "}
                <Link href="/sign-up" className="text-blue-600 hover:underline">
                  Sign up here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
