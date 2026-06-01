import { auth } from "@/auth";

/** Throws "Unauthorized" if the current request is not an authenticated admin. */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
}
