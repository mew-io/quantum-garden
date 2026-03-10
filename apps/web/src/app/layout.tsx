import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import { TRPCProvider } from "@/lib/trpc/provider";
import "./globals.css";

const bodyFont = Nunito({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Quantum Garden",
  description:
    "A slow-evolving generative environment where plants exist in quantum superposition until observed.",
  metadataBase: new URL("https://quantum-garden.com"),
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Quantum Garden",
    description:
      "A slow-evolving generative environment where plants exist in quantum superposition until observed.",
    type: "website",
    siteName: "Quantum Garden",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Quantum Garden — watercolor plants on a paper-textured canvas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Quantum Garden",
    description:
      "A slow-evolving generative environment where plants exist in quantum superposition until observed.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={bodyFont.variable}>
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
