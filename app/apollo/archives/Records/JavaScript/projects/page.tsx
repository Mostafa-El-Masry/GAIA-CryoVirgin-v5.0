"use client";

import styles from "../archive.module.css";

export default function JSProjectsArchive() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mt-12 md:mt-16">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8">
        <aside className="hidden md:block sticky top-20 self-start md:col-start-2">
          <div
            className={`bg-white rounded-lg p-4 shadow-sm ${styles.archiveSidebar}`}
          >
            <h3 className="text-sm font-semibold mb-2">JS Projects</h3>
            <nav className="text-sm leading-7">
              <ul className={`space-y-2 ${styles.sidebarList}`}>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#level-1"
                  >
                    LEVEL 1 — Core JavaScript Basics
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#level-2"
                  >
                    LEVEL 2 — DOM Mastery
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#level-3"
                  >
                    LEVEL 3 — State & Logic
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#level-4"
                  >
                    LEVEL 4 — Advanced JavaScript
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#level-5"
                  >
                    LEVEL 5 — Real-World Systems
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-sky-600"
                    href="#checkpoints"
                  >
                    Checkpoints
                  </a>
                </li>
                <li>
                  <a className="text-slate-700 hover:text-sky-600" href="#map">
                    Concept Map
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </aside>

        <main
          className={`prose prose-slate max-w-none mt-[-35vh] md:col-start-1 self-start`}
        >
          <section id="level-1">
            <h1>🟢 LEVEL 1 — Core JavaScript Basics (1–20)</h1>
            <ul>
              <li>Counter App — variables, events, DOM update</li>
              <li>Click Tracker — event listeners</li>
              <li>Color Changer — conditionals, style manipulation</li>
              <li>Temperature Converter — functions, math</li>
              <li>Character Counter — input events</li>
              <li>Random Quote Generator — arrays, Math.random</li>
              <li>Show / Hide Toggle — boolean state</li>
              <li>Digital Clock — Date object, intervals</li>
              <li>Simple Calculator — operators, functions</li>
              <li>Image Switcher — DOM attributes</li>
              <li>Light/Dark Mode — classList</li>
              <li>Form Validator — conditionals, regex</li>
              <li>Password Strength Checker — string logic</li>
              <li>Number Guessing Game — loops, comparisons</li>
              <li>Tip Calculator — input parsing</li>
              <li>Word Reverser — string methods</li>
              <li>Random Background Generator — arrays</li>
              <li>Click Speed Test — timestamps</li>
              <li>BMI Calculator — math + DOM</li>
              <li>Progress Bar — percentages, style width</li>
            </ul>
          </section>

          <section id="level-2">
            <h2>🟡 LEVEL 2 — DOM Mastery (21–40)</h2>
            <ul>
              <li>To-Do List — CRUD, DOM creation</li>
              <li>Editable To-Do — contentEditable</li>
              <li>Modal Popup — event bubbling</li>
              <li>Tabs Component — active state</li>
              <li>Accordion — toggle logic</li>
              <li>Dropdown Menu — click outside detection</li>
              <li>Tooltip System — mouse events</li>
              <li>Image Carousel — index tracking</li>
              <li>Pagination UI — slicing arrays</li>
              <li>Search Filter — array filtering</li>
              <li>Sortable List — compare functions</li>
              <li>Multi-Step Form — state handling</li>
              <li>Toast Notifications — dynamic DOM cleanup</li>
              <li>Countdown Timer — intervals</li>
              <li>Star Rating Component — hover + click</li>
              <li>Sticky Navbar — scroll events</li>
              <li>Scroll Progress Indicator — window scroll</li>
              <li>Infinite Scroll — intersection logic</li>
              <li>Drag & Drop List — mouse events</li>
              <li>Keyboard Shortcut Handler — key events</li>
            </ul>
          </section>

          <section id="level-3">
            <h2>🟠 LEVEL 3 — State & Logic (41–60)</h2>
            <ul>
              <li>Memory Card Game — state comparison</li>
              <li>Tic-Tac-Toe — game logic</li>
              <li>Rock Paper Scissors — rules engine</li>
              <li>Quiz App — score tracking</li>
              <li>Expense Tracker — data aggregation</li>
              <li>Notes App — localStorage</li>
              <li>Habit Tracker — streak logic</li>
              <li>Stopwatch — precise timing</li>
              <li>Pomodoro Timer — state machine</li>
              <li>Shopping Cart — quantity + totals</li>
              <li>Currency Converter — API + math</li>
              <li>Weather App — async fetch</li>
              <li>Movie Search — debouncing</li>
              <li>Recipe Finder — API mapping</li>
              <li>Password Generator — randomness</li>
              <li>File Upload Preview — File API</li>
              <li>Markdown Previewer — parsing</li>
              <li>Emoji Picker — filtering data</li>
              <li>Virtual Keyboard — key mapping</li>
              <li>Theme Builder — dynamic CSS vars</li>
            </ul>
          </section>

          <section id="level-4">
            <h2>🔵 LEVEL 4 — Advanced JavaScript (61–80)</h2>
            <ul>
              <li>Custom Modal Library — reusable functions</li>
              <li>Custom Carousel Engine — abstraction</li>
              <li>Form Builder — schema-driven UI</li>
              <li>Router (SPA) — history API</li>
              <li>State Manager — centralized state</li>
              <li>Event Bus System — pub/sub</li>
              <li>Data Table — sorting, filtering</li>
              <li>Chart Builder — canvas/SVG</li>
              <li>Pagination Engine — reusable logic</li>
              <li>Custom Select Component — accessibility</li>
              <li>Virtual DOM (mini) — diff logic</li>
              <li>Infinite Calendar — date math</li>
              <li>Auth UI Flow — state guarding</li>
              <li>Debounce & Throttle Utility — timing control</li>
              <li>Validation Library — reusable rules</li>
              <li>Command Palette — fuzzy search</li>
              <li>Drag-Resize Panels — pointer events</li>
              <li>Notification System — queue handling</li>
              <li>Offline Detector — navigator APIs</li>
              <li>Undo / Redo System — history stack</li>
            </ul>
          </section>

          <section id="level-5">
            <h2>🔴 LEVEL 5 — Real-World Systems (81–100)</h2>
            <ul>
              <li>Full Notes App — CRUD + storage</li>
              <li>Task Manager — priorities, filters</li>
              <li>Expense Dashboard — charts + logic</li>
              <li>Password Manager UI — encryption basics</li>
              <li>File Explorer UI — tree structure</li>
              <li>Kanban Board — drag state</li>
              <li>Chat UI — async simulation</li>
              <li>Blog CMS UI — editor logic</li>
              <li>Dashboard Layout Engine — dynamic grid</li>
              <li>Multi-Language App — i18n logic</li>
              <li>Role-Based UI — permissions</li>
              <li>Settings Panel System — persistent config</li>
              <li>Resume Builder — form → layout</li>
              <li>Booking System UI — availability logic</li>
              <li>Form Analytics Tool — input tracking</li>
              <li>Browser Game — physics + loop</li>
              <li>Code Editor (Mini) — syntax highlight</li>
              <li>Website Builder — section management</li>
              <li>Personal Knowledge Base — search + tags</li>
              <li>Vanilla JS Framework — components + state + routing</li>
            </ul>
          </section>

          <section id="checkpoints">
            <h2>✅ Checkpoints</h2>
            <ul>
              <li>Checkpoint 1 — DOM Control</li>
              <li>Checkpoint 2 — Logic & State Thinking</li>
              <li>Checkpoint 3 — Async & Real-World Behavior</li>
              <li>Checkpoint 4 — Architecture Thinking</li>
            </ul>
          </section>

          <section id="map">
            <h2>2️⃣ Project → JavaScript Concept Mastery Map</h2>
            <p>
              The levels and checkpoints map concepts you master as you complete
              projects.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}
