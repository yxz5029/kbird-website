const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const postersFile = path.join(rootDir, 'data', 'posters.js');
const indexFile = path.join(rootDir, 'index.html');
const sitemapFile = path.join(rootDir, 'sitemap.xml');
const siteUrl = (process.env.SITE_URL || 'https://yxz5029.github.io/kbird-website').replace(/\/+$/, '');

function formatPosterName(value) {
  return String(value || '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function extractPosterIds(sourceText) {
  const idMatches = [...sourceText.matchAll(/id:\s*'([^']+)'/g)];
  return idMatches.map((match) => match[1]);
}

const source = fs.readFileSync(postersFile, 'utf8');
const posterIds = extractPosterIds(source);

const tocLinks = posterIds
  .map((posterId) => `\t\t\t\t\t<a href="./poster.html?id=${posterId}">${formatPosterName(posterId)}</a>`)
  .join('\n');

const indexHtml = fs.readFileSync(indexFile, 'utf8');
const tocStart = '<!-- SEO-TOC-FALLBACK:START -->';
const tocEnd = '<!-- SEO-TOC-FALLBACK:END -->';
const tocPattern = new RegExp(`${tocStart}[\\s\\S]*?${tocEnd}`);

if (!tocPattern.test(indexHtml)) {
  throw new Error('Could not find SEO TOC fallback markers in index.html');
}

const updatedIndexHtml = indexHtml.replace(
  tocPattern,
  `${tocStart}\n${tocLinks}\n\t\t\t\t${tocEnd}`,
);

fs.writeFileSync(indexFile, updatedIndexHtml, 'utf8');

const sitemapEntries = posterIds
  .map((posterId) => `  <url>\n    <loc>${siteUrl}/poster.html?id=${encodeURIComponent(posterId)}</loc>\n  </url>`)
  .join('\n');

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${siteUrl}/</loc>\n  </url>\n${sitemapEntries}\n</urlset>\n`;

fs.writeFileSync(sitemapFile, sitemapXml, 'utf8');

console.log(`Generated ${posterIds.length} poster links in index.html and sitemap.xml`);
