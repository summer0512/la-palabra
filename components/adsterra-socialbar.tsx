'use client';

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";

const SOCIALBAR_SCRIPT_SRC =
  "https://pl29091408.profitablecpmratenetwork.com/fe/21/9a/fe219a1085afcc9accb75cdcd6f41581.js";
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
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);

    const updateVisibility = () => {
      const currentPath = pathname ?? "/";
      const hideOnMobile = mediaQuery.matches && isGameOrFinderPath(currentPath);
      setShouldLoad(!hideOnMobile);
    };

    updateVisibility();
    mediaQuery.addEventListener("change", updateVisibility);

    return () => {
      mediaQuery.removeEventListener("change", updateVisibility);
    };
  }, [pathname]);

  if (!shouldLoad) {
    return null;
  }

  return <Script strategy="afterInteractive" src={SOCIALBAR_SCRIPT_SRC} />;
}
