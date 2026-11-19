# API Outline

Implemented endpoints:

- `GET /` returns API status.
- `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` manage accounts and sessions.
- `GET /profiles/me`, `PATCH /profiles/me` read and update the signed-in user's profile.
- `GET /listings` lists active homes; optional query parameters: `city`, `minRent`, and `maxRent`.
- `POST /listings` creates a listing for the signed-in user. Public listing results include the host's display name and neighborhood, not an exact street address.

Planned: listing management, flatmate discovery, likes, matches, conversations/messages, reports and blocks. Define validation, authorization and rate limits before each feature is released.
