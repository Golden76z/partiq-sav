import middleware from "next-auth/middleware";
export { middleware };

export const config = {
  matcher: [
    "/catalogue/:path*",
    "/dashboard/:path*",
    "/preview/:path*",
    "/tickets/:path*",
    "/upload/:path*",
    "/knowledge-base/:path*",
    "/admin/:path*",
  ],
};
