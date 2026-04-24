import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/lib/providers";
import { validateEnv } from "@/lib/env";

export const metadata: Metadata = {
  title: "SHIELD — Verified Cybersecurity Marketplace",
  description: "Anonymous marketplace connecting organizations with verified cybersecurity professionals. OSCP, CISSP, CEH certified. Zero identity exposure.",
  keywords: ["cybersecurity", "marketplace", "anonymous", "OSCP", "CISSP", "penetration testing", "security services"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  validateEnv();

  return (
    <html lang="en" className="scroll-smooth">
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
