import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
  try {
    // Create an unmodified response
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll().map(({ name, value }) => ({
              name,
              value,
            }));
          },
          setAll(cookiesToSet) {
            // Optimize cookie setting to prevent header size issues
            cookiesToSet.forEach(({ name, value, options }) => {
              // Only set cookie if value is not too large
              if (value && value.length < 4000) {
                response.cookies.set(name, value, {
                  ...options,
                  httpOnly: true,
                  secure: process.env.NODE_ENV === 'production',
                  sameSite: 'lax',
                });
              }
            });
          },
        },
      }
    );

    // This will refresh session if expired - required for Server Components
    const { data: { user }, error } = await supabase.auth.getUser();

    // Skip authentication for all dashboard routes (using passcode protection instead)
    if (request.nextUrl.pathname.startsWith("/dashboard")) {
      return response;
    }

    // If user is authenticated and trying to access auth pages, redirect to dashboard
    if (user && (
      request.nextUrl.pathname.startsWith("/sign-in") ||
      request.nextUrl.pathname.startsWith("/sign-up") ||
      request.nextUrl.pathname.startsWith("/forgot-password")
    )) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return response;
  } catch (e) {
    console.error("Middleware error:", e);
    
    // If there's an authentication error, clear problematic cookies
    const response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    // Clear potentially large auth cookies
    const authCookies = ['supabase-auth-token', 'sb-access-token', 'sb-refresh-token'];
    authCookies.forEach(cookieName => {
      if (request.cookies.has(cookieName)) {
        response.cookies.delete(cookieName);
      }
    });

    return response;
  }
};
