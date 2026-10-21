"use client";

import { useMediaQuery, useProductionSite } from "@/hooks/use-site-runtime";
import { BANNER_UNITS, SIDE_AD_QUERY, SITE_SCRIPTS } from "@/lib/site-scripts";

function Banner({ placement, production }: { placement: keyof typeof BANNER_UNITS; production: boolean }) {
  const unit = BANNER_UNITS[placement];
  // Each parser-inserted embed gets its own document so atOptions globals and
  // document.write calls cannot overwrite another banner or the game page.
  const srcDoc = `<!doctype html><html><head><style>html,body{margin:0;padding:0;overflow:hidden}</style></head><body><script>atOptions=${JSON.stringify({ ...unit, format: "iframe", params: {} })};</script><script src="https://bicea.org/22/${unit.key}"></script></body></html>`;
  return <div data-ad-placement={placement} style={{ width: unit.width }} className="space-y-1.5">
    <p className="text-center text-[10px] uppercase tracking-wider text-muted-foreground">Publicidad</p>
    {production ? <iframe
      title={`Publicidad ${unit.width}×${unit.height}`}
      width={unit.width}
      height={unit.height}
      srcDoc={srcDoc}
      sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-forms"
      referrerPolicy="strict-origin-when-cross-origin"
      className="block border-0"
    /> : <div data-ad-placeholder style={{ width: unit.width, height: unit.height }} className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted text-muted-foreground">
      <span className="text-xs">Publicidad</span><span className="font-mono text-xs">{unit.width} × {unit.height}</span>
    </div>}
  </div>;
}

export function AdsterraBanners() {
  const production = useProductionSite();
  const wideDesktop = useMediaQuery(SIDE_AD_QUERY);
  if (!SITE_SCRIPTS.adsterraBanners || !wideDesktop) return null;

  return <>
    <aside aria-label="Publicidad" className="fixed left-[calc(50%-824px)] top-16 z-20 print:hidden"><Banner placement="left" production={production} /></aside>
    <aside aria-label="Publicidad" className="fixed right-[calc(50%-824px)] top-16 z-20 print:hidden"><Banner placement="right" production={production} /></aside>
  </>;
}
