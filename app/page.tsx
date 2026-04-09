import { redirect } from "next/navigation";

// initial entrypoint should send users to the home page
export default function Home() {
  redirect("/home");
  return null;
}
