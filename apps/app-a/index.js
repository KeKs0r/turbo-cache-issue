import { doSomething } from "./util.js";

main();
function main() {
  console.log("App-A");
  const mixed = doSomething();
  console.log(mixed);
}
