"use client"; // Error components must be Client Components

import { useEffect } from "react";
// Sentry disabled - not using Sentry anymore
// import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Sentry disabled - just log to console
    // Sentry.captureException(error);
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body>
        {/* This is the default Next.js error component but it doesn't allow omitting the statusCode property yet. */}
        <NextError statusCode={undefined as any} />
      </body>
    </html>
  );
}
