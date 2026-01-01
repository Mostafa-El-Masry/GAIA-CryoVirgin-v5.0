export function parseInput(input: unknown): Record<string, unknown> {
  if (input && typeof input === "object")
    return input as Record<string, unknown>;
  return { raw: input };

export interface RawInput {
  prompt: string;
  options: string[];
}

export interface StructuredInput {
  problem: string;
  options: string[];
  unknowns: string[];
}

export function adaptInput(input: RawInput): StructuredInput {
  return {
    problem: input.prompt,
    options: input.options,
    unknowns: []
  };
}

