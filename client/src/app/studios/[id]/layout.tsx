import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Studio Details — StudioSpace",
  description:
    "Explore studio photos, amenities, location, pricing, and host details before booking your next production.",
};

export default function StudioDetailsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col antialiased selection:bg-accent/30 selection:text-foreground">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
