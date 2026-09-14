import assert from "node:assert/strict";
import { test } from "node:test";
import {
  assertRoundTrip,
  bundleContext,
  hopNeighbors,
  ingestFact,
} from "../src/index.ts";
import type { Store } from "../src/index.ts";

test("hopNeighbors returns the Alice-knows-Bob fact after ingest", () => {
  const store: Store = [];
  ingestFact(store, { s: "Alice", r: "knows", o: "Bob" });
  assert.deepEqual(hopNeighbors(store, "Alice"), [
    { s: "Alice", r: "knows", o: "Bob" },
  ]);
});

test("hopNeighbors returns Alice facts in ingest order and skips Bob-Acme", () => {
  const store: Store = [];
  ingestFact(store, { s: "Alice", r: "knows", o: "Bob" });
  ingestFact(store, { s: "Bob", r: "worksAt", o: "Acme" });
  ingestFact(store, { s: "Alice", r: "livesIn", o: "Paris" });
  assert.deepEqual(hopNeighbors(store, "Alice"), [
    { s: "Alice", r: "knows", o: "Bob" },
    { s: "Alice", r: "livesIn", o: "Paris" },
  ]);
});

test("hopNeighbors throws for an unknown entity", () => {
  const store: Store = [];
  ingestFact(store, { s: "Alice", r: "knows", o: "Bob" });
  ingestFact(store, { s: "Bob", r: "worksAt", o: "Acme" });
  ingestFact(store, { s: "Alice", r: "livesIn", o: "Paris" });
  assert.throws(
    () => hopNeighbors(store, "Nobody"),
    (error: unknown) =>
      error instanceof Error && error.message.includes("Nobody"),
  );
});

test("bundleContext keeps both facts at 6 tokens", () => {
  assert.equal(
    bundleContext(
      [
        { s: "Alice", r: "knows", o: "Bob" },
        { s: "Alice", r: "livesIn", o: "Paris" },
      ],
      6,
    ),
    "Alice knows Bob\nAlice livesIn Paris",
  );
});

test("bundleContext drops the second fact at 3 tokens", () => {
  assert.equal(
    bundleContext(
      [
        { s: "Alice", r: "knows", o: "Bob" },
        { s: "Alice", r: "livesIn", o: "Paris" },
      ],
      3,
    ),
    "Alice knows Bob",
  );
});

test("bundleContext of no edges is an empty string", () => {
  assert.equal(bundleContext([], 10), "");
});

test("assertRoundTrip does not throw", () => {
  assertRoundTrip();
});

test("ingestFact throws on an empty s", () => {
  const store: Store = [];
  assert.throws(
    () => ingestFact(store, { s: "", r: "knows", o: "Bob" }),
    (error: unknown) => error instanceof Error && error.message.includes("s"),
  );
});
