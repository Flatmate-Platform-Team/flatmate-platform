const field = {
  display: "block",
  width: "100%",
  padding: 14,
  marginTop: 12,
  border: "1px solid #eceaf2",
  borderRadius: 12,
} as const;

export default function Signup() {
  return (
    <main className="shell" style={{ paddingTop: 70, maxWidth: 560 }}>
      <a className="logo" href="/">
        avenli<span>.</span>
      </a>
      <h1 style={{ fontSize: 42 }}>Your next chapter starts here.</h1>
      <p className="copy">
        Demo waitlist screen. Form data is not submitted or stored.
      </p>
      <div className="card">
        <input placeholder="Your name" style={field} />
        <input placeholder="Email address" style={field} />
        <button className="btn" style={{ marginTop: 18 }}>
          Join waitlist (demo)
        </button>
      </div>
    </main>
  );
}
