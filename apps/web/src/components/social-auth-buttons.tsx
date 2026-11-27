"use client";

type Provider = { id: string; label: string; symbol: string };

const providers: Provider[] = [
  { id: "google", label: "Continue with Google", symbol: "G" },
  { id: "facebook", label: "Continue with Facebook", symbol: "f" },
  { id: "apple", label: "Continue with Apple", symbol: "●" },
];

function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? `${window.location.protocol}//${window.location.hostname}:4000`;
}

export default function SocialAuthButtons() {
  return (
    <div className="social-auth" aria-label="Continue with a social account">
      {providers.map((provider) => (
        <button
          className="social-auth-button"
          key={provider.id}
          onClick={() => window.location.assign(`${getApiUrl()}/auth/oauth/${provider.id}/start?platform=web`)}
          type="button"
        >
          <span aria-hidden="true" className={`social-auth-symbol social-auth-${provider.id}`}>{provider.symbol}</span>
          {provider.label}
        </button>
      ))}
    </div>
  );
}
