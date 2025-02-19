"client";

import { Link, useLoaderData } from "react-router";

export default function Login() {
  const data = useLoaderData();
  const { error } = data;

  return (
    <form method="POST" className="sign-in-form">
      <input type="email" name="email" placeholder="you@example.com" className="sign-in__input" />
      <input type="password" name="password" placeholder="•••••••" className="sign-in__input" />
      <Link to="/forgot-password">Forgot Password?</Link>
      {error && <p className="sign-in__error">{error}</p>}
      <button type="submit" className="sign-in__button">Sign In</button>
    </form>
  );
}
