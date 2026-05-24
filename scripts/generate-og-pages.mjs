import { promises as fs } from 'fs';
import { createHash } from 'crypto';
import path from 'path';

const DEFAULT_SITE_ORIGIN = 'https://blog.nimbial.com';

function escapeHtmlAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function injectOrReplaceMeta(html, tags) {
  let out = html;
  const ensure = (selector, tagHtml) => {
    const rx = new RegExp(`<meta[^>]+${selector}[^>]*>`, 'i');
    if (rx.test(out)) {
      out = out.replace(rx, tagHtml);
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

async function main() {
  const repoRoot = process.cwd();
  const distDir = path.join(repoRoot, 'dist');
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

  for (const slug of slugs) {
    const metaPath = path.join(postsDir, `${slug}.json`);
    const meta = JSON.parse(await fs.readFile(metaPath, 'utf8'));

    const title = meta.title || 'Read it on the Nimbial Blog';
    const description = 'Read it on the Nimbial Blog';
    const imageAbs = await addLocalAssetVersion(
      toAbsoluteImage(meta.img_url, siteOrigin),
      publicDir,
    );
    const imageType = getImageType(imageAbs);
    const pageUrl = siteOrigin ? `${siteOrigin}/pages/${slug}` : undefined;

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
    if (pageUrl) tags.push({ attr: 'property', key: 'og:url', content: pageUrl });

    tags.push(
      { attr: 'name', key: 'twitter:card', content: 'summary_large_image' },
      { attr: 'name', key: 'twitter:title', content: title },
      { attr: 'name', key: 'twitter:description', content: description },
      { attr: 'name', key: 'twitter:image', content: imageAbs },
    );

    html = injectOrReplaceMeta(html, tags);
    html = html.replace(/<title>[^<]*<\/title>/i, `<title>${title} · Nimbial Blog<\/title>`);

    const outDir = path.join(distDir, 'pages', slug);
    await fs.mkdir(outDir, { recursive: true });
    const outPath = path.join(outDir, 'index.html');
    await fs.writeFile(outPath, html, 'utf8');
  }

  console.log(`Generated static OG pages for ${slugs.length} posts.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
