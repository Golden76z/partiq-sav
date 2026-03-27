export { default } from "next-auth/middleware";

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
