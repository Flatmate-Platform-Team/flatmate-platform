import Link from "next/link";

const links = [
  ["Discover", "/dashboard"],
  ["Explore", "/discover"],
  ["Messages", "/messages"],
  ["Household", "/household"],
  ["Profile", "/profile"],
];

export function ProductNav({ active = "Discover", name = "" }: { active?: string; name?: string }) {
  return (
    <header className="product-nav">
      <Link className="product-logo" href="/dashboard" aria-label="Avenli dashboard">avenli<span>.</span></Link>
      <nav className="product-links" aria-label="Product navigation">
        {links.map(([label, href]) => <Link key={href} href={href} aria-current={active === label ? "page" : undefined} className={active === label ? "is-active" : undefined}>{label}</Link>)}
      </nav>
      <Link className="product-avatar" href="/profile" aria-label="Open profile">{name.trim().charAt(0).toUpperCase() || "◯"}</Link>
    </header>
  );
}
