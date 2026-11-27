"use client";

import { FormEvent, useState } from "react";
import SocialAuthButtons from "../../components/social-auth-buttons";

function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? `${window.location.protocol}//${window.location.hostname}:4000`;
}

export default function Signup() {
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch(`${getApiUrl()}/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: form.get("displayName"), email: form.get("email"), password: form.get("password") }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? "Could not create your account.");
      setNotice(result.message ?? "If this address is eligible, the account is ready. Try signing in to continue.");
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
        <p className="eyebrow"><span className="eyebrow-dot" /> A BETTER WAY TO SHARE A HOME</p>
        <h1>Your next chapter starts here.</h1>
        <p className="copy">Create an account to meet compatible flatmates and find a place that feels right.</p>
        <SocialAuthButtons />
        <div className="auth-divider"><span>or use email</span></div>
        <form className="auth-form" onSubmit={submit}>
          <label>Your name<input name="displayName" autoComplete="name" minLength={2} maxLength={80} required /></label>
          <label>Email address<input name="email" type="email" autoComplete="email" required /></label>
          <label>Password<input name="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required /><small>Use at least 12 characters.</small></label>
          {error && <p className="form-message" role="alert">{error}</p>}
          {notice && <p className="form-message" role="status">{notice} <a href="/login">Sign in</a></p>}
          <button className="btn auth-submit" disabled={busy}>{busy ? "Creating account…" : "Create my account"}<span>→</span></button>
        </form>
        <p className="auth-switch">Already have an account? <a href="/login">Sign in</a></p>
      </section>
    </main>
  );
}
