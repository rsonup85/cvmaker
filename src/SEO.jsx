import { useEffect } from "react";

const SITE_URL = (import.meta.env.VITE_SITE_URL || "").replace(/\/$/, "");

const seoByPath = {
  "/": {
    title: "Free CV Maker & Resume Builder Online | Professional Templates",
    description:
      "Create a professional CV or resume online with ATS-friendly templates, career objective examples, and instant PDF export.",
    keywords:
      "free CV maker, resume builder, online resume maker, CV templates, ATS resume, professional resume templates, resume builder India",
  },
};

export function SEO() {
  useEffect(() => {
    const path = window.location.pathname || "/";
    const seo = seoByPath[path] || seoByPath["/"];
    const canonical = SITE_URL ? `${SITE_URL}${path}` : window.location.href.split("#")[0];

    document.title = seo.title;

    const setMeta = (name, content, attribute = "name") => {
      let el = document.head.querySelector(`meta[${attribute}="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attribute, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("description", seo.description);
    setMeta("keywords", seo.keywords);
    setMeta("robots", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
    setMeta("og:title", seo.title, "property");
    setMeta("og:description", seo.description, "property");
    setMeta("og:type", "website", "property");
    setMeta("og:url", canonical, "property");
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", seo.title);
    setMeta("twitter:description", seo.description);

    let link = document.head.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = canonical;

    const structuredData = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebApplication",
          name: "CV Maker AI",
          url: SITE_URL || window.location.origin,
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          description: seo.description,
          offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
        },
        {
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "Can I create a CV online for free?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. CV Maker AI lets you build a professional CV online using free templates and export the finished resume as a PDF."
              }
            },
            {
              "@type": "Question",
              name: "Are the resume templates ATS-friendly?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "The builder includes clean, readable ATS-oriented layouts designed to keep resume sections easy to scan."
              }
            },
            {
              "@type": "Question",
              name: "Who can use the CV maker?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Students, freshers, experienced professionals, and job seekers can use the resume builder to create a CV."
              }
            }
          ]
        },
        {
          "@type": "WebSite",
          name: "CV Maker AI",
          url: SITE_URL || window.location.origin,
          potentialAction: {
            "@type": "SearchAction",
            target: `${SITE_URL || window.location.origin}/?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        },
      ],
    };

    let script = document.getElementById("seo-structured-data");
    if (!script) {
      script = document.createElement("script");
      script.id = "seo-structured-data";
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(structuredData);
  }, []);

  return null;
}
