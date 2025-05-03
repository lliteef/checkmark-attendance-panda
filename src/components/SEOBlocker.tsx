
import { useEffect } from "react";

const SEOBlocker = () => {
  useEffect(() => {
    // Double-check that the meta tag exists, add it if not
    if (!document.querySelector('meta[name="robots"]')) {
      const metaTag = document.createElement("meta");
      metaTag.name = "robots";
      metaTag.content = "noindex, nofollow";
      document.head.appendChild(metaTag);
    }
  }, []);

  return null; // This component doesn't render anything
};

export default SEOBlocker;
