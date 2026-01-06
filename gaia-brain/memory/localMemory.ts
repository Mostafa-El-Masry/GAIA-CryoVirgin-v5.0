const MEMORY_KEY = "__gaia_brain_memory__";

export function writeMemory(content: string) {
  try {
    localStorage.setItem(MEMORY_KEY, content);
  } catch {
    // silence is intentional
  }
}

export function readMemory(): string {
  try {
    return localStorage.getItem(MEMORY_KEY) ?? "";
  } catch {
    return "";
  }
}
