"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProductNav } from "../../components/product-nav";

function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? `${window.location.protocol}//${window.location.hostname}:4000`;
}

type Listing = { id: string; title: string; city: string; neighborhood: string | null; monthlyRent: number; bedrooms: number; furnished: boolean };
type DashboardData = { name: string; city: string; flatmates: number; listings: Listing[] };
const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const stories = [
  { name: "Ananya", area: "Room tour", photo: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=220&q=75" },
  { name: "Rohan", area: "Slow mornings", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=220&q=75" },
  { name: "Mira", area: "Our new home", photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=220&q=75" },
  { name: "Arjun", area: "City guide", photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=220&q=75" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData>({ name: "there", city: "Add your location", flatmates: 0, listings: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savedListings, setSavedListings] = useState<string[]>([]);
  const [nearby, setNearby] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch(`${getApiUrl()}/profiles/me`, { credentials: "include" }),
      fetch(`${getApiUrl()}/flatmates`, { credentials: "include" }),
      fetch(`${getApiUrl()}/listings`, { credentials: "include" }),
    ]).then(async ([profileResponse, peopleResponse, listingsResponse]) => {
      if (profileResponse.status === 401) { router.replace("/login"); return; }
      const [profileData, peopleData, listingData] = await Promise.all([profileResponse.json(), peopleResponse.json(), listingsResponse.json()]);
      if (!profileResponse.ok) throw new Error(profileData.message ?? "Could not load your dashboard.");
      if (active) setData({
        name: profileData.user?.displayName ?? "there",
        city: profileData.profile?.city ?? "Add your location",
        flatmates: peopleResponse.ok ? peopleData.people?.length ?? 0 : 0,
        listings: listingsResponse.ok ? listingData.listings ?? [] : [],
      });
    }).catch((reason: unknown) => {
      if (active) setError(reason instanceof Error ? reason.message : "Could not load your dashboard.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [router]);

  const featured = useMemo(() => data.listings.slice(0, 2), [data.listings]);
  const firstName = data.name.split(" ")[0];

  return (
    <main className="product-page">
      <ProductNav active="Discover" name={data.name} />
      <div className="dashboard-shell">
        <section className="dashboard-greeting">
          <div><p className="dashboard-kicker">YOUR NEXT CHAPTER STARTS HERE</p><h1>Hey, {firstName} <span aria-hidden="true">👋</span></h1><Link href="/profile" className="dashboard-location">⌖ &nbsp;{data.city} <span>↗</span></Link></div>
          <Link className="dashboard-notification" href="/messages" aria-label="Open messages and notifications"><span aria-hidden="true">◌</span><i /></Link>
        </section>

        <section className="dashboard-hero">
          <div className="dashboard-hero-copy"><p className="dashboard-kicker">GOOD LIVING STARTS WITH THE RIGHT PEOPLE</p><h2>Find Your<br />Next Flatmate</h2><p>Better living starts with the right people.</p><Link className="dashboard-primary" href="/flatmates">Discover flatmates <span>↗</span></Link></div>
          <div className="dashboard-hero-orbit" aria-hidden="true"><span>01</span><span>02</span><span>03</span></div>
          <div className="dashboard-hero-note"><strong>{loading ? "Finding your people…" : `${data.flatmates} profiles to explore`}</strong><span>Live from your discovery list</span></div>
        </section>

        {error ? <div className="dashboard-alert" role="alert">{error} <button type="button" onClick={() => window.location.reload()}>Retry</button></div> : null}

        <section className="dashboard-section">
          <div className="dashboard-section-title"><div><p className="dashboard-kicker">EXPLORE WHAT’S NEXT</p><h2>Make your next move.</h2></div><Link href="/discover">Browse all <span>↗</span></Link></div>
          <div className="dashboard-feature-grid">
            <article className="dashboard-feature dashboard-feature-people"><div className="feature-image-people" role="img" aria-label="Sample flatmate portrait" /><div className="dashboard-feature-content"><span className="feature-label">YOUR PEOPLE</span><h3>Find a flatmate</h3><p>{loading ? "Loading profiles" : `${data.flatmates} profiles available`}</p><Link href="/flatmates">Explore flatmates <span>↗</span></Link></div></article>
            <article className="dashboard-feature dashboard-feature-homes"><div className="feature-image-home" role="img" aria-label="Illustrative apartment interior photograph" /><div className="dashboard-feature-content"><span className="feature-label">YOUR NEXT ADDRESS</span><h3>Explore flats</h3><p><strong>86</strong> rooms · preview count</p><Link href="/discover">Explore homes <span>↗</span></Link></div></article>
          </div>
        </section>

        <section className="dashboard-ai-card">
          <div><p className="dashboard-kicker">AI MATCHING</p><h2>AI Matches For You</h2><p>Compare budgets, locations, and the little routines that make sharing a home work.</p><span className="preview-chip">ILLUSTRATIVE MATCH PREVIEW</span></div>
          <div className="dashboard-score" aria-label="Illustrative sample compatibility score"><strong>92</strong><span>%</span><small>SAMPLE</small></div>
          <Link href="/compatibility" className="dashboard-ai-link">Explore matching <span>↗</span></Link>
        </section>

        <section className="dashboard-section">
          <div className="dashboard-section-title"><div><p className="dashboard-kicker">COMMUNITY PICKS</p><h2>Recently added flats.</h2></div><Link href="/discover">See all <span>↗</span></Link></div>
          {loading ? <div className="dashboard-empty">Loading the latest listings…</div> : featured.length ? <div className="dashboard-listing-grid">{featured.map((listing, index) => { const isSaved = savedListings.includes(listing.id); return <article className="dashboard-listing" key={listing.id}><div className={`dashboard-listing-image listing-image-${index + 1}`} role="img" aria-label="Illustrative room photograph"><span>LISTED BY COMMUNITY</span><button type="button" aria-label={isSaved ? "Remove this sample from saved homes" : "Save this sample home"} aria-pressed={isSaved} onClick={() => setSavedListings((current) => isSaved ? current.filter((id) => id !== listing.id) : [...current, listing.id])}>{isSaved ? "♥" : "♡"}</button></div><div className="dashboard-listing-body"><p>{listing.neighborhood ? `${listing.neighborhood} · ` : ""}{listing.city}</p><h3>{listing.title}</h3><div className="dashboard-listing-meta"><span>{listing.bedrooms} bedrooms</span>{listing.furnished ? <span>Furnished</span> : null}<span>Photo illustrative</span></div><strong>{money.format(listing.monthlyRent)}<small> / month</small></strong></div></article>; })}</div> : <div className="dashboard-empty"><span>⌂</span><h3>New homes are on the way.</h3><p>When the community posts rooms, they’ll appear here.</p><Link href="/listings/new" className="dashboard-inline-link">List a room <span>↗</span></Link></div>}
        </section>

        <section className="dashboard-section dashboard-stories-section">
          <div className="dashboard-section-title"><div><p className="dashboard-kicker">LIFE, SHARED</p><h2>Roommate stories.</h2></div><Link href="/stories">See all <span>↗</span></Link></div>
          <div className="dashboard-stories">{stories.map((story) => <Link href="/stories" key={story.name} className="dashboard-story"><span className="dashboard-story-photo" style={{ backgroundImage: `url("${story.photo}")` }} role="img" aria-label={`Sample portrait for ${story.name}`} /><strong>{story.name}</strong><small>{story.area}</small></Link>)}<Link href="/stories" className="dashboard-story dashboard-add-story"><span>＋</span><strong>Add story</strong><small>Your next chapter</small></Link></div>
        </section>

        <section className="dashboard-section dashboard-nearby-section">
          <div className="dashboard-section-title"><div><p className="dashboard-kicker">FIND YOUR NEIGHBOURHOOD</p><h2>Nearby locations.</h2></div></div>
          <div className="dashboard-city-list">{["Bengaluru", "Pune", "Mumbai", "Hyderabad"].map((city) => <button key={city} type="button" className={nearby === city ? "is-selected" : ""} onClick={() => setNearby(city)}>{city}</button>)}</div>
          {nearby ? <p className="dashboard-city-note">{nearby} selected. Home search is available on the Explore page.</p> : null}
        </section>

        <section className="dashboard-household-shortcuts"><Link href="/household"><span>◫</span><strong>Splitmate & ChoreMate</strong><small>Keep shared home tasks in sync</small><b>↗</b></Link><Link href="/trustscore"><span>◈</span><strong>Trust & verification</strong><small>See what has actually been confirmed</small><b>↗</b></Link></section>
        <p className="dashboard-disclaimer">Property photos, stories, room count, and match score are illustrative. API listings show community details; listing photos are not stored by this version.</p>
      </div>
    </main>
  );
}
