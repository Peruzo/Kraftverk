// Utility functions för Kraftverk Studio

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(date: Date | string, locale = "sv-SE"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function formatTime(date: Date | string, locale = "sv-SE"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTime(date: Date | string, locale = "sv-SE"): string {
  return `${formatDate(date, locale)} ${formatTime(date, locale)}`;
}

export function hoursUntil(date: Date | string): number {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  return (d.getTime() - now.getTime()) / (1000 * 60 * 60);
}

export function canCancelBooking(classStartTime: Date | string): boolean {
  return hoursUntil(classStartTime) >= 2;
}

export function getIntensityColor(intensity: string): string {
  switch (intensity.toLowerCase()) {
    case "låg":
      return "grey";
    case "medel":
      return "green";
    case "hög":
      return "red";
    default:
      return "blue";
  }
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}





