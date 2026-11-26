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
2. Configure PostgreSQL as described above, then run `npm run db:generate` and `npm run db:migrate`.
3. In a terminal, start the API with `npm run dev:api` and leave it running. It listens on port `4000`.
4. In a second terminal, set the API URL for your own development device, then start Expo:

   **Physical iOS or Android phone:** connect the phone and computer to the same network. Find the computer's current private IPv4 address and substitute it below; do not use the example placeholder literally.

   ```powershell
   $env:EXPO_PUBLIC_API_URL = "http://YOUR_COMPUTER_LAN_IP:4000"
   npm run dev:mobile
   ```

   **Android emulator:** use `http://10.0.2.2:4000` as `EXPO_PUBLIC_API_URL`.

   **iOS simulator on macOS:** use `http://localhost:4000` as `EXPO_PUBLIC_API_URL`.

5. Open the app in Expo Go or a development build, then sign in with an account already registered in this project. If a physical phone cannot connect, confirm both devices are on the same network and that the computer firewall allows inbound TCP traffic on port `4000`.

Set `EXPO_PUBLIC_API_URL` in the same terminal session each time you start Expo. It is a local development setting, not a committed project secret; each developer supplies their own reachable API address. Development uses plain HTTP on the local network. Use HTTPS for any deployed API.

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

This is an early-stage application, not a production service. Mobile discovery, chat, verification, moderation, payments and deployment remain TODOs. `Avenli` is a temporary visual placeholder only; it is not trademark-cleared. No domain is purchased.
