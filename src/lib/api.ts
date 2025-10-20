// API helper functions

type FetchOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
  headers?: Record<string, string>;
};

async function fetchAPI(endpoint: string, options: FetchOptions = {}) {
  const { method = "GET", body, headers = {} } = options;

  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(endpoint, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "API request failed");
  }

  return data;
}

export const api = {
  // Bookings
  getBookings: (userId: string) => fetchAPI(`/api/bookings?userId=${userId}`),
  
  createBooking: (userId: string, classInstanceId: string) =>
    fetchAPI("/api/bookings", {
      method: "POST",
      body: { userId, classInstanceId },
    }),

  cancelBooking: (bookingId: string) =>
    fetchAPI(`/api/bookings/${bookingId}`, { method: "DELETE" }),

  // Memberships
  getMemberships: () => fetchAPI("/api/memberships"),

  // Checkout
  checkout: (membershipId: string, userId?: string) =>
    fetchAPI("/api/checkout", {
      method: "POST",
      body: { membershipId, userId },
    }),
};






