"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? `${window.location.protocol}//${window.location.hostname}:4000`;
}

export default function NewListingPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const data = Object.fromEntries(form.entries());
    data.furnished = String(form.get("furnished") === "on");
    try {
      const response = await fetch(`${getApiUrl()}/listings`, {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      });
      const result = await response.json();
      if (response.status === 401) { router.replace("/login"); return; }
      if (!response.ok) throw new Error(result.message ?? "Could not create your listing.");
      router.push("/discover");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not connect to the API. Check that it is running.");
    } finally { setBusy(false); }
  }

  return (
    <main className="auth-shell listing-form-shell">
      <a className="logo" href="/">avenli<span>.</span></a>
      <section className="auth-card">
        <p className="eyebrow"><span className="eyebrow-dot" /> SHARE A SPACE</p>
        <h1>List a room.</h1>
        <p className="copy">Add the details that help someone picture a good day at home. Keep exact street addresses private.</p>
        <form className="auth-form" onSubmit={submit}>
          <label>Listing title<input name="title" minLength={8} maxLength={100} required placeholder="A sunlit room in a friendly shared home" /></label>
          <label>Description<textarea name="description" minLength={20} maxLength={1600} rows={5} required placeholder="Tell people about the room, home, and what sharing the space is like." /></label>
          <div className="budget-row"><label>City<input name="city" maxLength={80} required placeholder="Bengaluru" /></label><label>Neighborhood (optional)<input name="neighborhood" maxLength={100} placeholder="Indiranagar" /></label></div>
          <div className="budget-row"><label>Monthly rent (₹)<input name="monthlyRent" type="number" min="1" max="1000000" required placeholder="14500" /></label><label>Deposit (₹)<input name="deposit" type="number" min="0" max="1000000" placeholder="Optional" /></label></div>
          <div className="budget-row"><label>Bedrooms<input name="bedrooms" type="number" min="1" max="20" defaultValue="1" required /></label><label>Available from<input name="availableFrom" type="date" required /></label></div>
          <label className="check-label"><input name="furnished" type="checkbox" /> Furnished</label>
          {error && <p className="form-message" role="alert">{error}</p>}
          <button className="btn auth-submit" disabled={busy}>{busy ? "Publishing…" : "Publish listing"}<span>→</span></button>
        </form>
      </section>
    </main>
  );
}
