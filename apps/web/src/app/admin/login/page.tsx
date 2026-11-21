"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? `${window.location.protocol}//${window.location.hostname}:4000`;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch(`${getApiUrl()}/auth/admin/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? "Administrator sign-in failed.");
      router.replace("/admin/profiles");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not connect to the API. Check that it is running.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-shell">
      <a className="logo" href="/">avenli<span>.</span></a>
      <section className="auth-card">
        <p className="eyebrow"><span className="eyebrow-dot" /> SECURE ADMIN ACCESS</p>
        <h1>Administrator sign in.</h1>
        <p className="copy">Use your Avenli account credentials. Only accounts granted the admin role can continue.</p>
        <form className="auth-form" onSubmit={submit}>
          <label>Email address<input name="email" type="email" autoComplete="username" required /></label>
          <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
          {error && <p className="form-message" role="alert">{error}</p>}
          <button className="btn auth-submit" disabled={busy}>{busy ? "Verifying access…" : "Sign in as administrator"}<span>→</span></button>
        </form>
        <p className="auth-switch"><a href="/login">Return to member sign in</a></p>
      </section>
    </main>
  );
}
