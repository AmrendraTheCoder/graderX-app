import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-6xl font-bold text-gray-400 mb-4">
            404
          </CardTitle>
          <h1 className="text-2xl font-bold text-gray-900">Page Not Found</h1>
          <p className="text-gray-600 mt-2">
            Sorry, we couldn't find the page you're looking for.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link href="/dashboard">
            <Button className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
