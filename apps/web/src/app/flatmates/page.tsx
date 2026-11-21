"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? `${window.location.protocol}//${window.location.hostname}:4000`;
}

type Person = {
  id: string;
  displayName: string;
  liked: boolean;
  profile: { bio: string | null; city: string | null; budgetMin: number | null; budgetMax: number | null } | null;
};

const rupees = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export default function FlatmatesPage() {
  const router = useRouter();
  const [people, setPeople] = useState<Person[]>([]);
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [matchedName, setMatchedName] = useState("");

  async function loadPeople(cityFilter = "") {
    setLoading(true);
    setError("");
    const params = new URLSearchParams();
    if (cityFilter.trim()) params.set("city", cityFilter.trim());
    try {
      const response = await fetch(`${getApiUrl()}/flatmates?${params}`, { credentials: "include" });
      const result = await response.json();
      if (response.status === 401) { router.replace("/login"); return; }
      if (!response.ok) throw new Error(result.message ?? "Could not load flatmate profiles.");
      setPeople(result.people);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not connect to the API. Check that it is running.");
    } finally { setLoading(false); }
  }

  useEffect(() => { void loadPeople(); }, []);

  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await loadPeople(city);
  }

  async function like(person: Person) {
    setBusyId(person.id);
    setError("");
    try {
      const response = await fetch(`${getApiUrl()}/flatmates/${encodeURIComponent(person.id)}/like`, {
        method: "POST", credentials: "include",
      });
      const result = await response.json();
      if (response.status === 401) { router.replace("/login"); return; }
      if (!response.ok) throw new Error(result.message ?? "Could not send your like.");
      setPeople((current) => current.map((item) => item.id === person.id ? { ...item, liked: true } : item));
      if (result.matched) setMatchedName(person.displayName);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not connect to the API.");
    } finally { setBusyId(""); }
  }

  return (
    <main>
      <header className="shell nav">
        <a className="logo" href="/">avenli<span>.</span></a>
        <nav className="links" aria-label="Main navigation"><a href="/discover">Homes</a><a href="/flatmates" aria-current="page">Flatmates</a><a href="/matches">Matches</a></nav>
        <div className="nav-actions"><a className="login-link" href="/profile">My profile</a></div>
      </header>
      <section className="shell discover-page">
        <div className="eyebrow"><span className="eyebrow-dot" /> GOOD HOMES START WITH GOOD PEOPLE</div>
        <div className="discover-heading"><div><h1>Meet your future flatmates.</h1><p>Explore people by city, read a little about their routine, and connect when it feels right.</p></div><a className="text-link" href="/matches">See your matches <span>↗</span></a></div>
        {matchedName && <div className="match-banner" role="status"><span>✦</span><div><strong>It’s a mutual like with {matchedName}!</strong><p>You can find them in your matches.</p></div><a className="btn btn-small" href="/matches">View matches</a><button aria-label="Dismiss" onClick={() => setMatchedName("")}>×</button></div>}
        <form className="people-search" onSubmit={search}><label>Find people in a city<input value={city} onChange={(event) => setCity(event.target.value)} placeholder="e.g. Bengaluru" maxLength={80} /></label><button className="btn" disabled={loading}>{loading ? "Loading…" : "Search people"}</button></form>
        <div className="results-heading"><h2>{loading ? "Finding people…" : `${people.length} ${people.length === 1 ? "profile" : "profiles"}`}</h2></div>
        {error && <p className="listing-state listing-error" role="alert">{error}</p>}
        {!loading && !error && people.length === 0 && <div className="listing-state"><span className="empty-icon">◌</span><h3>No profiles found yet.</h3><p>Try another city, or add your own details so others can get to know you.</p><a className="btn" href="/profile">Complete your profile <span>↗</span></a></div>}
        <div className="people-grid">
          {people.map((person) => (
            <article className="person-card" key={person.id}>
              <div className="person-avatar" aria-hidden="true">{person.displayName.trim().charAt(0).toUpperCase()}</div>
              <div className="person-main"><p className="person-city">{person.profile?.city || "City not added"}</p><h3>{person.displayName}</h3><p className="person-bio">{person.profile?.bio || "This person hasn’t added a bio yet."}</p>
                <div className="home-meta">{person.profile?.budgetMin !== null && person.profile?.budgetMin !== undefined && <span>From {rupees.format(person.profile.budgetMin)}</span>}{person.profile?.budgetMax !== null && person.profile?.budgetMax !== undefined && <span>Up to {rupees.format(person.profile.budgetMax)}</span>}</div>
              </div>
              <button className={`like-button${person.liked ? " is-liked" : ""}`} onClick={() => like(person)} disabled={person.liked || busyId === person.id} aria-label={person.liked ? `You liked ${person.displayName}` : `Like ${person.displayName}`}>
                {busyId === person.id ? "…" : person.liked ? "♥ Liked" : "♡ Like"}
              </button>
            </article>
          ))}
        </div>
      </section>
      <footer className="shell footer"><a className="logo" href="/">avenli<span>.</span></a><p>Find your people. Find your place.</p><span>© {new Date().getFullYear()} Avenli · Early concept</span></footer>
    </main>
  );
}
