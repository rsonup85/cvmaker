import React, { useEffect } from "react";

const SITE = "https://www.biodatamaker.store";

const pages = {
  biodata: {
    path: "/biodata-maker/",
    title: "Biodata Maker Online – Create Professional Biodata",
    description: "Create a professional biodata online with an easy-to-use maker. Add your personal, education, family and other details, then prepare your biodata for sharing or PDF download.",
    h1: "Biodata Maker Online",
    intro: "Create a clean, professional biodata online with BiodataMaker. Enter your details, choose a suitable design and prepare a biodata that is easy to share or save as a PDF.",
    cta: "Create Your Biodata",
    href: "/",
    related: [
      ["Marriage Biodata Maker", "/marriage-biodata-maker/"],
      ["Resume Maker", "/resume-maker/"],
      ["CV Maker", "/cv-maker/"],
    ],
  },
  marriage: {
    path: "/marriage-biodata-maker/",
    title: "Marriage Biodata Maker – Create Marriage Biodata Online",
    description: "Create a professional marriage biodata online with personal, education, family and other important details. Prepare a marriage biodata for sharing or PDF download.",
    h1: "Marriage Biodata Maker",
    intro: "Create a professional marriage biodata online. Add personal, education, family and other relevant information in a clear format and prepare it for easy sharing or PDF download.",
    cta: "Create Marriage Biodata",
    href: "/",
    related: [
      ["Biodata Maker", "/biodata-maker/"],
      ["Resume Maker", "/resume-maker/"],
      ["CV Maker", "/cv-maker/"],
    ],
  },
  resume: {
    path: "/resume-maker/",
    title: "Resume Maker Online – Create a Professional Resume",
    description: "Create a professional resume online with an easy resume maker. Add your experience, education, skills and other details, then prepare your resume for PDF download.",
    h1: "Resume Maker Online",
    intro: "Build a professional resume online with BiodataMaker. Add your experience, education, skills and other information, choose a design and prepare your resume for applications or PDF download.",
    cta: "Create Your Resume",
    href: "/",
    related: [
      ["CV Maker", "/cv-maker/"],
      ["Biodata Maker", "/biodata-maker/"],
      ["Marriage Biodata Maker", "/marriage-biodata-maker/"],
    ],
  },
  cv: {
    path: "/cv-maker/",
    title: "CV Maker Online – Create a Professional CV",
    description: "Create a professional CV online with an easy CV maker. Add your education, experience, skills and other details, then prepare your CV for PDF download.",
    h1: "CV Maker Online",
    intro: "Create a professional CV online with BiodataMaker. Add your education, experience, skills and other information, select a design and prepare your CV for job applications or PDF download.",
    cta: "Create Your CV",
    href: "/",
    related: [
      ["Resume Maker", "/resume-maker/"],
      ["Biodata Maker", "/biodata-maker/"],
      ["Marriage Biodata Maker", "/marriage-biodata-maker/"],
    ],
  },
};

export default function SeoLandingPage({ type }) {
  const page = pages[type] || pages.biodata;

  useEffect(() => {
    document.title = page.title;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = page.description;

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = `${SITE}${page.path}`;

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: page.title,
      description: page.description,
      url: `${SITE}${page.path}`,
      isPartOf: { "@type": "WebSite", name: "BiodataMaker", url: `${SITE}/` },
    };
    let script = document.getElementById("seo-page-jsonld");
    if (!script) {
      script = document.createElement("script");
      script.id = "seo-page-jsonld";
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(jsonLd);

    return () => {
      const current = document.getElementById("seo-page-jsonld");
      if (current) current.remove();
    };
  }, [page]);

  return (
    <main style={{ minHeight: "100vh", background: "#f8fafc", color: "#0f172a", fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <header style={{ borderBottom: "1px solid #e2e8f0", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
          <a href="/" style={{ fontWeight: 800, fontSize: 20, color: "#0f172a", textDecoration: "none" }}>BiodataMaker</a>
          <a href="/" style={{ color: "#2563eb", fontWeight: 700, textDecoration: "none" }}>Create Now</a>
        </div>
      </header>

      <section style={{ maxWidth: 900, margin: "0 auto", padding: "70px 20px 40px" }}>
        <p style={{ color: "#2563eb", fontWeight: 700, marginBottom: 10 }}>BiodataMaker</p>
        <h1 style={{ fontSize: "clamp(34px, 6vw, 58px)", lineHeight: 1.05, margin: "0 0 20px", letterSpacing: "-0.03em" }}>{page.h1}</h1>
        <p style={{ fontSize: 19, lineHeight: 1.7, color: "#475569", maxWidth: 760 }}>{page.intro}</p>
        <a href={page.href} style={{ display: "inline-block", marginTop: 18, padding: "13px 22px", borderRadius: 10, background: "#2563eb", color: "#fff", textDecoration: "none", fontWeight: 800 }}>{page.cta}</a>
      </section>

      <section style={{ maxWidth: 900, margin: "0 auto", padding: "10px 20px 70px" }}>
        <h2 style={{ fontSize: 28 }}>Why use BiodataMaker?</h2>
        <ul style={{ lineHeight: 1.9, color: "#475569" }}>
          <li>Enter your important information in an organized format.</li>
          <li>Choose a clean design suitable for sharing and applications.</li>
          <li>Prepare your document for convenient PDF download.</li>
          <li>Edit your details whenever you need to update the document.</li>
        </ul>

        <h2 style={{ fontSize: 28, marginTop: 42 }}>Create another document</h2>
        <nav aria-label="Related document makers" style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {page.related.map(([label, href]) => (
            <a key={href} href={href} style={{ padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: 9, background: "#fff", color: "#1d4ed8", fontWeight: 700, textDecoration: "none" }}>{label}</a>
          ))}
        </nav>
      </section>
    </main>
  );
}
