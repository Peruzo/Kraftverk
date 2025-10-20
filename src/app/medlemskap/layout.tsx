import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Medlemskap — Kraftverk Studio",
  description: "Välj det medlemskap som passar dig bäst. Base, Flex eller Studio+ med recovery.",
};

export default function MedlemskapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
