import { data, Link, redirect } from "react-router";
import { commitSession, getSession } from "../sessions.server";
import type { Route } from "../../types/frontend/app/views/+types/sign-in";
import SignInForm from "~/features/authentication/sign-in-form";

async function validateCredentials(email: any, password: any) {
  if (email === "test@test.com" && password === "test") {
    return "1";
  }

  return null;
}

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));

  if (session.has("userId")) {
    return redirect("/");
  }

  return data(
    { error: session.get("error") },
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    }
  );
}

export async function action({ request }: Route.ActionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const form = await request.formData();
  const username = form.get("email");
  const password = form.get("password");

  const userId = await validateCredentials(username, password);

  if (userId == null) {
    session.flash("error", "Invalid email or password");

    // Redirect back to the login page with errors.
    return redirect("/sign-in", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  session.set("userId", userId);

  // Login succeeded, send them to the home page.
  return redirect("/explore", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export default function SignIn() {
  return (
    <div className="sign-in">
      <div className="sign-in__content">
        <main className="sign-in__main">
          <div className="sign-in__login">
            <section className="sign-in__welcome">
              <h2>Welcome</h2>
              <p>Sign in to your account</p>
            </section>
            <SignInForm />
          </div>
        </main>
        <footer className="sign-in__footer">
          By continuing, you agree to SwitchUp&apos;s{" "}
          <Link to="/terms-of-service">Terms of Service</Link> and{" "}
          <Link to="/privacy-policy">Privacy Policy</Link>, and to receive
          periodic emails with updates.
        </footer>
      </div>
      <aside className="sign-in__sidebar"></aside>
    </div>
  );
}
