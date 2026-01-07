"use client";

import { useEffect } from "react";
import styles from "./archive.module.css";
import CSSContent from "./content";

export default function CSSRecord() {
  useEffect(() => {
    const main =
      document.querySelector(`main.${styles.archiveContent}`) ||
      document.querySelector("main");
    if (!main) return;

    const sections = Array.from(main.querySelectorAll("section"));
    const listeners: Array<() => void> = [];

    sections.forEach((s) => {
      const header = s.querySelector(
        "h1, h2, h3, h4, h5, h6"
      ) as HTMLElement | null;
      if (!header) return;

      const toToggle = Array.from(s.children).filter(
        (c) => c !== header
      ) as HTMLElement[];
      toToggle.forEach((el) => (el.style.display = "none"));
      header.setAttribute("role", "button");
      header.setAttribute("tabindex", "0");
      header.setAttribute("aria-expanded", "false");
      header.style.cursor = "pointer";

      const toggle = () => {
        const expanded = header.getAttribute("aria-expanded") === "true";
        if (expanded) {
          header.setAttribute("aria-expanded", "false");
          toToggle.forEach((el) => (el.style.display = "none"));
        } else {
          header.setAttribute("aria-expanded", "true");
          toToggle.forEach((el) => (el.style.display = ""));
        }
      };

      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      };

      header.addEventListener("click", toggle);
      header.addEventListener("keydown", onKey);

      listeners.push(() => {
        header.removeEventListener("click", toggle);
        header.removeEventListener("keydown", onKey);
      });
    });

    return () => listeners.forEach((fn) => fn());
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mt-12 md:mt-16">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8">
        <aside className="hidden md:block sticky top-20 self-start md:col-start-2">
          <div
            className={`bg-white rounded-lg p-4 shadow-sm ${styles.archiveSidebar}`}
          >
            <h3 className="text-sm font-semibold mb-2">CSS Archive</h3>
            <nav className="text-sm leading-7">
              <ul className={`space-y-1 ${styles.sidebarList}`}>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#what-is-css"
                  >
                    What is CSS
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#css-delivery"
                  >
                    CSS Delivery
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#css-syntax"
                  >
                    Syntax
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#selectors"
                  >
                    Selectors
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#pseudo-classes"
                  >
                    Pseudo-Classes
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#pseudo-elements"
                  >
                    Pseudo-Elements
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#specificity"
                  >
                    Specificity
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#units"
                  >
                    Units
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#colors"
                  >
                    Colors
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#box-model"
                  >
                    Box Model
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </aside>

        <main
          className={`${styles.archiveContent} prose prose-slate max-w-none mt-[-40vh]`}
        >
          <CSSContent />
        </main>
      </div>
    </div>
  );
}
