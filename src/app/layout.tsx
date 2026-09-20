import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SecurityMatch | Find Security Now",
  description: "Match with qualified private security providers serving your area.",
  metadataBase: new URL("https://securitymatchnow.com"),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
