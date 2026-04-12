import { Crimson_Pro } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const crimsonPro = Crimson_Pro({
  variable: "--font-crimson-pro",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata = {
  title: "HerSafeStay — Safe Accommodations for Women Travelers",
  description:
    "Discover verified safe hotels, hostels, and apartments for women travelers. Real-time safety maps, women's reviews, and neighborhood safety scores for Barcelona, Paris, Bangkok, London & NYC.",
  keywords:
    "women travel safety, safe accommodations, female solo travelers, hotel safety, women travel app, safety map",
  openGraph: {
    title: "HerSafeStay — Travel Safely, Stay Confidently",
    description:
      "Interactive safety maps + verified accommodations for women travelers. Color-coded neighborhood safety zones, women's ratings, and solo travel tips.",
    type: "website",
    locale: "en_US",
    siteName: "HerSafeStay",
  },
  twitter: {
    card: "summary_large_image",
    title: "HerSafeStay — Safe Accommodations for Women Travelers",
    description:
      "Safety maps + verified stays for women travelers. Know before you go.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-7EH09YFVSE"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-7EH09YFVSE');
          `}
        </Script>
      </head>
      <body
        className={crimsonPro.variable}
        style={{ fontFamily: "var(--font-crimson-pro), Georgia, serif" }}
      >
        {children}
      </body>
    </html>
  );
}
