"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Trash2 } from "lucide-react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class AuthErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Auth Error Boundary caught an error:", error, errorInfo);
  }

  clearAuthData = () => {
    try {
      // Clear localStorage - NextAuth session data
      const authKeys = [
        "next-auth.session-token",
        "next-auth.csrf-token",
        "next-auth.callback-url",
      ];
      authKeys.forEach((key) => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });

      // Clear auth cookies - NextAuth cookies
      const authCookies = [
        "next-auth.session-token",
        "__Secure-next-auth.session-token",
        "next-auth.csrf-token",
        "__Secure-next-auth.csrf-token",
        "next-auth.callback-url",
        "__Secure-next-auth.callback-url",
      ];
      authCookies.forEach((cookieName) => {
        document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      });

      // Reset error state and reload
      this.setState({ hasError: false });
      window.location.href = "/sign-in";
    } catch (error) {
      console.error("Error clearing auth data:", error);
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      const isHeaderError =
        this.state.error?.message?.includes("431") ||
        this.state.error?.message?.includes("header") ||
        this.state.error?.message?.includes("cookie");

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-red-600">
                <AlertTriangle className="w-6 h-6" />
                {isHeaderError
                  ? "Authentication Error"
                  : "Something went wrong"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isHeaderError ? (
                <>
                  <p className="text-center text-gray-600">
                    There's an issue with your authentication data. This usually
                    happens when browser storage becomes corrupted.
                  </p>
                  <Button onClick={this.clearAuthData} className="w-full">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Auth Data & Retry
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-center text-gray-600">
                    {this.state.error?.message ||
                      "An unexpected error occurred"}
                  </p>
                  <Button
                    onClick={() => window.location.reload()}
                    className="w-full"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Page
                  </Button>
                </>
              )}

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500 text-center">
                  If the problem persists, try visiting{" "}
                  <a
                    href="/clear-storage.html"
                    className="text-blue-600 underline"
                  >
                    /clear-storage.html
                  </a>{" "}
                  to clear all browser data.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
