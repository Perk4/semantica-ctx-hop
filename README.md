# semantica-ctx-hop

In-memory graph context hop for agents. Facts live in a list. The list is the store. This package is not Semantica cloud.

## Functions

The public functions are `ingestFact`, `hopNeighbors`, `bundleContext`, and `assertRoundTrip`.

### ingestFact

`ingestFact(store, fact)` appends `{ s, r, o }` onto `store`. `s`, `r`, and `o` must be non-empty strings. A violation throws `Error`.

### hopNeighbors

`hopNeighbors(store, entity)` returns every fact where `entity` is `s` or `o`, in store order. If `entity` never appears, the call throws `Error`. The message names the entity and states that it is unknown. An empty `entity` throws `Error`.

### bundleContext

`bundleContext(edges, maxTokens)` returns a prompt string. Each included fact is one line `s r o`. Lines join with `\n`.

Tokens are whitespace-separated words in the assembled prompt after `trim` and `split(/\s+/)`. An empty prompt is 0 tokens. Facts are considered in given order. A fact is included only when the prompt stays `<= maxTokens`. Empty `edges` returns `""`. `maxTokens` of `0` returns `""`. A `maxTokens` that is not a finite number `>= 0` throws `Error`.

### assertRoundTrip

`assertRoundTrip()` builds a fresh store, ingests three facts that share one hub entity and two neighbors, hops the hub, and bundles with a budget that keeps both neighbor names. It throws if a neighbor name is missing from the prompt. It then hops a missing entity name and throws if that hop does not throw. It returns `void` on success.

## Types

`Fact` is `{ s: string; r: string; o: string }`. `Store` is `Fact[]`. There is no `createStore`. Start with `const store: Store = []`.

## Usage

```ts
import {
	ingestFact,
	hopNeighbors,
	bundleContext,
} from "semantica-ctx-hop";
import type { Store } from "semantica-ctx-hop";

const store: Store = [];
ingestFact(store, { s: "Alice", r: "knows", o: "Bob" });
ingestFact(store, { s: "Bob", r: "worksAt", o: "Acme" });
ingestFact(store, { s: "Alice", r: "livesIn", o: "Paris" });
const edges = hopNeighbors(store, "Alice");
const prompt = bundleContext(edges, 6);
```

## Limits

The store is in memory. There is no HTTP server, CLI, product UI, or persistence.

## Tests

`npm test` runs `node --experimental-strip-types --test test/*.test.ts`.
