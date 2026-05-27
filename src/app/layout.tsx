// Root layout is a pass-through. Locale-aware html/body lives in [locale]/layout.tsx;
// admin (when added) will have its own html/body. This allows independent locale and
// admin shells.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
