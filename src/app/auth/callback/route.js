// /app/auth/callback/route.js
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(request) {
  const supabase = createRouteHandlerClient({ cookies: () => cookies() });

  await supabase.auth.getSession();

  return NextResponse.redirect(new URL("/", request.url));
}
