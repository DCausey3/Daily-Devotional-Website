import type { Metadata } from "next";
import "../src/index.css";

export const metadata: Metadata = {
  title: "Pastor K | Daily Devotionals",
  description: "Daily encouragement to help you slow down, hear God clearly, and walk faithfully.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
