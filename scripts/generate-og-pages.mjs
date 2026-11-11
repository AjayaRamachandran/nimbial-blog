import { promises as fs } from 'fs';
import { createHash } from 'crypto';
import path from 'path';
import { createServer } from 'vite';

const DEFAULT_SITE_ORIGIN = 'https://blog.nimbial.com';

function escapeHtmlAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeHtmlText(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Safe to place inside a <script> tag: stops "</script>" from ending it early.
function jsonForScript(value) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(new RegExp(String.fromCharCode(0x2028), 'g'), '\\u2028')
    .replace(new RegExp(String.fromCharCode(0x2029), 'g'), '\\u2029');
}

// Post dates are written as M/D/YYYY; returns YYYY-MM-DD or undefined.
function toIsoDate(value) {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(String(value || '').trim());
  if (!match) return undefined;
  const [, month, day, year] = match;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function injectOrReplaceMeta(html, tags) {
  let out = html;
  const ensure = (selector, tagHtml) => {
    const rx = new RegExp(`<meta[^>]+${selector}[^>]*>`, 'i');
    if (rx.test(out)) {
      out = out.replace(rx, () => tagHtml);
    } else {
      out = out.replace(/<head(.*?)>/i, (m) => `${m}\n    ${tagHtml}`);
    }
  };

  tags.forEach(({ attr, key, content }) => {
    const attrSelector = `${attr}=[\"']${key}[\"']`;
    const tag = `<meta ${attr}="${key}" content="${escapeHtmlAttr(content)}">`;
    ensure(attrSelector, tag);
  });
  return out;
}

function injectIntoHead(html, markup) {
  return html.replace(/<\/head>/i, () => `${markup}\n  </head>`);
}

function injectOrReplaceLink(html, rel, href) {
  const tag = `<link rel="${rel}" href="${escapeHtmlAttr(href)}">`;
  const rx = new RegExp(`<link[^>]+rel=["']${rel}["'][^>]*>`, 'i');
  return rx.test(html) ? html.replace(rx, () => tag) : injectIntoHead(html, `    ${tag}`);
}

function toAbsoluteImage(url, siteOrigin) {
  if (!url) return new URL('/assets/link-preview.png', siteOrigin).href;
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('//')) return `https:${url}`;
  return new URL(url, `${siteOrigin}/`).href;
}

function getImageType(url) {
  const pathname = new URL(url, 'https://example.com').pathname;
  if (/\.png$/i.test(pathname)) return 'image/png';
  if (/\.(jpe?g)$/i.test(pathname)) return 'image/jpeg';
  if (/\.gif$/i.test(pathname)) return 'image/gif';
  if (/\.webp$/i.test(pathname)) return 'image/webp';
  return undefined;
}

async function addLocalAssetVersion(url, publicDir) {
  const imageUrl = new URL(url);
  const assetPath = path.join(publicDir, decodeURIComponent(imageUrl.pathname));
  const relativeAssetPath = path.relative(publicDir, assetPath);

  if (relativeAssetPath.startsWith('..') || path.isAbsolute(relativeAssetPath)) {
    return url;
  }

  try {
    const buffer = await fs.readFile(assetPath);
    const hash = createHash('sha256').update(buffer).digest('hex').slice(0, 10);
    imageUrl.searchParams.set('v', hash);
    return imageUrl.href;
  } catch {
    return url;
  }
}

// Output folder: `--dist <dir>` or DIST_DIR, defaulting to ./dist.
function parseDistDir(repoRoot) {
  const flagIndex = process.argv.indexOf('--dist');
  const fromFlag = flagIndex !== -1 ? process.argv[flagIndex + 1] : undefined;
  return path.resolve(repoRoot, fromFlag || process.env.DIST_DIR || 'dist');
}

// Loads src/prerender.jsx through Vite (JSX, the "@/" alias, CSS imports)
// without starting a web server.
async function loadPrerenderer(repoRoot) {
  const vite = await createServer({
    root: repoRoot,
    logLevel: 'error',
    appType: 'custom',
    server: { middlewareMode: true, hmr: false, watch: null },
  });
  try {
    const mod = await vite.ssrLoadModule('/src/prerender.jsx');
    return { renderPostPage: mod.renderPostPage, close: () => vite.close() };
  } catch (err) {
    await vite.close();
    throw err;
  }
}

function buildSitemap(siteOrigin, posts) {
  const newest = posts.map((p) => p.isoDate).filter(Boolean).sort().at(-1);
  const urls = [
    { loc: `${siteOrigin}/`, lastmod: newest },
    ...posts.map((p) => ({ loc: p.pageUrl, lastmod: p.isoDate })),
  ];
  const entries = urls.map(({ loc, lastmod }) => [
    '  <url>',
    `    <loc>${escapeHtmlText(loc)}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
    '  </url>',
  ].filter(Boolean).join('\n'));
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    '</urlset>',
    '',
  ].join('\n');
}

// Points AI tools at the rendered article pages (never the raw markdown), so
// they get charts and everything else the way readers do.
function buildLlmsTxt(siteOrigin, posts) {
  return [
    '# Nimbial Blog',
    '',
    '> Articles from Nimbial about Symphony, AI, and software. Each link below is the full article as a web page.',
    '',
    `Home: ${siteOrigin}/`,
    '',
    '## Articles',
    '',
    ...posts.map((p) => {
      const details = [p.isoDate, p.meta.description].filter(Boolean).join(' — ');
      return `- [${p.title}](${p.pageUrl})${details ? `: ${details}` : ''}`;
    }),
    '',
  ].join('\n');
}

function buildRobotsTxt(siteOrigin) {
  return `User-agent: *\nAllow: /\n\nSitemap: ${siteOrigin}/sitemap.xml\n`;
}

async function main() {
  const repoRoot = process.cwd();
  const distDir = parseDistDir(repoRoot);
  const publicDir = path.join(repoRoot, 'public');
  const postsDir = path.join(publicDir, 'blog-posts');

  const baseHtmlPath = path.join(distDir, 'index.html');
  const baseHtml = await fs.readFile(baseHtmlPath, 'utf8');

  const pagesJsonPath = path.join(postsDir, 'pages.json');
  const slugs = JSON.parse(await fs.readFile(pagesJsonPath, 'utf8'));

  const siteOrigin = (
    process.env.SITE_ORIGIN
    || process.env.VITE_SITE_ORIGIN
    || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined)
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined)
    || DEFAULT_SITE_ORIGIN
  ).replace(/\/+$/, '');

  const prerenderer = await loadPrerenderer(repoRoot);
  const posts = [];

  try {
    for (const slug of slugs) {
      const metaPath = path.join(postsDir, `${slug}.json`);
      const meta = JSON.parse(await fs.readFile(metaPath, 'utf8'));
      const markdown = await fs.readFile(path.join(postsDir, `${slug}.md`), 'utf8');

      const title = meta.title || 'Read it on the Nimbial Blog';
      const description = meta.description || 'Read it on the Nimbial Blog';
      const isoDate = toIsoDate(meta.date);
      const imageAbs = await addLocalAssetVersion(
        toAbsoluteImage(meta.img_url, siteOrigin),
        publicDir,
      );
      const imageType = getImageType(imageAbs);
      const imageWidth = meta.og_image_width || '695';
      const imageHeight = meta.og_image_height || '512';
      const twitterCard = meta.twitter_card || 'summary_large_image';
      const pageUrl = `${siteOrigin}/pages/${slug}`;

      let html = baseHtml;

      const tags = [
        { attr: 'property', key: 'og:type', content: 'article' },
        { attr: 'property', key: 'og:site_name', content: 'Nimbial - Blog' },
        { attr: 'property', key: 'og:title', content: title },
        { attr: 'property', key: 'og:description', content: description },
        { attr: 'property', key: 'og:image', content: imageAbs },
        { attr: 'property', key: 'og:image:url', content: imageAbs },
        { attr: 'property', key: 'og:image:secure_url', content: imageAbs },
      ];
      if (imageType) tags.push({ attr: 'property', key: 'og:image:type', content: imageType });
      if (imageWidth) tags.push({ attr: 'property', key: 'og:image:width', content: imageWidth });
      if (imageHeight) tags.push({ attr: 'property', key: 'og:image:height', content: imageHeight });
      tags.push({ attr: 'property', key: 'og:url', content: pageUrl });
      if (isoDate) tags.push({ attr: 'property', key: 'article:published_time', content: isoDate });

      tags.push(
        { attr: 'name', key: 'twitter:card', content: twitterCard },
        { attr: 'name', key: 'twitter:title', content: title },
        { attr: 'name', key: 'twitter:description', content: description },
        { attr: 'name', key: 'twitter:image', content: imageAbs },
        { attr: 'name', key: 'description', content: description },
      );
      if (meta.author) tags.push({ attr: 'name', key: 'author', content: meta.author });

      html = injectOrReplaceMeta(html, tags);
      html = html.replace(/<title>[^<]*<\/title>/i, () => `<title>${escapeHtmlText(title)} · Nimbial Blog</title>`);
      html = injectOrReplaceLink(html, 'canonical', pageUrl);

      const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: title,
        description,
        image: imageAbs,
        url: pageUrl,
        mainEntityOfPage: pageUrl,
        ...(isoDate && { datePublished: isoDate }),
        ...(meta.author && { author: { '@type': 'Person', name: meta.author } }),
        publisher: { '@type': 'Organization', name: 'Nimbial' },
      };
      html = injectIntoHead(
        html,
        `    <script type="application/ld+json">${jsonForScript(structuredData)}</script>`,
      );

      // The full article as HTML, readable without running JavaScript. The
      // JSON copy lets the app show the same content on its very first render.
      const articleHtml = prerenderer.renderPostPage({ slug, meta, markdown });
      const rootRx = /<div id="root"><\/div>/;
      if (!rootRx.test(html)) {
        throw new Error(`Could not find <div id="root"></div> in ${baseHtmlPath}`);
      }
      html = html.replace(
        rootRx,
        () => `<div id="root">${articleHtml}</div>\n    <script type="application/json" id="prerendered-post">${jsonForScript({ slug, meta, markdown })}</script>`,
      );

      const outDir = path.join(distDir, 'pages', slug);
      await fs.mkdir(outDir, { recursive: true });
      await fs.writeFile(path.join(outDir, 'index.html'), html, 'utf8');

      posts.push({ slug, meta, title, isoDate, pageUrl });
    }
  } finally {
    await prerenderer.close();
  }

  await fs.writeFile(path.join(distDir, 'sitemap.xml'), buildSitemap(siteOrigin, posts), 'utf8');
  await fs.writeFile(path.join(distDir, 'robots.txt'), buildRobotsTxt(siteOrigin), 'utf8');
  await fs.writeFile(path.join(distDir, 'llms.txt'), buildLlmsTxt(siteOrigin, posts), 'utf8');

  console.log(`Prerendered ${posts.length} posts; wrote sitemap.xml, robots.txt and llms.txt.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
