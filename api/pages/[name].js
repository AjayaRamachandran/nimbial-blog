export const config = {
  runtime: "edge",
};

function injectOrReplaceMeta(html, tags) {
  let out = html;
  const ensure = (selector, tagHtml) => {
    const rx = new RegExp(`<meta[^>]+${selector}[^>]*>`, "i");
    if (rx.test(out)) {
      out = out.replace(rx, tagHtml);
    } else {
      out = out.replace(/<head(.*?)>/i, (m) => `${m}\n    ${tagHtml}`);
    }
  };

  tags.forEach(({ attr, key, content }) => {
    const attrSelector = `${attr}=[\"']${key}[\"']`;
    const tag = `<meta ${attr}="${key}" content="${content}">`;
    ensure(attrSelector, tag);
  });
  return out;
}

export default async function handler(req) {
  try {
    const url = new URL(req.url);
    const origin = url.origin;
    const segments = url.pathname.split("/");
    const name = decodeURIComponent(segments.pop() || "");

    // Fetch post metadata JSON
    let post;
    try {
      const metaRes = await fetch(`${origin}/blog-posts/${name}.json`, {
        cache: "no-cache",
      });
      if (metaRes.ok) {
        post = await metaRes.json();
      }
    } catch {}

    const title = post?.title || "Read it on the Nimbial Blog";
    const description = "Read it on the Nimbial Blog";
    // Ensure absolute image URL for crawlers
    const rawImage = post?.img_url || "/assets/link-preview.png";
    const image = rawImage.startsWith("http")
      ? rawImage
      : `${origin}${rawImage.startsWith("/") ? "" : "/"}${rawImage}`;
    const siteName = "Nimbial - Blog";

    // Fetch the built index.html to preserve scripts/styles
    const baseHtmlRes = await fetch(`${origin}/index.html`, {
      cache: "no-cache",
    });
    let html = await baseHtmlRes.text();

    const tags = [
      {
        attr: "property",
        key: "og:type",
        content: post ? "article" : "website",
      },
      { attr: "property", key: "og:site_name", content: siteName },
      { attr: "property", key: "og:title", content: title },
      { attr: "property", key: "og:description", content: description },
      { attr: "property", key: "og:image", content: image },
      { attr: "property", key: "og:url", content: url.href },
      { attr: "name", key: "twitter:card", content: "summary_large_image" },
      { attr: "name", key: "twitter:title", content: title },
      { attr: "name", key: "twitter:description", content: description },
      { attr: "name", key: "twitter:image", content: image },
    ];

    html = injectOrReplaceMeta(html, tags);

    // Also update the <title>
    html = html.replace(
      /<title>[^<]*<\/title>/i,
      `<title>${title} · Nimbial Blog<\/title>`,
    );

    return new Response(html, {
      headers: { "content-type": "text/html; charset=utf-8" },
      status: 200,
    });
  } catch (err) {
    // Fallback to simple HTML with defaults
    const url = new URL(req.url);
    const fallback = `<!doctype html><html><head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Read it on the Nimbial Blog</title>
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Nimbial - Blog" />
      <meta property="og:title" content="Read it on the Nimbial Blog" />
      <meta property="og:description" content="Read it on the Nimbial Blog" />
      <meta property="og:image" content="/assets/link-preview.png" />
      <meta property="og:url" content="${url.href}" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Read it on the Nimbial Blog" />
      <meta name="twitter:description" content="Read it on the Nimbial Blog" />
      <meta name="twitter:image" content="/assets/link-preview.png" />
    </head><body>
      <div id="root"></div>
      <script type="module" src="/src/main.jsx"></script>
    </body></html>`;
    return new Response(fallback, {
      headers: { "content-type": "text/html; charset=utf-8" },
      status: 200,
    });
  }
}
