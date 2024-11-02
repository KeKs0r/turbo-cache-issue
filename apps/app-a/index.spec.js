import { it, expect } from "bun:test";
import { doSomething } from "./util.js";

it("Test App-A", () => {
  const result = doSomething();
  expect(result).toBe("pkg-a mixed");
});
