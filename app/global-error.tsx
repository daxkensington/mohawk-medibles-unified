"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div style={{ padding: "40px", fontFamily: "monospace" }}>
          <h1>Global Error</h1>
          <pre style={{ color: "red", whiteSpace: "pre-wrap" }}>
            {error.message}
          </pre>
          <pre style={{ color: "#666", whiteSpace: "pre-wrap" }}>
            {error.stack}
          </pre>
          <p>Digest: {error.digest}</p>
          <button onClick={reset}>Try again</button>
        </div>
      </body>
    </html>
  );
}
