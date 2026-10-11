import fs from "node:fs";
import path from "node:path";

const siteUrl = (process.env.VITE_SITE_URL || "").replace(/\/$/, "");
const publicDir = path.resolve("public");

if (!siteUrl) {
  console.warn("VITE_SITE_URL is not set; sitemap.xml will not be generated.");
  process.exit(0);
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${siteUrl}/</loc>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>\n`;
fs.writeFileSync(path.join(publicDir, "sitemap.xml"), sitemap);
fs.writeFileSync(path.join(publicDir, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`);
console.log(`Generated sitemap.xml for ${siteUrl}`);
