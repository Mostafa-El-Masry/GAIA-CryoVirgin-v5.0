"use client";

import { useEffect } from "react";
import styles from "./archive.module.css";
import JavaScriptDocumentation from "./JavaScriptDocumentation";

export default function JavaScriptRecord() {
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

      const toToggle = Array.from(s.children).filter((c) => c !== header) as
        | HTMLElement[]
        | any[];
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
            <h3 className="text-sm font-semibold mb-2">JavaScript Archive</h3>
            <nav className="text-sm leading-7">
              <ul className={`space-y-1 ${styles.sidebarList}`}>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="/apollo/archives/Records/JavaScript"
                  >
                    Overview
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="/apollo/archives/Records/JavaScript/fundamentals"
                  >
                    Fundamentals
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="/apollo/archives/Records/JavaScript/runtime"
                  >
                    Runtime
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="/apollo/archives/Records/JavaScript/functions-scope"
                  >
                    Functions & Scope
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="/apollo/archives/Records/JavaScript/objects-prototypes"
                  >
                    Objects & Prototypes
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="/apollo/archives/Records/JavaScript/async-concurrency"
                  >
                    Async & Concurrency
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="/apollo/archives/Records/JavaScript/modules-ecosystem"
                  >
                    Modules & Ecosystem
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="/apollo/archives/Records/JavaScript/performance-security"
                  >
                    Performance & Security
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="/apollo/archives/Records/JavaScript/philosophy-patterns"
                  >
                    Philosophy & Patterns
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#execution-environment"
                  >
                    Execution Environment
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#syntax-basics"
                  >
                    Syntax Basics
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#variables-declarations"
                  >
                    Variables & Declarations
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#data-types"
                  >
                    Data Types
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#type-coercion"
                  >
                    Type Coercion
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#operators"
                  >
                    Operators
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#control-flow"
                  >
                    Control Flow
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#functions"
                  >
                    Functions
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#scope-closures"
                  >
                    Scope & Closures
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#objects"
                  >
                    Objects
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#prototypes-inheritance"
                  >
                    Prototypes & Inheritance
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#classes"
                  >
                    Classes
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#arrays"
                  >
                    Arrays
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#async"
                  >
                    Asynchronous JavaScript
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#error-handling"
                  >
                    Error Handling
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#modules"
                  >
                    Modules
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#memory-management"
                  >
                    Memory Management
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#performance"
                  >
                    Performance Concepts
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#security"
                  >
                    Security Considerations
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#standards"
                  >
                    JavaScript Standards
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#tooling"
                  >
                    Tooling Ecosystem
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#philosophy"
                  >
                    JavaScript Philosophy
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#summary"
                  >
                    Summary
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
                    href="/apollo/archives/Records/JavaScript/projects"
                  >
                    Projects
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </aside>

        <main
          className={`${styles.archiveContent} prose prose-slate max-w-none mt-[-50vh]`}
        >
          <JavaScriptDocumentation />

          <section id="execution-environment">
            <h2>JavaScript Execution Environment</h2>

            <h3>Browser</h3>
            <ul>
              <li>DOM (Document Object Model)</li>
              <li>BOM (Browser Object Model)</li>
              <li>Web APIs (fetch, localStorage, canvas, etc.)</li>
            </ul>

            <h3>Server (Node.js, Bun, Deno)</h3>
            <ul>
              <li>File system access</li>
              <li>Networking</li>
              <li>Process control</li>
              <li>Event loop</li>
            </ul>
          </section>

          <section id="syntax-basics">
            <h2>Syntax Basics</h2>

            <h3>Statements & Expressions</h3>
            <ul>
              <li>Statements perform actions</li>
              <li>Expressions produce values</li>
            </ul>

            <h3>Comments</h3>
            <ul>
              <li>
                Single-line: <code>//</code>
              </li>
              <li>
                Multi-line: <code>/* */</code>
              </li>
            </ul>
          </section>

          <section id="variables-declarations">
            <h2>Variables & Declarations</h2>

            <ul>
              <li>
                <strong>var</strong> – function scoped (legacy)
              </li>
              <li>
                <strong>let</strong> – block scoped
              </li>
              <li>
                <strong>const</strong> – block scoped, immutable binding
              </li>
            </ul>

            <p>
              JavaScript uses lexical scoping. Variables declared with{" "}
              <code>let</code> and <code>const</code> exist in a temporal dead
              zone until initialized.
            </p>
          </section>

          <section id="data-types">
            <h2>Data Types</h2>

            <h3>Primitive Types</h3>
            <ul>
              <li>string</li>
              <li>number</li>
              <li>bigint</li>
              <li>boolean</li>
              <li>undefined</li>
              <li>null</li>
              <li>symbol</li>
            </ul>

            <h3>Reference Types</h3>
            <ul>
              <li>Object</li>
              <li>Array</li>
              <li>Function</li>
              <li>Date</li>
              <li>Map / Set</li>
            </ul>
          </section>

          <section id="type-coercion">
            <h2>Type Coercion</h2>
            <p>
              JavaScript automatically converts types when required. This can be
              implicit or explicit.
            </p>
            <ul>
              <li>
                Loose equality (<code>==</code>) performs coercion
              </li>
              <li>
                Strict equality (<code>===</code>) does not
              </li>
            </ul>
          </section>

          <section id="operators">
            <h2>Operators</h2>

            <h3>Arithmetic</h3>
            <p>+, -, *, /, %, **</p>

            <h3>Comparison</h3>
            <p>==, ===, !=, !==, &lt;, &gt;, &lt;=, &gt;=</p>

            <h3>Logical</h3>
            <p>&amp;&amp;, ||, !</p>

            <h3>Assignment</h3>
            <p>=, +=, -=, *=, /=</p>

            <h3>Optional Chaining & Nullish Coalescing</h3>
            <p>
              <code>?.</code> and <code>??</code>
            </p>
          </section>

          <section id="control-flow">
            <h2>Control Flow</h2>

            <h3>Conditional Statements</h3>
            <ul>
              <li>if / else</li>
              <li>switch</li>
              <li>ternary operator</li>
            </ul>

            <h3>Loops</h3>
            <ul>
              <li>for</li>
              <li>while</li>
              <li>do...while</li>
              <li>for...in</li>
              <li>for...of</li>
            </ul>
          </section>

          <section id="functions">
            <h2>Functions</h2>

            <ul>
              <li>Function declarations</li>
              <li>Function expressions</li>
              <li>Arrow functions</li>
              <li>Immediately Invoked Function Expressions (IIFE)</li>
            </ul>

            <p>
              Functions are first-class citizens: they can be passed, returned,
              and stored as values.
            </p>
          </section>

          <section id="scope-closures">
            <h2>Scope & Closures</h2>

            <p>
              Scope determines where variables are accessible. A closure occurs
              when a function retains access to its lexical scope even after the
              outer function has finished executing.
            </p>
          </section>

          <section id="objects">
            <h2>Objects</h2>

            <ul>
              <li>Object literals</li>
              <li>Properties and methods</li>
              <li>Computed properties</li>
              <li>Property descriptors</li>
            </ul>

            <p>
              Objects are collections of key–value pairs where keys are strings
              or symbols.
            </p>
          </section>

          <section id="prototypes-inheritance">
            <h2>Prototypes & Inheritance</h2>

            <p>
              JavaScript uses prototype-based inheritance. Objects can inherit
              properties and methods from other objects via the prototype chain.
            </p>

            <ul>
              <li>
                <code>Object.prototype</code>
              </li>
              <li>
                <code>__proto__</code>
              </li>
              <li>
                <code>Object.create()</code>
              </li>
            </ul>
          </section>

          <section id="classes">
            <h2>Classes</h2>

            <p>
              Classes are syntactic sugar over prototypes. They support
              constructors, instance methods, static methods, and inheritance
              via <code>extends</code>.
            </p>
          </section>

          <section id="arrays">
            <h2>Arrays</h2>

            <ul>
              <li>Indexed collections</li>
              <li>Mutable by default</li>
            </ul>

            <h3>Common Methods</h3>
            <p>
              map, filter, reduce, forEach, find, some, every, push, pop, shift,
              unshift, splice, slice
            </p>
          </section>

          <section id="async">
            <h2>Asynchronous JavaScript</h2>

            <h3>Callbacks</h3>
            <h3>Promises</h3>
            <h3>async / await</h3>

            <p>
              JavaScript handles async operations via the event loop, task
              queue, and microtask queue.
            </p>
          </section>

          <section id="error-handling">
            <h2>Error Handling</h2>

            <ul>
              <li>try / catch / finally</li>
              <li>throw</li>
              <li>Error objects</li>
              <li>Custom errors</li>
            </ul>
          </section>

          <section id="modules">
            <h2>Modules</h2>

            <ul>
              <li>ES Modules (import / export)</li>
              <li>Default exports</li>
              <li>Named exports</li>
              <li>Dynamic imports</li>
            </ul>
          </section>

          <section id="memory-management">
            <h2>Memory Management</h2>

            <p>
              JavaScript uses automatic garbage collection. Developers must
              avoid memory leaks caused by lingering references.
            </p>
          </section>

          <section id="performance">
            <h2>Performance Concepts</h2>

            <ul>
              <li>Debouncing and throttling</li>
              <li>Memoization</li>
              <li>Lazy loading</li>
              <li>Reflows and repaints</li>
            </ul>
          </section>

          <section id="security">
            <h2>Security Considerations</h2>

            <ul>
              <li>XSS (Cross-Site Scripting)</li>
              <li>CSRF</li>
              <li>Code injection</li>
              <li>Same-origin policy</li>
            </ul>
          </section>

          <section id="standards">
            <h2>JavaScript Standards</h2>

            <p>
              JavaScript is standardized by ECMAScript (ECMA-262). New versions
              are released yearly.
            </p>
          </section>

          <section id="tooling">
            <h2>Tooling Ecosystem</h2>

            <ul>
              <li>Package managers (npm, pnpm, yarn)</li>
              <li>Bundlers (Vite, Webpack, Rollup)</li>
              <li>Linters (ESLint)</li>
              <li>Formatters (Prettier)</li>
              <li>Testing (Jest, Vitest, Playwright)</li>
            </ul>
          </section>

          <section id="philosophy">
            <h2>JavaScript Philosophy</h2>

            <p>
              JavaScript prioritizes flexibility, rapid iteration, and broad
              compatibility. It supports multiple programming paradigms:
              procedural, object-oriented, and functional programming.
            </p>
          </section>

          <section id="summary">
            <h2>Summary</h2>
            <p>
              JavaScript is a versatile, evolving language that powers modern
              applications across platforms. Mastery involves understanding its
              core mechanics, asynchronous model, and runtime behavior.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}
