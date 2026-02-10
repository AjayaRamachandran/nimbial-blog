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

export function updateOG({
  type = "website",
  siteName = "Nimbial - Blog",
  title = "Read it on the Nimbial Blog",
  description = "Read it on the Nimbial Blog",
  image = "/assets/link-preview.png",
  url,
}) {
  const loc = typeof window !== "undefined" ? window.location.href : undefined;
  const resolvedUrl = url || loc;

  const ogPairs = [
    ["og:type", type],
    ["og:site_name", siteName],
    ["og:title", title],
    ["og:description", description],
    ["og:image", image],
  ];
  if (resolvedUrl) ogPairs.push(["og:url", resolvedUrl]);

  ogPairs.forEach(([key, val]) => {
    const el = ensureMeta("property", key);
    el.setAttribute("content", val);
  });

  const twitterPairs = [
    ["twitter:card", "summary_large_image"],
    ["twitter:title", title],
    ["twitter:description", description],
    ["twitter:image", image],
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
