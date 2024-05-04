export async function hello() {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log("/ Hello World");
}

export { dirHello } from "./dir";
