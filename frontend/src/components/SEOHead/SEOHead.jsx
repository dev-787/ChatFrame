import { useEffect } from 'react';

/**
 * SEOHead — Injects per-page SEO metadata into document.head without any
 * external dependency (no react-helmet / react-helmet-async needed).
 *
 * Usage:
 *   <SEOHead
 *     title="Page Title | ChatFrame"
 *     description="..."
 *     canonical="https://chatframe.com/home"
 *     ogImage="https://chatframe.com/og-image.png"
 *     jsonLd={[...schemas]}
 *   />
 */

const BASE_URL = 'https://chatframe.com';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;

const setMeta = (name, content, attr = 'name') => {
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

const setLink = (rel, href, extra = {}) => {
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
  Object.entries(extra).forEach(([k, v]) => el.setAttribute(k, v));
};

const SCRIPT_ID_PREFIX = 'seo-jsonld-';

const injectJsonLd = (schemas) => {
  // Remove any previously injected JSON-LD scripts
  document.querySelectorAll(`script[id^="${SCRIPT_ID_PREFIX}"]`).forEach(s => s.remove());
  schemas.forEach((schema, i) => {
    const script = document.createElement('script');
    script.id = `${SCRIPT_ID_PREFIX}${i}`;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema, null, 2);
    document.head.appendChild(script);
  });
};

const SEOHead = ({
  title,
  description,
  canonical,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  jsonLd = [],
  noindex = false,
}) => {
  useEffect(() => {
    // --- Title ---
    if (title) document.title = title;

    // --- Basic meta ---
    if (description) setMeta('description', description);
    setMeta('robots', noindex ? 'noindex, nofollow' : 'index, follow');

    // --- Canonical ---
    if (canonical) setLink('canonical', canonical);

    // --- Open Graph ---
    setMeta('og:type', ogType, 'property');
    if (title) setMeta('og:title', title, 'property');
    if (description) setMeta('og:description', description, 'property');
    setMeta('og:image', ogImage, 'property');
    setMeta('og:image:width', '1200', 'property');
    setMeta('og:image:height', '630', 'property');
    setMeta('og:image:alt', 'ChatFrame — AI-powered customer support platform', 'property');
    setMeta('og:site_name', 'ChatFrame', 'property');
    if (canonical) setMeta('og:url', canonical, 'property');

    // --- Twitter Card ---
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:site', '@chatframe');
    setMeta('twitter:creator', '@chatframe');
    if (title) setMeta('twitter:title', title);
    if (description) setMeta('twitter:description', description);
    setMeta('twitter:image', ogImage);
    setMeta('twitter:image:alt', 'ChatFrame — AI-powered customer support platform');

    // --- JSON-LD ---
    if (jsonLd.length > 0) injectJsonLd(jsonLd);
  }, [title, description, canonical, ogImage, ogType, noindex, jsonLd]);

  return null;
};

export default SEOHead;
