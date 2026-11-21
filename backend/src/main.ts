import { existsSync } from "node:fs";
import { resolve } from "node:path";
import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { loadEnvFile } from "node:process";
import { AppModule } from "./app.module";

const backendEnvFile = resolve(process.cwd(), ".env");
if (!process.env.DATABASE_URL && existsSync(backendEnvFile)) {
  loadEnvFile(backendEnvFile);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const allowedOrigins = (
    process.env.CORS_ORIGIN ??
    "http://localhost:3000,http://localhost:8081,http://localhost:19006"
  )
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  const isDevelopment = process.env.NODE_ENV !== "production";
  app.enableCors({
    origin: (origin, callback) => {
      const isLocalDevelopmentOrigin =
        isDevelopment &&
        /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\]|10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2})(:\d+)?$/.test(origin ?? "");
      if (!origin || allowedOrigins.includes(origin) || isLocalDevelopmentOrigin) {
        callback(null, true);
        return;
      }
      callback(new Error("Origin is not allowed by CORS"), false);
    },
    credentials: true,
  });
  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port);
  console.log(`API running at http://localhost:${port}`);
}

bootstrap();
