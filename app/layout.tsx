import type { Metadata } from "next";
import Script from "next/script";
import { Atma, Mina, Pangolin } from "next/font/google";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_NAME_BN,
  SITE_URL,
  SITE_TAGLINE_BN,
} from "@/lib/constants";
import "./globals.css";

const atma = Atma({
  subsets: ["latin", "bengali"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-atma",
  display: "swap",
});

const mina = Mina({
  subsets: ["latin", "bengali"],
  weight: ["400", "700"],
  variable: "--font-mina",
  display: "swap",
});

const pangolin = Pangolin({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pangolin",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME_BN} · ${SITE_NAME}`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "Sunday Suspense",
    "সানডে সাসপেন্স",
    "সানডে সাসপেন্স আড্ডা",
    "Bengali horror stories",
    "Bengali audio stories",
    "Mirchi Bangla",
    "বাংলা ভূতের গল্প",
    "বাংলা রহস্য গল্প",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "bn_IN",
    alternateLocale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME_BN} · ${SITE_NAME}`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 669,
        alt: `${SITE_NAME_BN} — ${SITE_TAGLINE_BN}`,
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME_BN} · ${SITE_NAME}`,
    description: SITE_DESCRIPTION,
    images: [{ url: "/og-image.jpg", alt: `${SITE_NAME_BN} — ${SITE_TAGLINE_BN}` }],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "entertainment",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="bn"
      className={`${atma.variable} ${mina.variable} ${pangolin.variable}`}
      suppressHydrationWarning
    >
      <body>
        <Script id="theme-init" strategy="beforeInteractive">
          {`try{if(localStorage.getItem("theme")==="light")document.documentElement.classList.add("light")}catch(e){}`}
        </Script>
        {children}
      </body>
    </html>
  );
}
