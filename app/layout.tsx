import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Providers from "@/components/layout/providers";
import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { ourFileRouter } from "./api/uploadthing/core";
import 'sweetalert2/dist/sweetalert2.min.css';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Transgo",
  description: "Manage rent car",
  icons: {
    icon: "/logov2.png",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <link
          rel="icon"
          href="/favicon.ico"
          type="image/x-icon"
          sizes="16x16"
        />
        <link rel="apple-touch-icon" sizes="180x180" href="/logo.png" />
        <link rel="shortcut icon" href="/logo.png" />
        <meta property="og:title" content="Dashboard Transgo" />
        <meta property="og:description" content="Dashboard Transgo" />
        <meta property="og:url" content="https://dev.dashboard.transgo.id/" />
        <meta
          property="og:image"
          content="https://dev.dashboard.transgo.id/logo.png"
        />
        <meta property="og:site_name" content="Dashboard Transgo" />
        <meta
          name="twitter:card"
          content="summary_large_image"
          key="twitter-card"
        />

        <meta
          name="twitter:image"
          content="https://dev.dashboard.transgo.id/logo.png"
          key="twitter-banner"
        />
      </head>
      <body className={`${inter.className} overflow-hidden`}>
        <Providers session={session}>
          <Toaster />
          <NextSSRPlugin
            /**
             * The `extractRouterConfig` will extract **only** the route configs
             * from the router to prevent additional information from being
             * leaked to the client. The data passed to the client is the same
             * as if you were to fetch `/api/uploadthing` directly.
             */
            routerConfig={extractRouterConfig(ourFileRouter)}
          />
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
        </Providers>
      </body>
    </html>
  );
}
