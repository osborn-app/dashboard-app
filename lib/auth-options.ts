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
      },
      async authorize(credentials, req) {
        try {
          if (typeof credentials !== "undefined") {
            const res = await fetch(
              `${process.env.NEXT_PUBLIC_API_HOST}/auth/login`,
              {
                method: "POST",
                body: JSON.stringify(credentials),
                headers: {
                  "Content-Type": "application/json",
                },
              },
            );

            const user = await res.json();

            if (!res) {
              throw new Error("error login");
            }

            if (res.ok && user) {
              // Any object returned will be saved in `user` property of the JWT
              return user.data;
            } else {
              // If you return null then an error will be displayed advising the user to check their details.
              return null;

              // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
            }
          }
        } catch (error) {
          throw new Error("Ops! Ada error.");
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
