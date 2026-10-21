import { isProductionSite, POPUNDER_SCRIPT_SRC, SITE_SCRIPTS } from "./site-scripts";

// The game calls this only from the existing new-game action after its round
// count/session/cooldown checks. Do not consume that cap in development.
export function loadAdsterraPopunder(): boolean {
  if (typeof window === "undefined" || !SITE_SCRIPTS.adsterraPopunder ||
      !isProductionSite(process.env.NODE_ENV, window.location.hostname)) return false;

  document.querySelector('script[data-adsterra-popunder="true"]')?.remove();
  const script = document.createElement("script");
  script.src = POPUNDER_SCRIPT_SRC;
  script.async = true;
  script.setAttribute("data-cfasync", "false");
  script.setAttribute("data-adsterra-popunder", "true");
  document.body.appendChild(script);
  return true;
}
