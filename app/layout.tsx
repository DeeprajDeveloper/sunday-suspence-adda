import type { Metadata } from "next";
import Script from "next/script";
import { Atma, Mina, Pangolin } from "next/font/google";
import { SITE_NAME, SITE_NAME_BN, SITE_TAGLINE_BN } from "@/lib/constants";
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
  title: `${SITE_NAME_BN} · ${SITE_NAME}`,
  description: `${SITE_TAGLINE_BN} — a music-player for the Sunday Suspense Collection.`,
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="bn"
      className={`${atma.variable} ${mina.variable} ${pangolin.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-ink font-bengali text-paper">
        <Script id="theme-init" strategy="beforeInteractive">
          {`try{if(localStorage.getItem("theme")==="light")document.documentElement.classList.add("light")}catch(e){}`}
        </Script>
        {children}
      </body>
    </html>
  );
}
