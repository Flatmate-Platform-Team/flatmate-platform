import * as SecureStore from "expo-secure-store";

const SESSION_KEY = "flatmate-platform.mobile-session";

export type MobileUser = {
  id: string;
  email: string;
  displayName: string;
};

type AuthResponse = {
  user: MobileUser;
  token: string;
};

type RegisterResponse = { message: string };

type UserResponse = {
  user: MobileUser;
};

type ErrorResponse = {
  message?: unknown;
};

export class MobileApiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = "MobileApiError";
  }
}

function apiBaseUrl() {
  const configured = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (!configured) {
    throw new MobileApiError("Set EXPO_PUBLIC_API_URL before starting Expo. See the mobile sign-in section in README.md.");
  }
  const url = configured.replace(/\/+$/, "");
  if (!/^https?:\/\//i.test(url)) {
    throw new MobileApiError("EXPO_PUBLIC_API_URL must start with http:// or https://.");
  }
  return url;
}

function responseMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback;
  const message = (payload as ErrorResponse).message;
  if (typeof message === "string") return message;
  if (Array.isArray(message)) return message.filter((part) => typeof part === "string").join(" ");
  return fallback;
}

async function request<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  const baseUrl = apiBaseUrl();
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(init.headers as Record<string, string> | undefined),
  };
  if (init.body) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = "Bearer " + token;

  let response: Response;
  try {
    response = await fetch(baseUrl + path, { ...init, headers });
  } catch {
    throw new MobileApiError(
      "Cannot reach the Flatmate API at " + baseUrl + ". Confirm the API is running and that your phone and computer can reach this address.",
    );
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = responseMessage(
      payload,
      `The Flatmate API returned HTTP ${response.status} for ${path}. Check the API terminal for the matching error.`,
    );
    throw new MobileApiError(message, response.status);
  }
  return payload as T;
}

export async function mobileApiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  let token: string | null;
  try {
    token = await SecureStore.getItemAsync(SESSION_KEY);
  } catch {
    throw new MobileApiError("Could not read the secure sign-in on this device. Please sign in again.");
  }
  if (!token) throw new MobileApiError("Please sign in to continue.", 401);

  try {
    return await request<T>(path, init, token);
  } catch (error) {
    if (error instanceof MobileApiError && error.status === 401) {
      await SecureStore.deleteItemAsync(SESSION_KEY);
    }
    throw error;
  }
}

export async function signIn(email: string, password: string) {
  const result = await request<AuthResponse>("/auth/mobile/login", {
    method: "POST",
    body: JSON.stringify({ email: email.trim(), password }),
  });

  try {
    await SecureStore.setItemAsync(SESSION_KEY, result.token);
  } catch {
    await request("/auth/mobile/logout", { method: "POST" }, result.token).catch(() => undefined);
    throw new MobileApiError("Sign-in succeeded, but the device could not save the session securely. Please try again.");
  }

  return result.user;
}

export async function registerMobile(displayName: string, email: string, password: string) {
  return request<RegisterResponse>("/auth/mobile/register", {
    method: "POST",
    body: JSON.stringify({ displayName: displayName.trim(), email: email.trim(), password }),
  });
}

export function mobileOAuthStartUrl(provider: "google" | "facebook" | "apple", handoffChallenge: string) {
  const query = new URLSearchParams({ platform: "mobile", handoff_challenge: handoffChallenge });
  return `${apiBaseUrl()}/auth/oauth/${provider}/start?${query.toString()}`;
}

export const mobileOAuthRedirectUrl = "flatmate://auth/callback";

export async function completeMobileOAuth(handoff: string, verifier: string) {
  const result = await request<AuthResponse>("/auth/oauth/mobile/complete", {
    method: "POST",
    body: JSON.stringify({ handoff, verifier }),
  });

  try {
    await SecureStore.setItemAsync(SESSION_KEY, result.token);
  } catch {
    await request("/auth/mobile/logout", { method: "POST" }, result.token).catch(() => undefined);
    throw new MobileApiError("Sign-in succeeded, but the device could not save the session securely. Please try again.");
  }

  return result.user;
}

export async function getSignedInUser() {
  const token = await SecureStore.getItemAsync(SESSION_KEY);
  if (!token) return null;

  try {
    const result = await mobileApiRequest<UserResponse>("/auth/mobile/me", { method: "GET" });
    return result.user;
  } catch (error) {
    if (error instanceof MobileApiError && error.status === 401) {
      await SecureStore.deleteItemAsync(SESSION_KEY);
      return null;
    }
    throw error;
  }
}

export async function signOut() {
  let token: string | null = null;
  try {
    token = await SecureStore.getItemAsync(SESSION_KEY);
  } catch {
    // Clear the local item below even if the secure store cannot be read.
  }

  try {
    if (token) await request("/auth/mobile/logout", { method: "POST" }, token);
  } catch {
    // Local sign-out still completes if the API is offline.
  } finally {
    await SecureStore.deleteItemAsync(SESSION_KEY);
  }
}
