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

## Build the website
Run `npm run build:web` from the project root. This creates a production build locally; it does not deploy the app.

## PostgreSQL (later)
Copy `.env.example` to `backend/.env`, set `DATABASE_URL`, then run `npm run db:generate` and `npm run db:migrate`.

This is a starter scaffold, not a production application. Authentication, real matching, chat, verification, moderation, payments and deployment remain TODOs. `Avenli` is a temporary visual placeholder only; it is not trademark-cleared. No domain is purchased.
