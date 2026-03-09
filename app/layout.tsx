import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yiddish or Bullshit",
  description: "Real Yiddish words. Fake Yiddish words. You decide.",
  metadataBase: new URL("https://yiddishorbullshit.com"),
  openGraph: {
    title: "Yiddish or Bullshit",
    description:
      "Can you tell real Yiddish from made-up words? A daily game of language, bluffing, and chutzpah.",
    url: "https://yiddishorbullshit.com",
    siteName: "Yiddish or Bullshit",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Yiddish or Bullshit — a daily word game",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Yiddish or Bullshit",
    description: "Can you tell real Yiddish from made-up words?",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg-primary font-sans text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
