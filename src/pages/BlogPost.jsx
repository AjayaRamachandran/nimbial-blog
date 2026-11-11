import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import IPhoneIntersectionProjectionGraph from "@/components/IPhoneIntersectionProjectionGraph";
import IPhoneParamCapacityGraph from "@/components/IPhoneParamCapacityGraph";
import LLMStatsOpenModelsGraph from "@/components/LLMStatsOpenModelsGraph";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import "./blogpost.css";
import { updateOG, resetOGToDefaults } from "@/utils/seo";

const LLM_STATS_OPEN_MODELS_GRAPH = "{{llm-stats-open-models-graph}}";
const IPHONE_PARAM_CAPACITY_GRAPH = "{{iphone-param-capacity-graph}}";
const IPHONE_INTERSECTION_PROJECTION_GRAPH = "{{iphone-intersection-projection-graph}}";
const MARKDOWN_COMPONENTS = {
  [IPHONE_INTERSECTION_PROJECTION_GRAPH]: IPhoneIntersectionProjectionGraph,
  [LLM_STATS_OPEN_MODELS_GRAPH]: LLMStatsOpenModelsGraph,
  [IPHONE_PARAM_CAPACITY_GRAPH]: IPhoneParamCapacityGraph,
};
const MARKDOWN_COMPONENT_PATTERN = new RegExp(
  `(${Object.keys(MARKDOWN_COMPONENTS)
    .map((placeholder) => placeholder.replace(/[{}]/g, "\\$&"))
    .join("|")})`,
);

function resolveMarkdownImageSrc(src) {
  if (!src) return src;

  // Keep external/data URLs untouched.
  if (/^(https?:)?\/\//i.test(src) || src.startsWith("data:")) {
    return src;
  }

  if (src.startsWith("/")) {
    return src;
  }

  const normalizedSrc = src.replace(/^\.?\//, "");
  const imagePath = normalizedSrc.replace(/^assets\/images\//, "");
  return `/assets/images/${imagePath}`;
}

const DEFAULT_DESCRIPTION = "Read it on the Nimbial Blog";

// Built pages carry the article in a JSON script so the first render already
// has it (no blank flash before the fetch finishes).
function readPrerenderedPost(name) {
  if (typeof document === "undefined") return null;
  try {
    const el = document.getElementById("prerendered-post");
    const data = el ? JSON.parse(el.textContent) : null;
    return data?.slug === name ? data : null;
  } catch {
    return null;
  }
}

function applyOG(metaData) {
  updateOG({
    type: "article",
    title: metaData.title,
    description: metaData.description || DEFAULT_DESCRIPTION,
    image: metaData.img_url,
    imageWidth: metaData.og_image_width,
    imageHeight: metaData.og_image_height,
    twitterCard: metaData.twitter_card,
  });
}

function BlogPost({ initialPost }) {
  const { name } = useParams();
  const [preloaded] = useState(() => initialPost ?? readPrerenderedPost(name));
  const [content, setContent] = useState(preloaded?.markdown ?? "");
  const [meta, setMeta] = useState(preloaded?.meta ?? null);
  const markdownParts = content.split(MARKDOWN_COMPONENT_PATTERN);

  useEffect(() => {
    let cancelled = false;

    async function loadArticle() {
      if (preloaded?.slug === name) {
        applyOG(preloaded.meta);
        return;
      }

      try {
        // Load the JSON metadata
        const metaRes = await fetch(`/blog-posts/${name}.json`);
        const metaData = await metaRes.json();
        if (cancelled) return;
        setMeta(metaData);
        applyOG(metaData);

        // Load the markdown file
        const mdRes = await fetch(`/blog-posts/${name}.md`);
        const mdText = await mdRes.text();
        if (cancelled) return;
        setContent(mdText);
      } catch (error) {
        console.error("Error loading article:", error);
      }
    }

    loadArticle();

    return () => {
      cancelled = true;
      // Restore defaults when navigating away
      resetOGToDefaults();
    };
  }, [name, preloaded]);

  return (
    <>
      <Navbar />

      <div className="blog-post-container">
        {/* Render metadata at top */}
        {meta && (
          <div className="article-header">
            {/* <div className="article-image">
              <img src={meta.img_url} alt={meta.title} />
            </div> */}

            <div className="article-title" text-style="display">
              {meta.title}
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "7px",
              }}
            >
              <div className="article-author">by {meta.author}</div>
              <div style={{ fontWeight: "700" }}>•</div>

              {/* <div className="article-category">
                {meta.category}
              </div> */}

              <div className="article-date">{meta.date}</div>
            </div>

            <div className="article-description">{meta.description}</div>
          </div>
        )}

        {/* Markdown content */}
        <article className="markdown-body">
          {markdownParts.map((part, index) => {
            const EmbeddedComponent = MARKDOWN_COMPONENTS[part];

            return EmbeddedComponent ? (
              <EmbeddedComponent key={`${name}-component-${index}`} />
            ) : (
              <ReactMarkdown
                key={`${name}-part-${index}`}
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  a: ({ node, ...props }) => (
                    <a {...props} target="_blank" rel="noopener noreferrer" />
                  ),
                  img: ({ node, src, alt, ...props }) => (
                    <img
                      {...props}
                      src={resolveMarkdownImageSrc(src)}
                      alt={alt ?? ""}
                      loading="lazy"
                    />
                  ),
                }}
              >
                {part}
              </ReactMarkdown>
            );
          })}
        </article>
      </div>
      <Footer />
    </>
  );
}

export default BlogPost;
