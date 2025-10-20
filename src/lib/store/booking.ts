"use client";

import { create } from "zustand";
import type { Booking, ClassInstance } from "@/types";

type BookingState = {
  userBookings: Booking[];
  isLoading: boolean;
  error: string | null;
  
  fetchBookings: (userId: string) => Promise<void>;
  bookClass: (userId: string, classInstanceId: string) => Promise<{ success: boolean; booking?: Booking; error?: string }>;
  cancelBooking: (bookingId: string) => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
};

export const useBookingStore = create<BookingState>()((set, get) => ({
  userBookings: [],
  isLoading: false,
  error: null,

  fetchBookings: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/bookings?userId=${userId}`);
      if (!response.ok) throw new Error("Kunde inte hämta bokningar");
      
      const bookings = await response.json();
      set({ userBookings: bookings, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : "Ett fel uppstod", 
        isLoading: false 
      });
    }
  },

  bookClass: async (userId: string, classInstanceId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, classInstanceId }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        set({ error: data.error, isLoading: false });
        return { success: false, error: data.error };
      }

      // Uppdatera lokala bokningar
      set((state) => ({
        userBookings: [...state.userBookings, data.booking],
        isLoading: false,
      }));

      return { success: true, booking: data.booking };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Ett fel uppstod";
      set({ error: errorMsg, isLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  cancelBooking: async (bookingId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
      });

      const data = await response.json();
      
      if (!response.ok) {
        set({ error: data.error, isLoading: false });
        return { success: false, error: data.error };
      }

      // Ta bort från lokala bokningar
      set((state) => ({
        userBookings: state.userBookings.filter((b) => b.id !== bookingId),
        isLoading: false,
      }));

      return { success: true };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Ett fel uppstod";
      set({ error: errorMsg, isLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  clearError: () => set({ error: null }),
}));






