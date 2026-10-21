import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "La Palabra del Día",
    short_name: "La Palabra",
    description: "Juega La Palabra del Día, desafíos personalizados y otros juegos de palabras en español.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f7eb",
    theme_color: "#3c9f45",
    lang: "es-ES",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/logo.png",
        sizes: "192x192",
        type: "image/png"
      }
    ]
  };
}

