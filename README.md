# Flatmate Platform — VS Code Starter

India-first Gen Z flatmate and property discovery platform scaffold.

## Included
- `apps/web`: Next.js + TypeScript responsive starter website
- `apps/mobile`: Expo + React Native + TypeScript starter
- `backend`: NestJS API starter and Prisma schema
- `packages/shared`: shared TypeScript types
- `docs`: overview, requirements, database, API, team roles and roadmap

## Windows 11 setup in VS Code
1. Install the current Node.js LTS release and VS Code.
2. Extract the ZIP. In VS Code, choose **File → Open Folder** and select the inner `flatmate-platform` folder that contains this README and the root `package.json`.
3. Open **Terminal → New Terminal** and run `npm install` once from this folder.
4. Start one part of the project with `npm run dev:web`, `npm run dev:mobile`, or `npm run dev:api`.
5. You can also press **Ctrl+Shift+P**, choose **Tasks: Run Task**, then choose **Start website**, **Start mobile app**, or **Start API**.

The website opens at http://localhost:3000. The API uses port 4000. The API accepts local web and Expo development origins by default; set `CORS_ORIGIN` to a comma-separated list when your development URLs differ.

## Mobile sign-in (iOS and Android)

The Expo app signs in through the same NestJS authentication service as the website. It stores the returned session token in the device Keychain (iOS) or Keystore (Android), and its **Sign out** button revokes that session when the API is reachable.

1. From the project root, install dependencies with `npm install` (the Expo-compatible `expo-secure-store` dependency is included in the mobile workspace).
2. Configure your own PostgreSQL database as described above, then run `npm run db:generate` and `npm run db:migrate`. The migration adds persistent passes without resetting existing data.
3. Run `npm run seed:test-accounts` if you need the existing local discovery profiles. Use the test account email and temporary password printed by that command in your own terminal; the seed command only permits the local `flatmate_platform` database.
4. In a terminal, start the API with `npm run dev:api` and leave it running. It listens on port `4000`.
5. In a second terminal, set the API URL for your own development device, then start Expo:

   **Physical iOS or Android phone:** connect the phone and computer to the same network. Find the computer's current private IPv4 address and substitute it below; do not use the example placeholder literally.

   ```powershell
   $env:EXPO_PUBLIC_API_URL = "http://YOUR_COMPUTER_LAN_IP:4000"
   npm run dev:mobile
   ```

   **Android emulator:** use `http://10.0.2.2:4000` as `EXPO_PUBLIC_API_URL`.

   **iOS simulator on macOS:** use `http://localhost:4000` as `EXPO_PUBLIC_API_URL`.

6. Open the app in Expo Go or a development build, then sign in with an account already registered in this project. Use **Pass** or swipe left to save a pass, or **Like** or swipe right to like a profile. Saved passes stay out of discovery after restarting the app. A mutual like displays a match notice. If a physical phone cannot connect, confirm both devices are on the same network and that the computer firewall allows inbound TCP traffic on port `4000`.

Set `EXPO_PUBLIC_API_URL` in the same terminal session each time you start Expo. It is a local development setting, not a committed project secret; each developer supplies their own reachable API address. Development uses plain HTTP on the local network. Use HTTPS for any deployed API.

## Step 3: account sign-in and protection

The existing password sign-in and registration are available on the website and in the Expo app. Google, Facebook, and Apple sign-in use authorization-code callbacks handled by the NestJS API; provider credentials stay on the API and are never put in web or mobile bundles. OAuth identities attach to a user only when that provider identity is already linked. The API does not silently link a new provider to an existing email/password account; use the existing sign-in method for that email.

### Local OAuth configuration

First create OAuth applications in the provider consoles for the website and mobile app, and register the exact API callback URLs below. Then configure these variables in the API's private local environment using values supplied by each provider. Do not commit the values or share them in source control.

| Variable name | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Optional website API origin when the API is not reachable at the website host on port `4000`. This is a public URL, not a secret. |
| `OAUTH_API_BASE_URL` | Publicly reachable API origin; callback paths are `/auth/oauth/google/callback`, `/auth/oauth/facebook/callback`, and `/auth/oauth/apple/callback`. Use HTTPS except localhost HTTP for local browser development. A physical phone's OAuth provider callback needs an HTTPS-reachable API URL; the app itself can still use its own `EXPO_PUBLIC_API_URL` for API requests. |
| `WEB_OAUTH_SUCCESS_URL` | Fixed website URL to receive a successful browser sign-in. |
| `WEB_OAUTH_FAILURE_URL` | Fixed website URL to show a generic sign-in failure. |
| `MOBILE_OAUTH_CALLBACK_URL` | Must be `flatmate://auth/callback` and match the Expo app scheme. |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google OAuth web client credentials. Add the Google API callback URL as an authorized redirect URI. |
| `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET` | Facebook app credentials. Add the Facebook API callback URL to the app's valid OAuth redirect URIs. |
| `APPLE_SERVICE_ID`, `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY` | Apple Services ID, team/key identifiers, and private key for server-side client-secret signing. Configure Sign in with Apple and the API callback URL in the Apple developer console. |

Google authorization uses PKCE S256 and server-side token verification. All providers use server-generated, one-time OAuth state and fixed configured callback URLs; Apple also uses a nonce. Facebook and Apple use their confidential server-side code exchange. Mobile sign-in returns a short-lived, one-time handoff bound to a verifier generated on the device; the session token is stored in Expo SecureStore. Never place client secrets, Apple private keys, or provider access tokens in `NEXT_PUBLIC_*`, Expo public variables, source code, or logs.

After setting the provider variables in your own private API environment:

1. Apply the additive OAuth migration to your own PostgreSQL database with `npm run db:migrate` from the project root. Generate the Prisma client with `npm run db:generate` if needed; stop the API first if it is running.
2. Set `EXPO_PUBLIC_API_URL` to the API URL reachable from your browser/device. For physical phones, use your computer's current LAN address; for Android emulator use `http://10.0.2.2:4000`; for iOS simulator use `http://localhost:4000`.
3. Start the API, website, and mobile app using the commands in the setup section. Mobile email/password sign-in works in Expo Go; provider sign-in uses the `flatmate://` callback and should be tested with an Expo development build that registers the scheme.

### Authentication limits and proxy configuration

The API returns HTTP 429 with a retry message when an authentication limit is exceeded. Current per-process fixed-window limits are 60 requests per IP and 12 per normalized account identifier for password sign-in (shared by web, mobile, and admin); 20 per IP and 6 per identifier per hour for registration; 24 OAuth starts per IP and 80 callbacks per IP per 15 minutes; 20 OAuth completions per account and 100 per IP per 15 minutes; and 120 logout requests per IP per 15 minutes. Limits use hashed IP/account keys, do not permanently lock accounts, and reset after their window. They reduce automated abuse but cannot stop every bot. They are process-local and are not a distributed limiter for multi-instance production deployments.

Forwarded IP headers are ignored by default. `TRUST_PROXY_HOPS` defaults to `0` and accepts only `0` through `5`; configure it only to the exact number of trusted reverse-proxy hops, and prevent clients from bypassing that proxy. Incorrect proxy trust can let clients spoof their IP and evade IP limits. No CAPTCHA or paid anti-abuse service is required; one may be evaluated later as an optional addition.

Password recovery and email verification are not configured in this project; no recovery endpoint is exposed until a delivery and verification flow is designed.

## Build the website
Run `npm run build:web` from the project root. This creates a production build locally; it does not deploy the app.

## Local PostgreSQL setup
Each developer needs PostgreSQL running locally. Create a private `.env` file in the project root (beside this README and the root `package.json`) and set `DATABASE_URL` to that developer's own local database, for example:

```env
DATABASE_URL="postgresql://flatmate_user:YOUR_LOCAL_PASSWORD@localhost:5432/flatmate_platform?schema=public"
```

Do not commit or share `.env`; each developer must use their own database credentials. From the project root, run `npm run db:generate` and `npm run db:migrate` before starting the API.

## Local swipe testing
After PostgreSQL is set up and migrations have run, execute `npm run seed:test-accounts` from the project root to create 12 fake, clearly marked local test profiles and a sample mutual match. The script only allows the local `flatmate_platform` database and prints a temporary shared password for these fake accounts. Sign in to `/admin/login`, open the saved member profiles page, and use **Remove test account** after testing. That action permanently deletes the selected test account and its related profile, likes, and matches.

This is an early-stage application, not a production service. Chat, verification, moderation, payments and deployment remain TODOs. `Avenli` is a temporary visual placeholder only; it is not trademark-cleared. No domain is purchased.
