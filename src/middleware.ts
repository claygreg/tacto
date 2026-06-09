import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/provas/:path*",
    "/questoes/:path*",
    "/diagnostico/:path*",
    "/turmas/:path*",
    "/conta/:path*",
  ],
};
