import { useEffect } from "react";
import favicon from "@/assets/logos/new_trunk_favicon.ico";
import faviconPng from "@/assets/logos/new_trunk_favicon-32.png";

export function Favicon() {
  useEffect(() => {
    // Update favicon links
    const links = document.querySelectorAll("link[rel*='icon']");

    for (const link of links) {
      const rel = link.getAttribute("rel");
      if (rel?.includes("png") || link.getAttribute("type")?.includes("png")) {
        link.setAttribute("href", faviconPng);
      } else {
        link.setAttribute("href", favicon);
      }
    }

    // If no favicon links exist, create them
    if (links.length === 0) {
      const iconLink = document.createElement("link");
      iconLink.rel = "icon";
      iconLink.href = favicon;
      document.head.appendChild(iconLink);

      const pngLink = document.createElement("link");
      pngLink.rel = "icon";
      pngLink.type = "image/png";
      pngLink.href = faviconPng;
      document.head.appendChild(pngLink);
    }
  }, []);

  return null;
}
