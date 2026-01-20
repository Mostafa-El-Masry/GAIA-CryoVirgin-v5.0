export function assertServerOnly() {
  if (typeof window !== "undefined") {
    throw new Error("Server-only violation");
  }
}
