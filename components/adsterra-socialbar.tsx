'use client';

import { usePathname } from "next/navigation";
import Script from "next/script";

import { useMediaQuery, useProductionSite } from "@/hooks/use-site-runtime";
import { SITE_SCRIPTS, SOCIALBAR_SCRIPT_SRC } from "@/lib/site-scripts";
const MOBILE_MEDIA_QUERY = "(max-width: 768px)";

const normalizePathname = (pathname: string): string => {
  if (!pathname) {
    return "/";
  }

  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }

  return pathname;
};

const stripLocalePrefix = (pathname: string): string => {
  const match = pathname.match(/^\/([a-z]{2})(\/.*)?$/i);
  if (!match) {
    return pathname;
  }
  return match[2] ?? "/";
};

const isGameOrFinderPath = (pathname: string): boolean => {
  const normalized = normalizePathname(pathname);
  const route = stripLocalePrefix(normalized);

  if (route === "/") {
    return true;
  }

  if (/^\/palabra-\d+-letras(?:-con-acentos)?$/i.test(route)) {
    return true;
  }

  if (route === "/buscador-palabras") {
    return true;
  }

  if (/^\/buscador-palabra-\d+-letras$/i.test(route)) {
    return true;
  }

  return false;
};

export default function AdsterraSocialBar() {
  const pathname = usePathname();
  const production = useProductionSite();
  const mobile = useMediaQuery(MOBILE_MEDIA_QUERY);

  // Keep the existing mobile exclusion on game and finder pages.
  if (!production || !SITE_SCRIPTS.adsterraSocialBar || (mobile && isGameOrFinderPath(pathname ?? "/"))) {
    return null;
  }

  return <Script id="adsterra-socialbar" data-cfasync="false" strategy="afterInteractive" src={SOCIALBAR_SCRIPT_SRC} />;
}
