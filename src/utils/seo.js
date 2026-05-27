export function setMetaTag(selector, attr, value) {
  if (!value) return;
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(
      attr === "name" ? "name" : "property",
      selector.includes("og:") ? selector.match(/"(.*?)"/)?.[1] : "",
    );
  }
  el.setAttribute("content", value);
  if (!el.parentNode) document.head.appendChild(el);
}

function ensureMeta(attr, key) {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  return el;
}

function toAbsoluteUrl(url) {
  if (!url || /^(https?:)?\/\//i.test(url) || url.startsWith("data:")) {
    return url;
  }

  const origin = typeof window !== "undefined" ? window.location.origin : undefined;
  if (!origin) return url;

  return new URL(url, `${origin}/`).href;
}

function getImageType(url) {
  if (!url) return undefined;

  const pathname = (() => {
    try {
      return new URL(url, "https://example.com").pathname;
    } catch {
      return url;
    }
  })();

  if (/\.png$/i.test(pathname)) return "image/png";
  if (/\.(jpe?g)$/i.test(pathname)) return "image/jpeg";
  if (/\.gif$/i.test(pathname)) return "image/gif";
  if (/\.webp$/i.test(pathname)) return "image/webp";
  return undefined;
}

export function updateOG({
  type = "website",
  siteName = "Nimbial - Blog",
  title = "Read it on the Nimbial Blog",
  description = "Read it on the Nimbial Blog",
  image = "/assets/link-preview.png",
  imageWidth = "695",
  imageHeight = "512",
  twitterCard = "summary_large_image",
  url,
}) {
  const loc = typeof window !== "undefined" ? window.location.href : undefined;
  const resolvedUrl = url || loc;
  const resolvedImage = toAbsoluteUrl(image);
  const imageType = getImageType(resolvedImage);

  const ogPairs = [
    ["og:type", type],
    ["og:site_name", siteName],
    ["og:title", title],
    ["og:description", description],
    ["og:image", resolvedImage],
    ["og:image:url", resolvedImage],
    ["og:image:secure_url", resolvedImage],
  ];
  if (imageType) ogPairs.push(["og:image:type", imageType]);
  if (imageWidth) ogPairs.push(["og:image:width", imageWidth]);
  if (imageHeight) ogPairs.push(["og:image:height", imageHeight]);
  if (resolvedUrl) ogPairs.push(["og:url", resolvedUrl]);

  ogPairs.forEach(([key, val]) => {
    const el = ensureMeta("property", key);
    el.setAttribute("content", val);
  });

  const twitterPairs = [
    ["twitter:card", twitterCard],
    ["twitter:title", title],
    ["twitter:description", description],
    ["twitter:image", resolvedImage],
  ];
  twitterPairs.forEach(([key, val]) => {
    const el = ensureMeta("name", key);
    el.setAttribute("content", val);
  });

  if (title) document.title = `${title} · Nimbial Blog`;
}

export function resetOGToDefaults() {
  updateOG({});
}
