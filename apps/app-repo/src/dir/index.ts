export async function dirHello() {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log("dir/ Hello World");
}
