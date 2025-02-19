import { redirect } from "react-router";

export function loader() {
  const isSessionValid = true;

  if (isSessionValid) {
    return redirect("/explore");
  }
}
