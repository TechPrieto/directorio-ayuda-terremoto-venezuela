import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Directorio de Páginas de Ayuda en Relación al Terremoto en Venezuela",
    short_name: "Directorio Ayuda",
    description:
      "Directorio comunitario instalable para acceder rápido a páginas de ayuda relacionadas al terremoto en Venezuela.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#f7f4ee",
    theme_color: "#0c6b58",
    lang: "es",
    categories: ["medical", "utilities", "news"],
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/maskable.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
