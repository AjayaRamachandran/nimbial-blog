import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./homepage.css";

import Navbar from "@/components/Navbar";
import { DarkModeContext } from "@/context/DarkModeContext";
import { resetOGToDefaults } from "@/utils/seo";

function HomePage() {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();
  const { darkMode } = useContext(DarkModeContext);

  useEffect(() => {
    // Ensure default OG tags on homepage
    resetOGToDefaults();

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

  return (
    <div className={darkMode ? `dark-mode` : ``}>
      <Navbar />
      <div className="title-arc">
        <svg width="1400px" height="250" viewBox="0 0 600 80">
          <path id="arcPath" d="M 20,40 Q 300,0 580,40" fill="transparent" />
          <text
            style={{ fontSize: "calc(5px + 2vw)" }}
            fontWeight="bold"
            fontStyle="italic"
            textAnchor="middle"
          >
            <textPath href="#arcPath" startOffset="50%">
              Hey there! Welcome to our blog.
            </textPath>
          </text>
        </svg>
      </div>

      <div className="subtitle">
        Learn about our products and our takes on tech.
      </div>
      <div className="title-bar">Latest</div>

      <div className="homepage-grid-container">
        <div className="homepage-grid scrollable">
          {posts.map((post) => (
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
    </div>
  );
}

export default HomePage;
