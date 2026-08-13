"use client";

import { SITE_NAME, SITE_NAME_BN, SITE_TAGLINE_BN } from "@/lib/constants";

export function Header() {
  return (
    <header className="px-5 pt-6 text-center sm:px-8 sm:pt-8">
      <p className="font-display text-[12px] tracking-[0.28em] text-gold uppercase">
        {SITE_NAME}
      </p>
      <h1 className="mt-1 font-title font-semibold text-paper">
        {SITE_NAME_BN}
      </h1>
      <p className="mt-1 font-bengali text-paper/55">{SITE_TAGLINE_BN}</p>
    </header>
  );
}
