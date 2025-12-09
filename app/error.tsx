"use client";

import { useEffect } from "react";
// Sentry disabled - not using Sentry anymore
// import * as Sentry from "@sentry/nextjs";

export default function ErrorPage({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => { //redeploy rollback
    // Sentry disabled
    // Sentry.captureException(error);
    console.error("Error:", error);
  }, [error]);

  return (
    <div>
      <h2>Something went wrong!</h2>
    </div>
  );
}
