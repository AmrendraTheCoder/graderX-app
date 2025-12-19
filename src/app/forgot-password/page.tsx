import { forgotPasswordAction } from "../actions";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Calculator, ArrowLeft, ShieldCheck, Key } from "lucide-react";
import { InfoMessage } from "@/components/info-message";

interface SearchParams {
  message?: string;
  error?: string;
}

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center space-x-2 mb-8 justify-center">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">GraderX</h1>
            <p className="text-sm text-gray-500">LNMIIT Grade Calculator</p>
          </div>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Key className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
            <CardDescription className="text-base">
              Enter your email address and we'll send you a link to reset your
              password
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Success/Error Messages */}
            {params.message && (
              <InfoMessage type="success" message={params.message} />
            )}
            {params.error && (
              <InfoMessage type="error" message={params.error} />
            )}

            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your.email@lnmiit.ac.in"
                    className="pl-10 h-12"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Enter the email address associated with your account
                </p>
              </div>

              <SubmitButton
                formAction={forgotPasswordAction}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-base font-medium"
                pendingText="Sending reset link..."
              >
                <ShieldCheck className="w-4 h-4 mr-2" />
                Send Reset Link
              </SubmitButton>
            </form>

            <div className="text-center space-y-4">
              <div className="text-sm text-gray-600">
                Remember your password?{" "}
                <Link
                  href="/sign-in"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Sign in here
                </Link>
              </div>

              <div className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  href="/sign-up"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Create one free
                </Link>
              </div>
            </div>

            {/* Back to Home */}
            <div className="pt-4 border-t border-gray-100">
              <Link href="/" className="text-center block">
                <Button variant="ghost" size="sm" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-blue-900">Security Notice</p>
              <p className="text-blue-700 mt-1">
                Password reset links expire after 1 hour for your security. If
                you don't receive an email, check your spam folder.
              </p>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Need help? Contact us at{" "}
            <a href="mailto:support@graderx.com" className="text-blue-600">
              support@graderx.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
