import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bullshit — Can You Spot It?",
  description:
    "A daily media literacy game. 5 headlines. 3 minutes. How confident are you?",
  metadataBase: new URL("https://playbullshit.com"),
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Bullshit — Can You Spot It?",
    description:
      "A daily media literacy game. 5 headlines. 3 minutes. How confident are you?",
    url: "https://playbullshit.com",
    siteName: "Bullshit",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Bullshit — A daily media literacy game",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bullshit — Can You Spot It?",
    description:
      "A daily media literacy game. 5 headlines. 3 minutes. How confident are you?",
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
