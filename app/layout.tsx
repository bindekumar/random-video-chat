import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Random Video Chat – Meet & Talk to New People Online",
  description:
    "Join random video chat and meet new people online. Connect instantly with strangers through live video chat and discover interesting conversations from around the world.",
  keywords: [
    "random video chat",
    "random video call",
    "video chat with strangers",
    "talk to strangers",
    "meet new people online",
    "live video chat",
    "online video chat",
    "free random video chat",
    "stranger video chat",
    "random chat online",
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Random Video Chat – Meet New People Online",
    description:
      "Connect with new people through random video chat. Start a live video conversation and meet people from around the world.",
    type: "website",
    siteName: "Random Video Chat",
  },
  twitter: {
    card: "summary_large_image",
    title: "Random Video Chat – Meet New People Online",
    description:
      "Meet new people and start conversations instantly with random video chat.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

