"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProductNav } from "../../components/product-nav";

function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? `${window.location.protocol}//${window.location.hostname}:4000`;
}
type Profile = { bio?: string | null; city?: string | null; budgetMin?: number | null; budgetMax?: number | null };

export default function ProfilePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [profile, setProfile] = useState<Profile>({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`${getApiUrl()}/profiles/me`, { credentials: "include" })
      .then(async (response) => {
        if (response.status === 401) { router.replace("/login"); return; }
        if (!response.ok) throw new Error("Could not load your profile.");
        const result = await response.json();
        setName(result.user.displayName);
        setProfile(result.profile ?? {});
        setProfileLoaded(true);
      })
      .catch(() => setMessage("We couldn’t load your profile. Check that the API is running and try again."));
  }, [router]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch(`${getApiUrl()}/profiles/me`, {
        method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city: form.get("city"), bio: form.get("bio"), budgetMin: form.get("budgetMin"), budgetMax: form.get("budgetMax") }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? "Could not save your profile.");
      setMessage("Your profile is saved.");
      setSaved(true);
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "Could not connect to the server.");
    } finally { setBusy(false); }
  }

  async function logout() {
    await fetch(`${getApiUrl()}/auth/logout`, { method: "POST", credentials: "include" });
    router.replace("/login");
  }

  return (
    <main className="product-page">
      <ProductNav active="Profile" name={name} />
      <section className="auth-card profile-card">
        <p className="eyebrow"><span className="eyebrow-dot" /> YOUR SPACE</p>
        <h1>Make it yours{name ? `, ${name.split(" ")[0]}` : ""}.</h1>
        <p className="copy">A few details help us find flatmates and homes that fit your life.</p>
        <form className="auth-form" onSubmit={save} key={String(profileLoaded)}>
          <label>City<input name="city" defaultValue={profile.city ?? ""} maxLength={100} placeholder="Where are you looking?" /></label>
          <label>About you<textarea name="bio" defaultValue={profile.bio ?? ""} maxLength={500} rows={4} placeholder="A little about your routine, interests, or ideal home…" /></label>
          <div className="budget-row">
            <label>Monthly budget from<input name="budgetMin" type="number" min="0" defaultValue={profile.budgetMin ?? ""} placeholder="₹ 0" /></label>
            <label>To<input name="budgetMax" type="number" min="0" defaultValue={profile.budgetMax ?? ""} placeholder="₹ 0" /></label>
          </div>
          {message && <p className="form-message" role="status">{message}</p>}
          <button className="btn auth-submit" disabled={busy}>{busy ? "Saving…" : "Save profile"}<span>→</span></button>
        </form>
        {saved && <div className="profile-next-step"><strong>Your profile is ready.</strong><p>Start exploring people and homes that could fit your next move.</p><div><a className="btn" href="/flatmates">Meet flatmates <span>↗</span></a><a className="text-link" href="/discover">Browse homes <span>↗</span></a></div></div>}
        <button className="logout-button" onClick={logout}>Sign out</button>
      </section>
    </main>
  );
}
