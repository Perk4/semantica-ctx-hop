export type Fact = { s: string; r: string; o: string };
export type Store = Fact[];

function requireNonEmptyString(value: unknown, name: string): string {
  if (typeof value !== "string" || value === "") {
    throw new Error(`${name} must be a non-empty string`);
  }
  return value;
}

function tokenCount(prompt: string): number {
  const trimmed = prompt.trim();
  if (trimmed === "") {
    return 0;
  }
  return trimmed.split(/\s+/).length;
}

export function ingestFact(store: Store, fact: Fact): void {
  const s = requireNonEmptyString(fact.s, "s");
  const r = requireNonEmptyString(fact.r, "r");
  const o = requireNonEmptyString(fact.o, "o");
  store.push({ s, r, o });
}

export function hopNeighbors(store: Store, entity: string): Fact[] {
  if (typeof entity !== "string" || entity === "") {
    throw new Error("entity must be a non-empty string");
  }
  const edges = store.filter((fact) => fact.s === entity || fact.o === entity);
  if (edges.length === 0) {
    throw new Error(`${entity} is unknown`);
  }
  return edges;
}

export function bundleContext(edges: Fact[], maxTokens: number): string {
  if (typeof maxTokens !== "number" || !Number.isFinite(maxTokens) || maxTokens < 0) {
    throw new Error("maxTokens must be a finite number >= 0");
  }
  if (edges.length === 0 || maxTokens === 0) {
    return "";
  }
  const included: string[] = [];
  for (const fact of edges) {
    const line = `${fact.s} ${fact.r} ${fact.o}`;
    const prompt = included.length === 0 ? line : `${included.join("\n")}\n${line}`;
    if (tokenCount(prompt) <= maxTokens) {
      included.push(line);
    }
  }
  return included.join("\n");
}

export function assertRoundTrip(): void {
  const store: Store = [];
  ingestFact(store, { s: "Alice", r: "knows", o: "Bob" });
  ingestFact(store, { s: "Bob", r: "worksAt", o: "Acme" });
  ingestFact(store, { s: "Alice", r: "livesIn", o: "Paris" });
  const edges = hopNeighbors(store, "Alice");
  const prompt = bundleContext(edges, 6);
  if (!prompt.includes("Bob") || !prompt.includes("Paris")) {
    throw new Error("round trip dropped a neighbor name");
  }
  try {
    hopNeighbors(store, "Nobody");
  } catch (error) {
    if (error instanceof Error && error.message.includes("Nobody")) {
      return;
    }
    throw error;
  }
  throw new Error("hopNeighbors did not throw for unknown entity Nobody");
}
