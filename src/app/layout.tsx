import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SecurityMatch | Find Private Security Providers",
    template: "%s | SecurityMatch",
  },
  description: "Request private security by ZIP code, compare provider fits and quotes, and choose the security company that works for your assignment.",
  applicationName: "SecurityMatch",
  metadataBase: new URL("https://securitymatchnow.com"),
  keywords: [
    "private security",
    "security guards",
    "event security",
    "construction security",
    "mobile patrol",
    "armed security",
    "security marketplace",
  ],
  openGraph: {
    title: "SecurityMatch | Find Private Security Providers",
    description: "Tell us what security you need. SecurityMatch helps organize provider fits and quotes in one marketplace.",
    type: "website",
    siteName: "SecurityMatch",
  },
};

export const viewport: Viewport = {
  themeColor: "#080809",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
