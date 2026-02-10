import React, { useState } from "react";
import "./navbar.css";

function Navbar({ page }) {
  const [isDark, setIsDark] = useState(() => {
    const v = localStorage.getItem("darkMode");
    return v === "on";
  });

  const toggleDarkMode = () => {
    const next = isDark ? "off" : "on";
    localStorage.setItem("darkMode", next);
    setIsDark(next === "on");
    window.location.reload();
  };

  return (
    <>
      <div className="navbar">
        <a className="title" href="/">
          blog.nimbial.com
        </a>
        <div className="navbar-right">
          <label className="dm-switch" aria-label="Toggle dark mode">
            <input type="checkbox" checked={isDark} onChange={toggleDarkMode} />
            <span className="dm-slider"></span>
          </label>
          <a href="https://www.nimbial.com">
            <img
              src="/assets/favicon.svg"
              width="25"
              style={{ borderRadius: "7px", outline: "1.5px solid var(--text-color)", outlineOffset: "-1px", marginTop: "3px" }}
            ></img>
          </a>
        </div>
      </div>
    </>
  );
}

export default Navbar;
