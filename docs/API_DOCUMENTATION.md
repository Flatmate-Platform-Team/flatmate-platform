# API Outline

Implemented endpoints:

- `GET /` returns API status.
- `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` manage accounts and sessions.
- `POST /auth/mobile/register`, `POST /auth/mobile/login`, `POST /auth/mobile/logout`, `GET /auth/mobile/me` provide the same password/session behavior for Expo clients; mobile session tokens are sent as Bearer credentials.
- `POST /auth/admin/login` only creates a session for an account with the `ADMIN` role.
- `GET /auth/oauth/:provider/start?platform=web|mobile` begins Google, Facebook, or Apple sign-in. Provider callbacks are `GET /auth/oauth/:provider/callback`; mobile clients exchange the one-time callback handoff using `POST /auth/oauth/mobile/complete`.
- `GET /profiles/me`, `PATCH /profiles/me` read and update the signed-in user's profile.
- `GET /listings` lists active homes; optional query parameters: `city`, `minRent`, and `maxRent`.
- `POST /listings` creates a listing for the signed-in user. Public listing results include the host's display name and neighborhood, not an exact street address.
- `GET /flatmates` returns public profile details for discovery; optional query parameter: `city`.
- `POST /flatmates/:targetUserId/like` records a like and reports when it creates a mutual match.
- `GET /matches` returns the signed-in user's mutual matches.
- `GET /admin/profiles` returns saved member profiles to users with the `ADMIN` role.

Auth registration returns the same generic `202 Accepted` message for new and existing email addresses. Invalid credentials use a generic response. Authentication endpoints are rate limited by IP and, where available, normalized account identifier; exceeded limits return HTTP `429 Too Many Requests`. Limits are process-local. See the README's Step 3 section for provider configuration, callback requirements, limits, and trusted proxy setup.

Planned: listing management, conversations/messages, reports and blocks. Define validation, authorization and rate limits before each feature is released.

To grant an administrator after applying the role migration, run this SQL as a database administrator and replace the email with the intended account:

```sql
UPDATE "User" SET "role" = 'ADMIN' WHERE "email" = 'admin@example.com';
```
