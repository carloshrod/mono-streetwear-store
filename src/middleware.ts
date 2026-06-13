import { updateSession } from "@/lib/supabase/middleware";
import type { NextRequest } from "next/server";

export const middleware = async (request: NextRequest) => {
  return updateSession(request);
};

export const config = {
  matcher: [
    /*
     * Match every path except:
     * - _next/static  (static files)
     * - _next/image   (image optimisation)
     * - favicon.ico
     * - public assets (png, jpg, svg, …)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
