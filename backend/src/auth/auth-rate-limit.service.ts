import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { createHash } from "node:crypto";

type RateLimit = { attempts: number; resetAt: number };

@Injectable()
export class AuthRateLimitService {
  private readonly buckets = new Map<string, RateLimit>();
  private checks = 0;

  consume(input: {
    scope: string;
    ip: string;
    identifier?: string;
    ipLimit: number;
    accountLimit?: number;
    windowMs?: number;
  }) {
    const windowMs = input.windowMs ?? 15 * 60 * 1000;
    const keys = [`ip:${input.scope}:${this.hash(input.ip || "unknown")}`];
    const identifier = input.identifier?.trim().toLowerCase();
    if (identifier) keys.push(`account:${input.scope}:${this.hash(identifier)}`);

    const now = Date.now();
    this.checks += 1;
    if (this.checks % 128 === 0 || this.buckets.size > 10_000) this.removeExpired(now);

    const limits = [input.ipLimit, ...(identifier && input.accountLimit ? [input.accountLimit] : [])];
    const current = keys.map((key, index) => {
      const bucket = this.buckets.get(key);
      return bucket && bucket.resetAt > now
        ? { key, limit: limits[index], bucket }
        : { key, limit: limits[index], bucket: { attempts: 0, resetAt: now + windowMs } };
    });

    if (current.some(({ bucket, limit }) => bucket.attempts >= limit)) {
      throw new HttpException("Too many authentication attempts. Please wait before trying again.", HttpStatus.TOO_MANY_REQUESTS);
    }

    for (const { key, bucket } of current) {
      bucket.attempts += 1;
      this.buckets.set(key, bucket);
    }

    if (this.buckets.size > 50_000) {
      this.removeExpired(now);
      if (this.buckets.size > 50_000) {
        const excess = this.buckets.size - 45_000;
        let evicted = 0;
        for (const key of this.buckets.keys()) {
          this.buckets.delete(key);
          evicted += 1;
          if (evicted >= excess) break;
        }
      }
    }
  }

  private hash(value: string) {
    return createHash("sha256").update(value).digest("hex");
  }

  private removeExpired(now: number) {
    for (const [key, bucket] of this.buckets) {
      if (bucket.resetAt <= now) this.buckets.delete(key);
    }
  }
}
