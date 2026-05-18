/**
 * usePageMeta — Dynamic page metadata hook
 * Sets document title and meta tags for SEO, Open Graph, and Twitter cards.
 * No external dependencies required.
 *
 * Usage:
 *   usePageMeta({ title: "Dashboard", description: "..." });
 *   usePageMeta({ title: "Stations", path: "/stations" });
 */

import { useEffect } from "react";

const SITE_NAME = "MRT Jakarta Dashboard";
const BASE_URL = "https://mrt-station-dashboard.vercel.app";
const DEFAULT_DESCRIPTION =
  "Operations dashboard for managing MRT Jakarta stations, train schedules, and real-time monitoring.";
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`;

interface PageMetaOptions {
  /** Page title — will be formatted as "[title] · MRT Jakarta" */
  title: string;
  /** Meta description. Defaults to site description. */
  description?: string;
  /** Canonical path e.g. "/dashboard". Omit for no canonical tag. */
  path?: string;
  /** OG image URL. Defaults to /og-image.png. */
  image?: string;
  /** Set to true for pages that should not be indexed (e.g. /access) */
  noIndex?: boolean;
}

function setMeta(name: string, content: string, attr: "name" | "property" = "name") {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.content = content;
}

function removeCanonical() {
  document.querySelector('link[rel="canonical"]')?.remove();
}

export function usePageMeta({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
  image = DEFAULT_IMAGE,
  noIndex = false,
}: PageMetaOptions) {
  useEffect(() => {
    const fullTitle = `${title} · ${SITE_NAME}`;
    const url = path ? `${BASE_URL}${path}` : BASE_URL;

    // Document title
    document.title = fullTitle;

    // Standard meta
    setMeta("description", description);
    if (noIndex) {
      setMeta("robots", "noindex, nofollow");
    } else {
      setMeta("robots", "index, follow");
    }

    // Open Graph
    setMeta("og:type", "website", "property");
    setMeta("og:title", fullTitle, "property");
    setMeta("og:description", description, "property");
    setMeta("og:url", url, "property");
    setMeta("og:site_name", SITE_NAME, "property");
    setMeta("og:image", image, "property");

    // Twitter
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", description);
    setMeta("twitter:image", image);

    // Canonical
    removeCanonical();
    if (path) {
      const link = document.createElement("link");
      link.rel = "canonical";
      link.href = url;
      document.head.appendChild(link);
    }

    // Cleanup on unmount
    return () => {
      document.title = SITE_NAME;
      removeCanonical();
    };
  }, [title, description, path, image, noIndex]);
}
