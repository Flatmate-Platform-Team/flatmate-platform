"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? `${window.location.protocol}//${window.location.hostname}:4000`;
}

export default function Login() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch(`${getApiUrl()}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? "Could not sign in.");
      router.replace("/flatmates");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not connect to the server. Make sure the API is running.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-shell">
      <a className="logo" href="/">avenli<span>.</span></a>
      <section className="auth-card">
        <p className="eyebrow"><span className="eyebrow-dot" /> GOOD TO HAVE YOU BACK</p>
        <h1>Welcome back.</h1>
        <p className="copy">Sign in to pick up where your next chapter begins.</p>
        <form className="auth-form" onSubmit={submit}>
          <label>Email address<input name="email" type="email" autoComplete="email" required /></label>
          <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
          {error && <p className="form-message" role="alert">{error}</p>}
          <button className="btn auth-submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"}<span>→</span></button>
        </form>
        <p className="auth-switch">New to Avenli? <a href="/signup">Create an account</a></p>
        <p className="auth-switch admin-login-link"><a href="/admin/login">Administrator sign in</a></p>
      </section>
    </main>
  );
}
