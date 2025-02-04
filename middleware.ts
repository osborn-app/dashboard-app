// Protecting routes with next-auth
// https://next-auth.js.org/configuration/nextjs#middleware
// https://nextjs.org/docs/app/building-your-application/routing/middleware

import { Token } from "next-auth";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const token = (await getToken({ req })) as Token;
  const { pathname } = req.nextUrl;

  if (!token || !token.user) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const role = token?.user?.role || "admin";

  const ownerRoutes = [
    "/dashboard",
    "/dashboard/calendar",
    "/dashboard/fleets",
    "/dashboard/recap",
    { path: "/dashboard/orders/:orderId/detail", exact: true },
  ];

  const isMatch = ownerRoutes.some((route) => {
    if (typeof route === "string") {
      return pathname.startsWith(route);
    } else if (route.exact) {
      const regex = new RegExp(`^${route.path.replace(":orderId", "[^/]+")}$`);
      return regex.test(pathname);
    }
    return false;
  });

  if (role === "owner" && !isMatch) {
    return NextResponse.redirect(new URL("/dashboard/calendar", req.url));
  }

  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*"] };
