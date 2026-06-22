/**
 * Shared compact page shell for the admin. Centralises the content padding,
 * max width and vertical rhythm so every admin screen reads at the same
 * density. Tighter than the public site on purpose: this is a working CMS.
 */
export function AdminPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl space-y-7 px-6 py-7 md:px-8">{children}</div>
  );
}
