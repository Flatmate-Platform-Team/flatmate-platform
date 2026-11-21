# API Outline

Implemented endpoints:

- `GET /` returns API status.
- `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` manage accounts and sessions.
- `GET /profiles/me`, `PATCH /profiles/me` read and update the signed-in user's profile.
- `GET /listings` lists active homes; optional query parameters: `city`, `minRent`, and `maxRent`.
- `POST /listings` creates a listing for the signed-in user. Public listing results include the host's display name and neighborhood, not an exact street address.
- `GET /flatmates` returns public profile details for discovery; optional query parameter: `city`.
- `POST /flatmates/:targetUserId/like` records a like and reports when it creates a mutual match.
- `GET /matches` returns the signed-in user's mutual matches.
- `GET /admin/profiles` returns saved member profiles to users with the `ADMIN` role.

Planned: listing management, conversations/messages, reports and blocks. Define validation, authorization and rate limits before each feature is released.

To grant an administrator after applying the role migration, run this SQL as a database administrator and replace the email with the intended account:

```sql
UPDATE "User" SET "role" = 'ADMIN' WHERE "email" = 'admin@example.com';
```
