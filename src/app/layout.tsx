import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { TempoInit } from "@/components/tempo-init";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthErrorBoundary } from "@/components/error-boundary";
import { AuthProvider } from "@/components/auth-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GraderX",
  description:
    "A modern grading system for LNMIIT students to track their academic progress",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          id="error-handler"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('unhandledrejection', function(event) {
                console.error('Unhandled promise rejection:', event.reason);
                if (event.reason instanceof Event) {
                  event.preventDefault();
                  console.warn('Prevented Event object from being thrown as error');
                }
              });
              
              window.addEventListener('error', function(event) {
                if (event.error instanceof Event) {
                  console.warn('Prevented Event object error:', event.error);
                  event.preventDefault();
                }
              });
            `,
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <Script src="https://api.tempolabs.ai/proxy-asset?url=https://storage.googleapis.com/tempo-public-assets/error-handling.js" />
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <AuthErrorBoundary>{children}</AuthErrorBoundary>
          </ThemeProvider>
        </AuthProvider>
        <TempoInit />
      </body>
    </html>
  );
}
