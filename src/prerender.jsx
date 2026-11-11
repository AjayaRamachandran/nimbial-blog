// Build-time only: renders a blog post page to static HTML so search engines
// and AI tools can read the article without running JavaScript.
// Used by scripts/generate-og-pages.mjs; never shipped to the browser.
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { DarkModeProvider } from "@/context/DarkModeContext";
import BlogPost from "@/pages/BlogPost";

export function renderPostPage({ slug, meta, markdown }) {
  return renderToStaticMarkup(
    <DarkModeProvider>
      <MemoryRouter initialEntries={[`/pages/${slug}`]}>
        <Routes>
          <Route
            path="/pages/:name"
            element={<BlogPost initialPost={{ slug, meta, markdown }} />}
          />
        </Routes>
      </MemoryRouter>
    </DarkModeProvider>,
  );
}
