import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./blogpost.css";

function BlogPost() {
  const { name } = useParams();
  const [content, setContent] = useState("");
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    async function loadArticle() {
      try {
        // Load the JSON metadata
        const metaRes = await fetch(`/blog-posts/${name}.json`);
        const metaData = await metaRes.json();
        setMeta(metaData);

        // Load the markdown file
        const mdRes = await fetch(`/blog-posts/${name}.md`);
        const mdText = await mdRes.text();
        setContent(mdText);
      } catch (error) {
        console.error("Error loading article:", error);
      }
    }

    loadArticle();
  }, [name]);

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
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ node, ...props }) => (
                <a {...props} target="_blank" rel="noopener noreferrer" />
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </article>
      </div>
    </>
  );
}

export default BlogPost;
