import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export const updateSession = async (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: do not remove — refreshes the session token on every request
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect unauthenticated users to the admin login page.
  // Exclude /admin/login itself to avoid an infinite redirect loop.
  const { pathname } = request.nextUrl;

  // Server Actions (Next-Action header) and RSC client-navigation requests
  // (RSC header) expect either a normal payload or a redirect encoded via
  // next/navigation's redirect() — not a raw HTTP redirect. Returning one
  // here breaks the client router ("unexpected response from the server",
  // surfacing as a 404). AdminPanelLayout already calls requireAdmin(),
  // which redirects correctly for these request types, so it's safe to
  // skip this early bail-out and let that guard handle it instead.
  const isActionOrRSCRequest =
    request.headers.get("next-action") !== null ||
    request.headers.get("rsc") !== null;

  if (
    !user &&
    pathname.startsWith("/admin") &&
    pathname !== "/admin/login" &&
    !isActionOrRSCRequest
  ) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
};
