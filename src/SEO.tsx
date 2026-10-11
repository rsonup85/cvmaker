/**
 * CVMaker AI - SEO & Structured Data (JSON-LD) Component
 * Official Production Domain: https://www.biodatamaker.store
 */

import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  mode?: 'job' | 'marriage';
}

const PRODUCTION_DOMAIN = 'https://www.biodatamaker.store';

export const SEO: React.FC<SEOProps> = ({
  title = 'CVMaker AI — Premium Resume & Marriage Biodata Maker',
  description = 'Build professional Indian Job Resumes, CVs, and authentic Marriage Biodatas with 400+ premium templates, AI Copilot, live A4 preview, and instant export.',
  mode = 'job'
}) => {
  useEffect(() => {
    document.title = title;

    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', description);
    }

    // Canonical link tag
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `${PRODUCTION_DOMAIN}/`;

    // OpenGraph URL
    let ogUrl = document.querySelector('meta[property="og:url"]') as HTMLMetaElement | null;
    if (!ogUrl) {
      ogUrl = document.createElement('meta');
      ogUrl.setAttribute('property', 'og:url');
      document.head.appendChild(ogUrl);
    }
    ogUrl.content = `${PRODUCTION_DOMAIN}/`;

    // Add Schema.org structured data (JSON-LD)
    const schemaData = {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Biodata Maker AI',
      url: PRODUCTION_DOMAIN,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'All',
      offers: {
        '@type': 'Offer',
        price: '9.00',
        priceCurrency: 'INR'
      },
      description: description
    };

    let scriptTag = document.getElementById('cvmaker-schema-jsonld') as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'cvmaker-schema-jsonld';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.text = JSON.stringify(schemaData);
  }, [title, description, mode]);

  return null;
};
