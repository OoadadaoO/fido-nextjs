import { redirect } from "next/navigation";

export default function Page() {
  redirect("/account/security");
  return null;
}
