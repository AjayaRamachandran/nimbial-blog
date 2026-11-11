import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowUp, Search } from "lucide-react";
import "./homepage.css";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { DarkModeContext } from "@/context/DarkModeContext";

function HomePage() {
  const [posts, setPosts] = useState([]);
  const [reversed, setReversed] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { darkMode } = useContext(DarkModeContext);

  useEffect(() => {
    async function loadPosts() {
      try {
        const listRes = await fetch("/blog-posts/pages.json");
        const slugs = await listRes.json();

        const postData = await Promise.all(
          slugs.map(async (slug) => {
            const jsonRes = await fetch(`/blog-posts/${slug}.json`);
            const data = await jsonRes.json();
            return { ...data, slug }; // attach slug for linking
          }),
        );

        setPosts(postData);
      } catch (error) {
        console.error("Error loading blog posts:", error);
      }
    }

    loadPosts();
  }, []);

  // Live, case-insensitive filter on title + description, then optional reverse.
  const visiblePosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? posts.filter((post) =>
          `${post.title ?? ""} ${post.description ?? ""}`
            .toLowerCase()
            .includes(q),
        )
      : posts;
    return reversed ? [...filtered].reverse() : filtered;
  }, [posts, query, reversed]);

  return (
    <>
      <Navbar />
      <div className="homepage-banner">
        <div className="title-arc">
          <svg width="1400px" height="250" viewBox="0 0 600 80">
            <path id="arcPath" d="M 20,40 Q 300,0 580,40" fill="transparent" />
            <text
              style={{ fontSize: "calc(7px + 2.2vw)" }}
              fontWeight="bold"
              fontStyle="italic"
              textAnchor="middle"
            >
              <textPath href="#arcPath" startOffset="50%" fill="var(--text-color)">
                Hey there! Welcome to our blog.
              </textPath>
            </text>
          </svg>
        </div>
        <div className="title-not-arc">
          <span>Hey there! Welcome to our blog.</span>
        </div>
      </div>

      <div className="subtitle">
        Learn about our products and our takes on tech.
      </div>
      <div className="title-bar">
        <button
          type="button"
          className="sort-toggle"
          onClick={() => setReversed((r) => !r)}
          aria-label={reversed ? "Showing oldest first. Show latest first" : "Showing latest first. Show oldest first"}
          title={reversed ? "Oldest first" : "Latest first"}
        >
          <span>Latest</span>
          <ArrowUp
            className={"sort-arrow" + (reversed ? " flipped" : "")}
            size="0.6em"
            strokeWidth={2.25}
            aria-hidden="true"
          />
        </button>

        <label className="post-search">
          <Search size={15} strokeWidth={2.25} aria-hidden="true" />
          <input
            type="search"
            placeholder="Search articles"
            aria-label="Search articles"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>

      <div className="homepage-grid-container">
        {posts.length > 0 && visiblePosts.length === 0 && (
          <div className="no-results">
            No articles match your search. Try a different word.
          </div>
        )}
        <div className="homepage-grid">
          {visiblePosts.map((post) => (
            <a
              key={post.slug}
              className="blog-card"
              href={"pages/" + post.slug}
            >
              <div className="blog-card-image">
                <img src={post.img_url} alt={post.title} />
              </div>

              <div className="blog-card-title">{post.title}</div>

              <div className="blog-card-author">{post.author}</div>

              <div
                className={"blog-card-category " + post.category.toLowerCase()}
              >
                {post.category}
              </div>

              <div className="blog-card-date">{post.date}</div>

              <div className="blog-card-description">{post.description}</div>

              {/* <Link to={`/pages/${post.slug}`} className="blog-card-readmore">
                Read More
              </Link> */}
            </a>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default HomePage;
