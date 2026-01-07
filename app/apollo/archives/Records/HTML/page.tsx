"use client";

import { useEffect } from "react";
import styles from "./archive.module.css";

export default function HTMLRecord() {
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

      // hide all sibling nodes except the header
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
        {/* LEFT SIDEBAR */}
        <aside className="hidden md:block sticky top-20 self-start md:col-start-2">
          <div
            className={`bg-white rounded-lg p-4 shadow-sm ${styles.archiveSidebar}`}
          >
            <h3 className="text-sm font-semibold mb-2">HTML Archive</h3>
            <nav className="text-sm leading-7">
              <ul className={`space-y-1 ${styles.sidebarList}`}>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#what-is-html"
                  >
                    What is HTML
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#document-root"
                  >
                    Document Root
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#doctype"
                  >
                    DOCTYPE
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#html-element"
                  >
                    html Element
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#head-element"
                  >
                    head Element
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#body-element"
                  >
                    body Element
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#metadata"
                  >
                    Metadata
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#structure-elements"
                  >
                    Structure Elements
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#text-elements"
                  >
                    Text Elements
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#media-elements"
                  >
                    Media
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#links"
                  >
                    Links
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#lists"
                  >
                    Lists
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#tables"
                  >
                    Tables
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#forms"
                  >
                    Forms
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#inputs"
                  >
                    Inputs
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#attributes"
                  >
                    Attributes
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#data-attributes"
                  >
                    Data Attributes
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#template-element"
                  >
                    Template Element
                  </a>
                </li>
                <li>
                  <a className="text-slate-700 hover:text-sky-600" href="#slot">
                    Slot (Web Components)
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#custom-elements"
                  >
                    Custom Elements
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#accessibility"
                  >
                    Accessibility
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#progressive-enhancement"
                  >
                    Progressive Enhancement
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#semantics"
                  >
                    Semantics
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#address"
                  >
                    Address
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#html-vs-jsx"
                  >
                    HTML vs JSX
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#comments"
                  >
                    Comments
                  </a>
                </li>
                <li>
                  <a className="text-slate-700 hover:text-sky-600" href="#time">
                    Time
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#html-entities"
                  >
                    HTML Entities
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#root-mounting"
                  >
                    Root &amp; Mounting
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#base-url"
                  >
                    Base URL
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#performance"
                  >
                    Performance
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="/apollo/archives/Records/CSS"
                  >
                    CSS
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="/apollo/archives/Records/JavaScript"
                  >
                    JavaScript Archive
                  </a>
                </li>
                {/* removed duplicate JavaScript link */}
              </ul>
            </nav>
          </div>
        </aside>
        {/* MAIN CONTENT */}
        <main
          className={`${styles.archiveContent} prose prose-slate max-w-none mt-[-50vh]`}
        >
          <section id="what-is-html">
            <h1>HTML</h1>
            <p>
              HTML (HyperText Markup Language) defines the structure and meaning
              of web documents — hierarchy and relationships, not presentation.
            </p>
            <pre>
              <code className={styles.codeHtml}>{`<!DOCTYPE html>`}</code>
            </pre>
            <p>HTML is the foundation every framework compiles back to.</p>
          </section>

          <section id="document-root">
            <h2>Document Root</h2>
            <pre>
              <code className={styles.codeHtml}>{`<!DOCTYPE html>
<html lang="en">
  <head></head>
  <body></body>
</html>`}</code>
            </pre>
            <p>This is the complete root of an HTML document.</p>
            <p>
              Browsers parse HTML top-down; missing structure can cause
              undefined behavior.
            </p>
          </section>

          <section id="doctype">
            <h2>DOCTYPE</h2>
            <pre>
              <code className={styles.codeHtml}>{`<!DOCTYPE html>`}</code>
            </pre>
            <p>Declares standards mode.</p>
          </section>

          <section id="html-element">
            <h2>&lt;html&gt;</h2>
            <pre>
              <code
                className={styles.codeHtml}
              >{`<html lang="en"></html>`}</code>
            </pre>
            <p>The root element wrapping the entire document.</p>
            <p>
              <code>lang</code> is important for accessibility and SEO.
            </p>
          </section>

          <section id="head-element">
            <h2>&lt;head&gt;</h2>
            <pre>
              <code className={styles.codeHtml}>{`<head>
  <meta charset="UTF-8" />
  <title>Page Title</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>`}</code>
            </pre>
            <p>Nothing visible belongs here; metadata belongs in the head.</p>
          </section>

          <section id="body-element">
            <h2>&lt;body&gt;</h2>
            <pre>
              <code className={styles.codeHtml}>{`<body>
  <h1>Hello World</h1>
</body>`}</code>
            </pre>
            <p>Contains all visible content.</p>
          </section>

          <section id="metadata">
            <h2>Metadata</h2>
            <pre>
              <code className={styles.codeHtml}>{`<meta charset="UTF-8" />
<meta name="description" content="Documentation site" />`}</code>
            </pre>
            <p>Metadata affects rendering, SEO, and sharing.</p>
          </section>

          <section id="structure-elements">
            <h2>Structure Elements</h2>

            <pre>
              <code className="code-html">{`<header></header>
<nav></nav>
<main></main>
<section></section>
<article></article>
<footer></footer>`}</code>
            </pre>

            <p>Semantic layout blocks.</p>

            <p>Semantics help machines understand intent.</p>
          </section>

          <section id="void-elements">
            <h2>Void (Self-Closing) Elements</h2>

            <pre>
              <code className="code-html">{`<img src="image.jpg" alt="Description">
<br>
<hr>
<meta charset="UTF-8">
<link rel="stylesheet" href="style.css">
<input type="text">`}</code>
            </pre>

            <p>Elements that do not have a closing tag.</p>
          </section>

          <section id="text-elements">
            <h2>Text Elements</h2>

            <pre>
              <code className="code-html">{`<h1>Heading</h1>
<p>Paragraph</p>
<span>Inline text</span>
<strong>Strong</strong>
<em>Emphasis</em>`}</code>
            </pre>
          </section>

          <section id="comments">
            <h2>Comments</h2>

            <p>Place after: Text Elements</p>

            <pre>
              <code className="code-html">{`<!-- This is an HTML comment -->`}</code>
            </pre>
          </section>

          <section id="time">
            <h2>Time</h2>

            <pre>
              <code className="code-html">{`<time datetime="2026-01-01">January 1, 2026</time>`}</code>
            </pre>
          </section>

          <section id="html-entities">
            <h2>HTML Entities</h2>

            <pre>
              <code className="code-html">{`&amp; &lt; &gt; &copy; &nbsp;`}</code>
            </pre>
          </section>

          <section id="media-elements">
            <h2>Media</h2>

            <pre>
              <code className="code-html">{`<img src="image.jpg" alt="Description" />
<video controls></video>
<audio controls></audio>`}</code>
            </pre>

            <p>
              <code>alt</code> is mandatory for accessibility.
            </p>
          </section>

          <section id="iframe">
            <h2>iframe</h2>

            <pre>
              <code className="code-html">{`<iframe src="https://example.com" loading="lazy"></iframe>`}</code>
            </pre>
          </section>

          <section id="figure-figcaption">
            <h2>Figure &amp; Figcaption</h2>

            <pre>
              <code className="code-html">{`<figure>
  <img src="image.jpg" alt="">
  <figcaption>Caption text</figcaption>
</figure>`}</code>
            </pre>
          </section>

          <section id="links">
            <h2>Links</h2>

            <pre>
              <code className="code-html">{`<a href="/about">About</a>`}</code>
            </pre>
          </section>

          <section id="script-loading">
            <h2>Script Loading &amp; Placement</h2>

            <pre>
              <code className="code-html">{`<script src="app.js"></script>
<script src="app.js" defer></script>
<script src="app.js" async></script>`}</code>
            </pre>

            <p>
              Placement affects parsing and execution; use <code>defer</code> or{" "}
              <code>async</code> when appropriate.
            </p>
          </section>

          <section id="lists">
            <h2>Lists</h2>

            <pre>
              <code className="code-html">{`<ul>
	<li>Item</li>
</ul>`}</code>
            </pre>
          </section>

          <section id="details-summary">
            <h2>Details / Summary (Native Disclosure)</h2>

            <pre>
              <code className="code-html">{`<details>
  <summary>More info</summary>
  <p>Hidden content</p>
</details>`}</code>
            </pre>
          </section>

          <section id="tables">
            <h2>Tables</h2>

            <pre>
              <code className="code-html">{`<table>
	<tr>
		<th>Name</th>
	</tr>
</table>`}</code>
            </pre>
          </section>

          <section id="forms">
            <h2>Forms</h2>

            <pre>
              <code className="code-html">{`<form>
	<input />
	<button>Submit</button>
</form>`}</code>
            </pre>

            <p>Forms existed before JavaScript.</p>
          </section>

          <section id="dialog">
            <h2>Dialog</h2>

            <pre>
              <code className="code-html">{`<dialog open>
  <p>Dialog content</p>
</dialog>`}</code>
            </pre>
          </section>

          <section id="inputs">
            <h2>Inputs</h2>

            <pre>
              <code className="code-html">{`<input type="text" />
<input type="email" />
<input type="password" />`}</code>
            </pre>
          </section>

          <section id="attributes">
            <h2>Attributes</h2>

            <pre>
              <code className="code-html">{`<div id="app" class="container"></div>`}</code>
            </pre>
          </section>

          <section id="data-attributes">
            <h2>Data Attributes</h2>

            <pre>
              <code className="code-html">{`<div data-user-id="42"></div>`}</code>
            </pre>

            <p>Safe bridge between HTML and JS.</p>
          </section>

          <section id="template-element">
            <h2>Template Element</h2>

            <pre>
              <code className="code-html">{`<template id="card-template">
  <div class="card">
    <h3></h3>
    <p></p>
  </div>
</template>`}</code>
            </pre>
          </section>

          <section id="slot">
            <h2>Slot (Web Components)</h2>

            <pre>
              <code className="code-html">{`<slot name="header"></slot>`}</code>
            </pre>
          </section>

          <section id="accessibility">
            <h2>Accessibility</h2>

            <pre>
              <code className="code-html">{`<button aria-label="Close"></button>`}</code>
            </pre>
          </section>

          <section id="progressive-enhancement">
            <h2>Progressive Enhancement Markers</h2>

            <pre>
              <code className="code-html">{`<main role="main"></main>`}</code>
            </pre>
          </section>

          <section id="semantics">
            <h2>Semantics</h2>

            <p>Semantics describe meaning, not appearance.</p>
          </section>

          <section id="address">
            <h2>Address</h2>

            <pre>
              <code className="code-html">{`<address>
  Written by Someone<br>
  example@email.com
</address>`}</code>
            </pre>
          </section>

          <section id="html-vs-jsx">
            <h2>HTML vs JSX</h2>

            <pre>
              <code className="code-html">{`<!-- HTML -->
<input class="box" />`}</code>
            </pre>

            <pre>
              <code className="code-html">{`{/* JSX */}
<input className="box" />`}</code>
            </pre>

            <p>JSX is JavaScript, not HTML.</p>
          </section>

          <section id="base-url">
            <h2>Base URL</h2>

            <pre>
              <code className="code-html">{`<base href="https://example.com/">`}</code>
            </pre>
          </section>

          <section id="style-injection">
            <h2>Style Injection (Inline &amp; Internal CSS)</h2>

            <pre>
              <code className="code-html">{`<style>
  body {
    background: black;
    color: white;
  }
</style>`}</code>
            </pre>

            <p>
              Inline and internal styles affect only the document context
              they're placed in.
            </p>
          </section>

          <section id="print-media-queries">
            <h2>Print / Media Queries Hook</h2>

            <pre>
              <code className="code-html">{`<link rel="stylesheet" media="print" href="print.css">`}</code>
            </pre>
          </section>

          <section id="root-mounting">
            <h2>Root &amp; Mounting</h2>

            <pre>
              <code className="code-html">{`<div id="root"></div>`}</code>
            </pre>

            <pre>
              <code className="code-html">{`ReactDOM.createRoot(document.getElementById('root'))`}</code>
            </pre>

            <p>The root element is required for mounting frameworks.</p>

            <p>Pure HTML does not need a root div.</p>
          </section>

          <section id="custom-elements">
            <h2>Custom Elements (Web Components)</h2>

            <pre>
              <code className="code-html">{`<user-card></user-card>`}</code>
            </pre>
          </section>

          <section id="performance">
            <h2>Performance</h2>

            <p>
              Clean HTML improves loading, SEO, accessibility, and hydration.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}
