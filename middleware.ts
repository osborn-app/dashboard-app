// Protecting routes with next-auth
// https://next-auth.js.org/configuration/nextjs#middleware
// https://nextjs.org/docs/app/building-your-application/routing/middleware

import { Token } from "next-auth";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const token = (await getToken({ req })) as Token;
  const { pathname } = req.nextUrl;

  // Allow access to auth pages without token
  if (pathname.startsWith("/role-selection") || pathname.startsWith("/login")) {
    return NextResponse.next();
  }

  if (!token || !token.user) {
    return NextResponse.redirect(new URL("/role-selection", req.url));
  }

  const role = token?.user?.role || "admin";

  // Super admin: full access to everything
  if (role === "super_admin") {
    return NextResponse.next();
  }

  // Owner: limit to calendar, fleets, recap, order detail
  if (role === "owner") {
    const ownerRoutes = [
      "/dashboard",
      "/dashboard/calendar",
      "/dashboard/fleets",
      "/dashboard/recap",
      { path: "/dashboard/orders/:orderId/detail", exact: true },
    ];
    const ownerMatch = ownerRoutes.some((route) => {
      if (typeof route === "string") {
        return pathname.startsWith(route);
      } else if (route.exact) {
        const regex = new RegExp(`^${route.path.replace(":orderId", "[^/]+")}$`);
        return regex.test(pathname);
      }
      return false;
    });
    if (!ownerMatch) {
      return NextResponse.redirect(new URL("/dashboard/calendar", req.url));
    }
  }

  // Finance: only keuangan pages + reimburse + orders pages
  if (role === "finance") {
    const financeAllowedPrefixes = [
      "/dashboard/rekap-pencatatan",
      "/dashboard/realisasi",
      "/dashboard/inventaris",
      "/dashboard/perencanaan",
      "/dashboard/reimburse",
      "/dashboard/orders",
      "/dashboard/product-orders",
    ];
    const ok = financeAllowedPrefixes.some((p) => pathname.startsWith(p));
    if (!ok) {
      return NextResponse.redirect(new URL("/dashboard/rekap-pencatatan", req.url));
    }
  }

  // Operation: only inspections, needs, buser, calendar, dashboard, order details
  if (role === "operation") {
    const operationAllowedPrefixes = [
      "/dashboard",
      "/dashboard/calendar",
      "/dashboard/inspections",
      "/dashboard/needs",
      "/dashboard/buser",
    ];
    
    // Check for exact order detail routes only (no edit/create)
    const orderDetailMatch = pathname.match(/^\/dashboard\/orders\/[^\/]+\/detail$/);
    
    // Block edit and create routes for operation role
    const isEditOrCreateRoute = pathname.includes('/edit') || pathname.includes('/create');
    
    const ok = (operationAllowedPrefixes.some((p) => pathname.startsWith(p)) || orderDetailMatch) && !isEditOrCreateRoute;
    if (!ok) {
      return NextResponse.redirect(new URL("/dashboard/inspections", req.url));
    }
  }

  // Driver: only reimburse page
  if (role === "driver") {
    const driverAllowedPrefixes = [
      "/dashboard/reimburse",
    ];
    const ok = driverAllowedPrefixes.some((p) => pathname.startsWith(p));
    if (!ok) {
      return NextResponse.redirect(new URL("/dashboard/reimburse", req.url));
    }
  }

  return NextResponse.next();
}

export const config = { 
  matcher: [
    "/dashboard/:path*",
    "/role-selection",
    "/login"
  ] 
};
