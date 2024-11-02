# App task cached, although dependant package changed

For the reproduction of the issue, we have a simple `app-a` that depends on `pkg-a`.
There is also some test for `app-a` that checks if the app works as expected.

Hint: there is a command to reset the turbo cache: `bun run clean`

### Setup

```bash
bun install
```

### Running (before changes to populate cache)

```bash
turbo run test
```

Output:

```
turbo 2.2.3

• Packages in scope: app-a, app-b, pkg-a, pkg-b, tooling-config
• Running test in 5 packages
• Remote caching disabled
app-a:test: cache miss, executing bb473beea6ee1e4a
pkg-b:test: cache miss, executing 924534894e7e4b4a
pkg-a:test: cache miss, executing 95c34800d9103775
app-a:test:
pkg-a:test:
pkg-b:test:
pkg-a:test: $ echo "Tested!"
app-a:test: $ bun test
pkg-b:test: $ echo "Tested!"
pkg-a:test: Tested!
pkg-b:test: Tested!
app-a:test: bun test v1.1.34-canary.5 (9621b641)
app-a:test:
app-a:test: index.spec.js:
app-a:test: ✓ Test App-A [0.11ms]
app-a:test:
app-a:test:  1 pass
app-a:test:  0 fail
app-a:test:  1 expect() calls
app-a:test: Ran 1 tests across 1 files. [6.00ms]

 Tasks:    3 successful, 3 total
Cached:    0 cached, 3 total
  Time:    79ms
```

When now rerunning `turbo run test` we have a full turbo cache hit.

```
 Tasks:    3 successful, 3 total
Cached:    3 cached, 3 total
  Time:    66ms >>> FULL TURBO
```

### Changing `pkg-a`

We now work happily in our monorepo and change something in our pkg-a

```js
// packages/pkg-a/index.js
export function calculatepkgA() {
  return "pkg-a-changed";
}
```

We know we have good testcases so, we push this change to CI and let it run the tests.

```bash
turbo run test
```

Output:

```
➜  with-shell-commands git:(main) ✗ bun turbo test
turbo 2.2.3

• Packages in scope: app-a, app-b, pkg-a, pkg-b, tooling-config
• Running test in 5 packages
• Remote caching disabled
app-a:test: cache hit (outputs already on disk), replaying logs bb473beea6ee1e4a
pkg-b:test: cache hit (outputs already on disk), replaying logs 924534894e7e4b4a
pkg-a:test: cache miss, executing 5aedbf401a0ab566
app-a:test:
app-a:test: $ bun test
app-a:test: bun test v1.1.34-canary.5 (9621b641)
app-a:test:
app-a:test: index.spec.js:
app-a:test: ✓ Test App-A [0.11ms]
app-a:test:
app-a:test:  1 pass
app-a:test:  0 fail
app-a:test:  1 expect() calls
app-a:test: Ran 1 tests across 1 files. [6.00ms]
pkg-b:test:
pkg-b:test: $ echo "Tested!"
pkg-b:test: Tested!
pkg-a:test:
pkg-a:test: $ echo "Tested!"
pkg-a:test: Tested!

 Tasks:    3 successful, 3 total
Cached:    2 cached, 3 total
  Time:    60ms
```

Awesome, everything works and we can deploy to production......
This is a false sense of safety, since when running the tests for `app-a`, we see that they are failing:

```
bun test v1.1.34-canary.5 (9621b641)

index.spec.js:
1 | import { it, expect } from "bun:test";
2 | import { doSomething } from "./util.js";
3 |
4 | it("Test App-A", () => {
5 |   const result = doSomething();
6 |   expect(result).toBe("pkg-a mixed");
                     ^
error: expect(received).toBe(expected)

Expected: "pkg-a mixed"
Received: "pkg-a-changed mixed"

      at /Users/marc/Workspace/with-shell-commands/apps/app-a/index.spec.js:6:18
✗ Test App-A [3.28ms]

 0 pass
 1 fail
 1 expect() calls
Ran 1 tests across 1 files. [64.00ms]
```

Our turbo run for the tests for `app-a` are cached, no hash input changed, so they were not rerun. Preventing us from catching the bug.
