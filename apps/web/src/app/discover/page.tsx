"use client";

import { FormEvent, useEffect, useState } from "react";
import { ProductNav } from "../../components/product-nav";

function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? `${window.location.protocol}//${window.location.hostname}:4000`;
}

type Listing = {
  id: string;
  title: string;
  description: string;
  city: string;
  neighborhood: string | null;
  monthlyRent: number;
  deposit: number | null;
  bedrooms: number;
  furnished: boolean;
  availableFrom: string;
  owner: { displayName: string };
};

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export default function DiscoverPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ city: "", minRent: "", maxRent: "" });

  async function loadListings(nextFilters = filters) {
    setLoading(true);
    setError("");
    const params = new URLSearchParams();
    Object.entries(nextFilters).forEach(([key, value]) => { if (value.trim()) params.set(key, value.trim()); });
    try {
      const response = await fetch(`${getApiUrl()}/listings?${params}`, { credentials: "include" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? "Could not load homes.");
      setListings(result.listings);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not connect to the API. Check that it is running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadListings({ city: "", minRent: "", maxRent: "" }); }, []);

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void loadListings();
  }

  return (
    <main>
      <ProductNav active="Explore" />
      <section className="shell discover-page">
        <div className="eyebrow"><span className="eyebrow-dot" /> FIND A PLACE THAT FEELS RIGHT</div>
        <div className="discover-heading"><div><h1>Find your kind of home.</h1><p>Browse shared homes and rooms posted by the community.</p></div><a className="btn" href="/listings/new">List a room <span>↗</span></a></div>
        <form className="search-panel" onSubmit={search}>
          <label>City<input value={filters.city} onChange={(event) => setFilters({ ...filters, city: event.target.value })} placeholder="e.g. Bengaluru" maxLength={80} /></label>
          <label>Rent from<input type="number" min="0" value={filters.minRent} onChange={(event) => setFilters({ ...filters, minRent: event.target.value })} placeholder="₹ 0" /></label>
          <label>Rent to<input type="number" min="0" value={filters.maxRent} onChange={(event) => setFilters({ ...filters, maxRent: event.target.value })} placeholder="₹ 30,000" /></label>
          <button className="btn" disabled={loading}>{loading ? "Searching…" : "Search homes"}</button>
        </form>
        <div className="results-heading"><h2>{loading ? "Finding homes…" : `${listings.length} ${listings.length === 1 ? "home" : "homes"} to explore`}</h2><a className="text-link" href="/listings/new">Have a room to share? <span>↗</span></a></div>
        {error && <p className="listing-state listing-error" role="alert">{error}</p>}
        {!loading && !error && listings.length === 0 && <div className="listing-state"><span className="empty-icon">⌂</span><h3>No homes match just yet.</h3><p>Try a wider budget or another city, or be the first to post a room.</p><a className="btn" href="/listings/new">Create a listing <span>↗</span></a></div>}
        <div className="listing-grid">
          {listings.map((listing) => (
            <article className="home-card" key={listing.id}>
              <div className="home-card-art" aria-hidden="true"><span>⌂</span><i /><b /></div>
              <div className="home-card-content">
                <p className="home-location">{listing.neighborhood ? `${listing.neighborhood} · ` : ""}{listing.city}</p>
                <h3>{listing.title}</h3>
                <p className="home-description">{listing.description}</p>
                <div className="home-meta"><span>{listing.bedrooms} {listing.bedrooms === 1 ? "room" : "rooms"}</span><span>{listing.furnished ? "Furnished" : "Unfurnished"}</span><span>From {new Date(listing.availableFrom).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span></div>
                <div className="home-card-footer"><span><strong>{currency.format(listing.monthlyRent)}</strong><small>/ month</small></span><span className="home-owner">Hosted by {listing.owner.displayName}</span></div>
              </div>
            </article>
          ))}
        </div>
      </section>
      <footer className="shell footer"><a className="logo" href="/">avenli<span>.</span></a><p>Find your people. Find your place.</p><span>© {new Date().getFullYear()} Avenli · Early concept</span></footer>
    </main>
  );
}
