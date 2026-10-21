"use client";

import Script from "next/script";
import { useProductionSite } from "@/hooks/use-site-runtime";
import { SITE_SCRIPTS } from "@/lib/site-scripts";
import AdsterraSocialBar from "./adsterra-socialbar";

export function ProductionScripts() {
  const production = useProductionSite();
  if (!production) return null;

  return <>
    {SITE_SCRIPTS.googleAds ? <Script
      id="google-adsense"
      strategy="afterInteractive"
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2623631636848395"
      crossOrigin="anonymous"
    /> : null}
    <AdsterraSocialBar />
    {SITE_SCRIPTS.googleAnalytics ? <>
      <Script strategy="lazyOnload" src="https://www.googletagmanager.com/gtag/js?id=G-LDJMHJJ77D" />
      <Script id="google-analytics" strategy="lazyOnload" dangerouslySetInnerHTML={{ __html: `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-LDJMHJJ77D');
      ` }} />
    </> : null}
  </>;
}
