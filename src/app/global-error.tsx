"use client";

// Replaces the root layout when an error escapes it, so it must ship its own
// html/body and cannot rely on the app's fonts or stylesheet. Kept minimal and
// bilingual since there is no locale context at this level.
export default function GlobalError({
  reset,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  reset?: () => void;
  unstable_retry?: () => void;
}) {
  const retry = unstable_retry ?? reset;
  return (
    <html lang="ko">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1A1F1B",
          color: "#FAFBF9",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
          padding: "2rem",
        }}
      >
        <main style={{ maxWidth: "32rem", textAlign: "center" }}>
          <p
            style={{
              fontFamily: "ui-monospace, monospace",
              fontSize: "0.6875rem",
              letterSpacing: "0.08em",
              color: "#3FA66A",
              margin: 0,
            }}
          >
            ERROR
          </p>
          <h1 style={{ fontSize: "1.5rem", margin: "1rem 0 0.75rem" }}>
            문제가 발생했습니다 / Something went wrong
          </h1>
          <p style={{ fontSize: "0.9rem", opacity: 0.7, margin: 0 }}>
            잠시 후 다시 시도해 주세요. / Please try again shortly.
          </p>
          {retry && (
            <button
              type="button"
              onClick={() => retry()}
              style={{
                marginTop: "1.5rem",
                background: "#0F5132",
                color: "#FAFBF9",
                border: "none",
                padding: "0.75rem 1.5rem",
                fontSize: "0.875rem",
                cursor: "pointer",
              }}
            >
              다시 시도 / Try again
            </button>
          )}
        </main>
      </body>
    </html>
  );
}
