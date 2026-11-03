import { auth } from "@/lib/auth/server";

export default auth.middleware({ loginUrl: "/auth", publicRoutes: ["/", "/auth", "/api/appointments", "/api/assistant", "/api/health", "/api/photos"] });

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|belavez-mark.svg|belavez-logo.svg).*)"],
};
