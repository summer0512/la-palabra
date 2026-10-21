export const PRODUCTION_HOSTNAME = "lapalabra-deldia.com";

// Independent switches: disabling Adsterra does not disable Google scripts.
export const SITE_SCRIPTS = {
  googleAnalytics: true,
  googleAds: true,
  adsterraSocialBar: true,
  // AdSense prohibits Google ads on sites that contain or trigger pop-unders.
  adsterraPopunder: false,
  adsterraBanners: true,
};

// Leave room around the existing 1280px game container, with a 24px gap.
export const SIDE_AD_QUERY = "(min-width: 1728px) and (min-height: 760px) and (hover: hover) and (pointer: fine)";
export const SOCIALBAR_SCRIPT_SRC = "https://bicea.org/14/fe219a1085afcc9accb75cdcd6f41581";
export const POPUNDER_SCRIPT_SRC = "https://afders.org/1/c0e05061fccfa5f304e0861873bebc97";
export const BANNER_UNITS = {
  left: { key: "499e8e5c510261deb22ea55e102d423d", width: 160, height: 600 },
  right: { key: "9871ea78fb6c5efd6ab0117b47079ee7", width: 160, height: 300 },
} as const;

export function isProductionSite(environment: string | undefined, hostname: string) {
  return environment === "production" && hostname === PRODUCTION_HOSTNAME;
}
