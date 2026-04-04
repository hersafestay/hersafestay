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
  title: "HerSafeStay — Travel Safely, Travel Confidently",
  description:
    "A travel booking platform built for women. Every listing vetted for safety. Real reviews from women travelers.",
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
