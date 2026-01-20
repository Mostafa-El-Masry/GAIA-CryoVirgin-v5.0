import { cookies, headers } from "next/headers";

export async function verifyCSRF() {
  const cookieStore = await cookies();
  const headersStore = await headers();
  const cookie = cookieStore.get("gaia.csrf")?.value;
  const header = headersStore.get("x-gaia-csrf");

  if (!cookie || cookie !== header) {
    throw new Error("CSRF violation");
  }
}
