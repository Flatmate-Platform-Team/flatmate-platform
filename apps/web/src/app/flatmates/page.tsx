"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ProductNav } from "../../components/product-nav";

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
  const [passedIds, setPassedIds] = useState<string[]>([]);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStartX = useRef(0);
  const swipeDeck = people.filter((person) => !person.liked && !passedIds.includes(person.id));
  const currentPerson = swipeDeck[0];

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
      setPassedIds([]);
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
      setDragX(0);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not connect to the API.");
    } finally { setBusyId(""); }
  }

  function pass(person: Person) {
    setPassedIds((current) => [...current, person.id]);
    setDragX(0);
  }

  function finishSwipe(person: Person, direction: "like" | "pass") {
    setDragging(false);
    if (Math.abs(dragX) < 90) { setDragX(0); return; }
    if (direction === "like") void like(person);
    else pass(person);
  }

  return (
    <main>
      <ProductNav active="Discover" />
      <section className="shell discover-page">
        <div className="eyebrow"><span className="eyebrow-dot" /> GOOD HOMES START WITH GOOD PEOPLE</div>
        <div className="discover-heading"><div><h1>Meet your future flatmates.</h1><p>Explore people by city, read a little about their routine, and connect when it feels right.</p></div><a className="text-link" href="/matches">See your matches <span>↗</span></a></div>
        {matchedName && <div className="match-banner" role="status"><span>✦</span><div><strong>It’s a mutual like with {matchedName}!</strong><p>You can find them in your matches.</p></div><a className="btn btn-small" href="/matches">View matches</a><button aria-label="Dismiss" onClick={() => setMatchedName("")}>×</button></div>}
        <form className="people-search" onSubmit={search}><label>Find people in a city<input value={city} onChange={(event) => setCity(event.target.value)} placeholder="e.g. Bengaluru" maxLength={80} /></label><button className="btn" disabled={loading}>{loading ? "Loading…" : "Search people"}</button></form>
        <div className="results-heading"><h2>{loading ? "Finding people…" : `${swipeDeck.length} ${swipeDeck.length === 1 ? "person" : "people"} to meet`}</h2><span className="swipe-hint">Swipe right to like · left to pass</span></div>
        {error && <p className="listing-state listing-error" role="alert">{error}</p>}
        {!loading && !error && !currentPerson && <div className="listing-state"><span className="empty-icon">♡</span><h3>You’re all caught up.</h3><p>Check your mutual matches, browse homes, or update your profile preferences.</p><div className="deck-empty-actions"><a className="btn" href="/matches">View matches <span>↗</span></a><a className="text-link" href="/discover">Browse homes <span>↗</span></a></div></div>}
        {!loading && !error && currentPerson && <div className="swipe-layout">
          <article
            className={`swipe-card${dragging ? " is-dragging" : ""}`}
            style={{ transform: `translateX(${dragX}px) rotate(${dragX / 18}deg)` }}
            onPointerDown={(event) => { if (event.button !== 0) return; event.currentTarget.setPointerCapture(event.pointerId); dragStartX.current = event.clientX; setDragging(true); setDragX(0); }}
            onPointerMove={(event) => { if (dragging) setDragX(event.clientX - dragStartX.current); }}
            onPointerUp={() => finishSwipe(currentPerson, dragX >= 0 ? "like" : "pass")}
            onPointerCancel={() => { setDragging(false); setDragX(0); }}
            aria-label={`Profile for ${currentPerson.displayName}. Swipe right to like, left to pass.`}
          >
            <div className="swipe-card-visual"><span className="swipe-avatar" aria-hidden="true">{currentPerson.displayName.trim().charAt(0).toUpperCase()}</span><span className={`swipe-stamp${dragX >= 0 ? " like-stamp" : " pass-stamp"}`} style={{ opacity: dragging ? Math.min(1, Math.abs(dragX) / 90) : 0 }} aria-hidden="true">{dragX >= 0 ? "LIKE" : "PASS"}</span><p>{currentPerson.profile?.city || "City not added"}</p></div>
            <div className="swipe-card-info"><div className="swipe-person-heading"><h2>{currentPerson.displayName}</h2><span>Flatmate profile</span></div><p className="person-bio">{currentPerson.profile?.bio || "This person hasn’t added a bio yet."}</p><div className="home-meta">{currentPerson.profile?.budgetMin !== null && currentPerson.profile?.budgetMin !== undefined && <span>From {rupees.format(currentPerson.profile.budgetMin)}</span>}{currentPerson.profile?.budgetMax !== null && currentPerson.profile?.budgetMax !== undefined && <span>Up to {rupees.format(currentPerson.profile.budgetMax)}</span>}</div></div>
          </article>
          <div className="swipe-controls" aria-label="Choose your response"><button className="swipe-pass" onClick={() => pass(currentPerson)} aria-label="Pass this profile">×</button><span>Pass</span><button className="swipe-like" onClick={() => void like(currentPerson)} disabled={busyId === currentPerson.id} aria-label="Like this profile">{busyId === currentPerson.id ? "…" : "♥"}</button><span>Like</span></div>
        </div>}
      </section>
      <footer className="shell footer"><a className="logo" href="/">avenli<span>.</span></a><p>Find your people. Find your place.</p><span>© {new Date().getFullYear()} Avenli · Early concept</span></footer>
    </main>
  );
}
