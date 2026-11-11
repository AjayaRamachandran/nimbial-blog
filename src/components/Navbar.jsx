import React, { useContext } from "react";
import "./navbar.css";
import { Sun, Monitor, Moon } from "lucide-react";
import { DarkModeContext } from "@/context/DarkModeContext";

// Thumb position on the track (left → right) and icon for each theme.
const THEME_UI = {
  light: { position: 0, Icon: Sun, label: "Light" },
  system: { position: 1, Icon: Monitor, label: "Match my device" },
  dark: { position: 2, Icon: Moon, label: "Dark" },
};

function Navbar({ page }) {
  const { theme, cycleTheme } = useContext(DarkModeContext);
  const ui = THEME_UI[theme];

  return (
    <>
      <div className="navbar">
        <a className="title" href="/">
          blog.<span className="title-domain">nimbial.com</span>
        </a>
        <div className="navbar-right">
          <button
            type="button"
            className="theme-switch"
            onClick={cycleTheme}
            aria-label={`Appearance: ${ui.label}. Click to change.`}
            title={`Appearance: ${ui.label}`}
          >
            {/* One dot per position so it's clear there are three settings */}
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="theme-dot"
                style={{ "--pos": i }}
                aria-hidden="true"
              />
            ))}
            <span
              className="theme-thumb"
              style={{ "--pos": ui.position }}
            >
              <ui.Icon size={12} strokeWidth={2.5} aria-hidden="true" />
            </span>
          </button>
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
