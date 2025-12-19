import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll().map(({ name, value }: { name: string; value: string }) => ({
            name,
            value,
          }));
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Only set cookie if value is not too large (prevent 431 error)
            if (value && value.length < 4000) {
              try {
                cookieStore.set(name, value, {
                  ...options,
                  httpOnly: true,
                  secure: process.env.NODE_ENV === 'production',
                  sameSite: 'lax' as const,
                  maxAge: options?.maxAge || 60 * 60 * 24 * 7, // 7 days default
                });
              } catch (error) {
                console.warn(`Failed to set cookie ${name}:`, error);
              }
            } else {
              console.warn(`Cookie ${name} is too large (${value?.length} chars), skipping`);
            }
          });
        },
      },
    }
  );
};
