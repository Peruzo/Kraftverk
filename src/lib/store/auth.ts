"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User, Membership } from "@/types";

type AuthState = {
  user: User | null;
  membership: Membership | null;
  isAuthenticated: boolean;
  login: (email: string, membershipId?: string) => Promise<void>;
  logout: () => void;
  updateMembership: (membership: Membership) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      membership: null,
      isAuthenticated: false,

      login: async (email: string, membershipId = "flex") => {
        // Mock login - i produktion skulle detta vara en API-call
        const mockUser: User = {
          id: "user-" + Math.random().toString(36).substr(2, 9),
          email,
          membershipId,
          name: email.split("@")[0],
        };

        // Hämta membership data
        const membershipsResponse = await fetch("/api/memberships");
        const memberships = await membershipsResponse.json();
        const userMembership = memberships.find((m: Membership) => m.id === membershipId);

        set({
          user: { ...mockUser, membership: userMembership },
          membership: userMembership,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          user: null,
          membership: null,
          isAuthenticated: false,
        });
      },

      updateMembership: (membership: Membership) => {
        set((state) => ({
          membership,
          user: state.user ? { ...state.user, membershipId: membership.id, membership } : null,
        }));
      },
    }),
    {
      name: "kraftverk-auth-v1",
      storage: createJSONStorage(() => localStorage),
    }
  )
);






