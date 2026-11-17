export type UserStatus = "PENDING" | "ACTIVE" | "SUSPENDED";

export interface BasicProfile {
  id: string;
  displayName: string;
  city?: string;
  bio?: string;
}

export interface PropertySummary {
  id: string;
  title: string;
  city: string;
  monthlyRent: number;
}
