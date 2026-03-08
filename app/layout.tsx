import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yiddish or Bullshit",
  description:
    "A daily Yiddish vocabulary game. 5 words. Which ones are real?",
  metadataBase: new URL("https://yiddishorbullshit.com"),
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Yiddish or Bullshit",
    description:
      "A daily Yiddish vocabulary game. 5 words. Which ones are real?",
    url: "https://yiddishorbullshit.com",
    siteName: "Yiddish or Bullshit",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Yiddish or Bullshit — A daily Yiddish vocabulary game",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Yiddish or Bullshit",
    description:
      "A daily Yiddish vocabulary game. 5 words. Which ones are real?",
    images: ["/og-image.png"],
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
