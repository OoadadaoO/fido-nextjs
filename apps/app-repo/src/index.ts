import * as pkg from "@fido/pkg-repo";

import { dirHello } from "./dir";

export async function hello() {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log("/ Hello World");
}

console.log("Pkg Demo");
await pkg.hello();
await pkg.dirHello();

console.log("App Demo");
await hello();
await dirHello();
