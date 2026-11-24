"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? `${window.location.protocol}//${window.location.hostname}:4000`;
}

type AdminProfile = {
  id: string;
  bio: string | null;
  city: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  user: { id: string; email: string; displayName: string; status: string; isTestAccount: boolean; createdAt: string };
};

const rupees = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export default function AdminProfilesPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [removingId, setRemovingId] = useState("");

  useEffect(() => {
    fetch(`${getApiUrl()}/admin/profiles`, { credentials: "include" })
      .then(async (response) => {
        const result = await response.json();
        if (response.status === 401) { router.replace("/admin/login"); return; }
        if (response.status === 403) { setMessage("This page is for administrators only."); return; }
        if (!response.ok) throw new Error(result.message ?? "Could not load profiles.");
        setProfiles(result.profiles);
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : "Could not connect to the API."))
      .finally(() => setLoading(false));
  }, [router]);

  async function removeTestAccount(profile: AdminProfile) {
    if (!profile.user.isTestAccount || !window.confirm(`Permanently remove test account ${profile.user.displayName}?`)) return;
    setRemovingId(profile.user.id);
    setMessage("");
    try {
      const response = await fetch(`${getApiUrl()}/admin/test-accounts/${encodeURIComponent(profile.user.id)}`, {
        method: "DELETE", credentials: "include",
      });
      const result = await response.json();
      if (response.status === 401) { router.replace("/admin/login"); return; }
      if (!response.ok) throw new Error(result.message ?? "Could not remove this test account.");
      setProfiles((current) => current.filter((item) => item.user.id !== profile.user.id));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not connect to the API.");
    } finally { setRemovingId(""); }
  }

  return (
    <main>
      <header className="shell nav"><a className="logo" href="/">avenli<span>.</span></a><nav className="links" aria-label="Admin navigation"><a href="/discover">Homes</a><a href="/flatmates">Flatmates</a><a href="/matches">Matches</a></nav><span className="admin-label">Admin</span></header>
      <section className="shell discover-page">
        <div className="eyebrow"><span className="eyebrow-dot" /> ADMINISTRATION</div>
        <div className="discover-heading"><div><h1>Saved member profiles.</h1><p>Private profile information is visible only to an administrator account.</p></div><span className="admin-count">{profiles.length} profiles</span></div>
        {message && <p className="listing-state listing-error" role="alert">{message}</p>}
        {loading && <p className="listing-state">Loading saved profiles…</p>}
        {!loading && !message && profiles.length === 0 && <div className="listing-state"><h3>No saved profiles yet.</h3><p>Profiles appear here after members save their details.</p></div>}
        {!loading && !message && profiles.length > 0 && <div className="admin-profile-list">
          {profiles.map((profile) => (
            <article className="admin-profile-card" key={profile.id}>
              <div className="admin-profile-head"><div><p className="person-city">{profile.city || "City not added"}{profile.user.isTestAccount && <span className="test-account-badge"> · TEST ACCOUNT</span>}</p><h2>{profile.user.displayName}</h2><p>{profile.user.email}</p></div><span className="admin-status">{profile.user.status.toLowerCase()}</span></div>
              <p className="admin-bio">{profile.bio || "No bio provided."}</p>
              <div className="home-meta">{profile.budgetMin !== null && <span>From {rupees.format(profile.budgetMin)}</span>}{profile.budgetMax !== null && <span>Up to {rupees.format(profile.budgetMax)}</span>}<span>Joined {new Date(profile.user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span></div>
              {profile.user.isTestAccount && <button className="test-account-remove" disabled={removingId === profile.user.id} onClick={() => void removeTestAccount(profile)}>{removingId === profile.user.id ? "Removing…" : "Remove test account"}</button>}
            </article>
          ))}
        </div>}
      </section>
    </main>
  );
}
