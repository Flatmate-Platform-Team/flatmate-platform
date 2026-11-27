"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProductNav } from "../../components/product-nav";

function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? `${window.location.protocol}//${window.location.hostname}:4000`;
}

type MatchPerson = { id: string; displayName: string; profile: { bio: string | null; city: string | null; budgetMin: number | null; budgetMax: number | null } | null };
type Match = { id: string; createdAt: string; person: MatchPerson };

export default function MatchesPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${getApiUrl()}/matches`, { credentials: "include" })
      .then(async (response) => {
        const result = await response.json();
        if (response.status === 401) { router.replace("/login"); return; }
        if (!response.ok) throw new Error(result.message ?? "Could not load your matches.");
        setMatches(result.matches);
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Could not connect to the API."))
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <main>
      <ProductNav active="Messages" />
      <section className="shell discover-page">
        <div className="eyebrow"><span className="eyebrow-dot" /> A CONNECTION GOES BOTH WAYS</div>
        <div className="discover-heading"><div><h1>Your mutual matches.</h1><p>When you both like each other, you’ll find the connection here.</p></div><a className="btn" href="/flatmates">Discover flatmates <span>↗</span></a></div>
        {error && <p className="listing-state listing-error" role="alert">{error}</p>}
        {loading && <p className="listing-state">Loading your matches…</p>}
        {!loading && !error && matches.length === 0 && <div className="listing-state"><span className="empty-icon">♡</span><h3>No mutual matches yet.</h3><p>Like a profile in discovery. When they like you back, you’ll see them here.</p><a className="btn" href="/flatmates">Meet flatmates <span>↗</span></a></div>}
        <div className="people-grid">
          {matches.map((match) => (
            <article className="person-card match-card" key={match.id}>
              <div className="person-avatar match-avatar" aria-hidden="true">{match.person.displayName.trim().charAt(0).toUpperCase()}</div>
              <div className="person-main"><p className="person-city">{match.person.profile?.city || "City not added"}</p><h3>{match.person.displayName}</h3><p className="person-bio">{match.person.profile?.bio || "This person hasn’t added a bio yet."}</p><span className="match-date">Matched {new Date(match.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span></div>
            </article>
          ))}
        </div>
      </section>
      <footer className="shell footer"><a className="logo" href="/">avenli<span>.</span></a><p>Find your people. Find your place.</p><span>© {new Date().getFullYear()} Avenli · Early concept</span></footer>
    </main>
  );
}
