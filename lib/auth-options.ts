import { NextAuthOptions } from "next-auth";
import CredentialProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialProvider({
      name: "credentials",
      credentials: {
        email: {
          label: "email",
          type: "email",
          placeholder: "example@gmail.com",
        },
        password: {
          label: "password",
          type: "password",
        },
        role: {
          label: "role",
          type: "text",
        },
      },
      async authorize(credentials, req) {
        try {
          if (typeof credentials !== "undefined") {
            const loginPath = credentials?.role === "driver" ? "/auth/login/driver" : "/auth/login";
            const res = await fetch(
              `${process.env.NEXT_PUBLIC_API_HOST}${loginPath}`,
              {
                method: "POST",
                body: JSON.stringify({
                  email: credentials.email,
                  password: credentials.password,
                }),
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
              },
            );

            const user = await res.json();

            if (!res) {
              throw new Error("error login");
            }

            if (res.ok && user) {
              // Enforce role mismatch: selected role must match backend role
              const backendRole = user?.data?.user?.role;
              if (credentials?.role && backendRole && credentials.role !== backendRole) {
                throw new Error("ROLE_MISMATCH");
              }
              // Any object returned will be saved in `user` property of the JWT
              return user.data;
            } else {
              // Handle different error cases
              if (res.status === 401) {
                throw new Error("INVALID_CREDENTIALS");
              } else if (res.status === 404) {
                throw new Error("USER_NOT_FOUND");
              } else if (res.status >= 500) {
                throw new Error("SERVER_ERROR");
              } else {
                throw new Error("LOGIN_FAILED");
              }
            }
          }
        } catch (error) {
          // Re-throw specific errors, otherwise throw generic error
          if (error instanceof Error && error.message) {
            throw error;
          }
          throw new Error("NETWORK_ERROR");
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }: { session: any; token: any }) {
      session.user = token.user;
      session.user.accessToken = token?.token;

      return session;
    },
    async jwt({ token, user }: { token: any; user: any }) {
      return { ...token, ...user };
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 1 * 24 * 60 * 60, // 1 day
  },
  pages: {
    signIn: "/", //sigin page,
    error: "/",
  },
};
