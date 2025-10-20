// Kraftverk Studio - Type Definitions

export type MembershipTier = "base" | "flex" | "studio-plus" | "dagpass";

export interface Membership {
  id: string;
  name: string;
  price: number;
  bookingWindowDays: number;
  guestAllowance: number;
  description: string;
  features: string[];
  popular?: boolean;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  membershipId: string;
  membership?: Membership;
}

export interface ClassTemplate {
  id: string;
  title: string;
  category: string;
  duration: number;
  intensity: string;
  description: string;
  image?: string;
  zoneProfile?: {
    grey: number;
    blue: number;
    green: number;
    orange: number;
    red: number;
  };
}

export interface ClassInstance {
  id: string;
  templateId: string;
  template?: ClassTemplate;
  studioId: string;
  trainerId: string;
  trainer?: Trainer;
  startTime: string;
  spots: number;
  bookedSpots?: number;
  waitlist?: { userId: string; position: number }[];
}

export interface Booking {
  id: string;
  userId: string;
  classInstanceId: string;
  classInstance?: ClassInstance;
  status: "confirmed" | "waitlist" | "cancelled";
  bookedAt: string;
}

export interface Trainer {
  id: string;
  name: string;
  bio: string;
  specialties: string[];
  certifications?: string[];
  image?: string | null;
}

export interface Studio {
  id: string;
  name: string;
  address: string;
  city: string;
}

export type IntensityLevel = "Låg" | "Medel" | "Hög";
export type ClassCategory = "Styrka" | "Conditioning" | "Mobilitet";

