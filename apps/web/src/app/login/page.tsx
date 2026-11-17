const field = {
  display: "block",
  width: "100%",
  padding: 14,
  marginTop: 12,
  border: "1px solid #eceaf2",
  borderRadius: 12,
} as const;

export default function Login() {
  return (
    <main className="shell" style={{ paddingTop: 70, maxWidth: 560 }}>
      <a className="logo" href="/">
        avenli<span>.</span>
      </a>
      <h1 style={{ fontSize: 42 }}>Welcome back</h1>
      <p className="copy">
        Demo sign-in screen. Authentication is not connected yet.
      </p>
      <div className="card">
        <input placeholder="Email address" style={field} />
        <input placeholder="Password" type="password" style={field} />
        <button className="btn" style={{ marginTop: 18 }}>
          Continue (demo)
        </button>
      </div>
    </main>
  );
}
