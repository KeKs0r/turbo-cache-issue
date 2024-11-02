import { calculatepkgA } from "pkg-a";

export function doSomething() {
  const pkgA = calculatepkgA();
  const mixed = `${pkgA} mixed`;
  return mixed;
}
