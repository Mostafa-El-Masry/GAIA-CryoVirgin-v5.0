import styles from "./archive.module.css";

export default function CSSContent() {
  return (
    <>
      {/* =========================
          WHAT IS CSS
      ========================= */}
      <section id="what-is-css">
        <h1>CSS</h1>

        <p>
          CSS (Cascading Style Sheets) controls presentation: layout, spacing,
          color, typography, responsiveness, and motion.
        </p>

        <p>HTML defines structure. CSS defines perception.</p>
      </section>

      {/* =========================
          TAILWIND COLORS (VISUAL)
      ========================= */}
      <section id="tailwind-colors">
        <h2>Tailwind Colors</h2>

        <div className="space-y-6">
          {[
            "slate",
            "gray",
            "zinc",
            "neutral",
            "stone",
            "red",
            "orange",
            "amber",
            "yellow",
            "lime",
            "green",
            "emerald",
            "teal",
            "cyan",
            "sky",
            "blue",
            "indigo",
            "violet",
            "purple",
            "fuchsia",
            "pink",
            "rose",
          ].map((family) => (
            <div key={family}>
              <h3 className="mb-2 capitalize">{family}</h3>
              <div className="flex overflow-hidden rounded-lg border border-slate-700">
                <div className="w-16 h-16 text-black flex items-center justify-center text-xs bg-[var(--tw-color-50)]">
                  50
                </div>
                <div className="w-16 h-16 text-black flex items-center justify-center text-xs bg-[var(--tw-color-100)]">
                  100
                </div>
                <div className="w-16 h-16 text-black flex items-center justify-center text-xs bg-[var(--tw-color-200)]">
                  200
                </div>
                <div className="w-16 h-16 text-black flex items-center justify-center text-xs bg-[var(--tw-color-300)]">
                  300
                </div>
                <div className="w-16 h-16 text-black flex items-center justify-center text-xs bg-[var(--tw-color-400)]">
                  400
                </div>
                <div className="w-16 h-16 text-white flex items-center justify-center text-xs bg-[var(--tw-color-500)]">
                  500
                </div>
                <div className="w-16 h-16 text-white flex items-center justify-center text-xs bg-[var(--tw-color-600)]">
                  600
                </div>
                <div className="w-16 h-16 text-white flex items-center justify-center text-xs bg-[var(--tw-color-700)]">
                  700
                </div>
                <div className="w-16 h-16 text-white flex items-center justify-center text-xs bg-[var(--tw-color-800)]">
                  800
                </div>
                <div className="w-16 h-16 text-white flex items-center justify-center text-xs bg-[var(--tw-color-900)]">
                  900
                </div>
                <div className="w-16 h-16 text-white flex items-center justify-center text-xs bg-[var(--tw-color-950)]">
                  950
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================
          TAILWIND GRADIENTS
      ========================= */}
      <section id="tailwind-gradients">
        <h2>Gradients</h2>

        <div className="space-y-4">
          <div className="h-16 rounded-lg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
          <div className="h-16 rounded-lg bg-gradient-to-r from-green-400 to-emerald-600"></div>
          <div className="h-16 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-600"></div>
          <div className="h-16 rounded-lg bg-gradient-to-r from-slate-700 to-slate-900"></div>
        </div>
      </section>

      {/* =========================
          TAILWIND TYPOGRAPHY
      ========================= */}
      <section id="tailwind-typography">
        <h2>Typography Scale</h2>

        <div className="space-y-3">
          <p className="text-xs">text-xs</p>
          <p className="text-sm">text-sm</p>
          <p className="text-base">text-base</p>
          <p className="text-lg">text-lg</p>
          <p className="text-xl">text-xl</p>
          <p className="text-2xl">text-2xl</p>
          <p className="text-3xl">text-3xl</p>
          <p className="text-4xl">text-4xl</p>
          <p className="text-5xl">text-5xl</p>
          <p className="text-6xl">text-6xl</p>
          <p className="text-7xl">text-7xl</p>
          <p className="text-8xl">text-8xl</p>
          <p className="text-9xl">text-9xl</p>
        </div>
      </section>

      {/* =========================
          TAILWIND FONT WEIGHT
      ========================= */}
      <section id="tailwind-font-weight">
        <h3>Font Weight</h3>

        <div className="space-y-2">
          <p className="font-thin">font-thin</p>
          <p className="font-light">font-light</p>
          <p className="font-normal">font-normal</p>
          <p className="font-medium">font-medium</p>
          <p className="font-semibold">font-semibold</p>
          <p className="font-bold">font-bold</p>
          <p className="font-extrabold">font-extrabold</p>
          <p className="font-black">font-black</p>
        </div>
      </section>

      {/* =========================
          TAILWIND GRID EXAMPLES
      ========================= */}
      <section id="tailwind-grid-examples">
        <h2>Grid Examples</h2>

        <h3 className="mt-6 mb-2">Equal Columns</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-700 p-4">1</div>
          <div className="bg-slate-700 p-4">2</div>
          <div className="bg-slate-700 p-4">3</div>
        </div>

        <h3 className="mt-6 mb-2">Spanning Columns</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-2 bg-blue-600 p-4">col-span-2</div>
          <div className="bg-blue-700 p-4">1</div>
          <div className="bg-blue-700 p-4">2</div>
        </div>

        <h3 className="mt-6 mb-2">Responsive Grid</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-emerald-600 p-4">A</div>
          <div className="bg-emerald-600 p-4">B</div>
          <div className="bg-emerald-600 p-4">C</div>
          <div className="bg-emerald-600 p-4">D</div>
        </div>
      </section>

      {/* =========================
          TAILWIND FLEXBOX
      ========================= */}
      <section id="tailwind-flexbox">
        <h2>Flexbox</h2>

        <h3 className="mt-4 mb-2">Row (default)</h3>
        <div className="flex gap-4">
          <div className="bg-slate-700 p-4">1</div>
          <div className="bg-slate-700 p-4">2</div>
          <div className="bg-slate-700 p-4">3</div>
        </div>

        <h3 className="mt-6 mb-2">Column</h3>
        <div className="flex flex-col gap-4">
          <div className="bg-slate-700 p-4">A</div>
          <div className="bg-slate-700 p-4">B</div>
          <div className="bg-slate-700 p-4">C</div>
        </div>

        <h3 className="mt-6 mb-2">Justify & Align</h3>
        <div className="flex justify-between items-center bg-slate-800 p-4">
          <div className="bg-blue-600 p-3">Left</div>
          <div className="bg-blue-600 p-3">Center</div>
          <div className="bg-blue-600 p-3">Right</div>
        </div>
      </section>

      {/* =========================
          RESPONSIVE BREAKPOINTS
      ========================= */}
      <section id="tailwind-responsive">
        <h2>Responsive Breakpoints</h2>

        <div className="p-6 text-center rounded-lg bg-red-500 sm:bg-orange-500 md:bg-yellow-500 lg:bg-green-500 xl:bg-blue-500 2xl:bg-purple-500">
          Resize screen to see breakpoint change
        </div>
        <p className="mt-4 text-sm opacity-70">
          Default breakpoints: sm, md, lg, xl, 2xl
        </p>
      </section>

      {/* =========================
          DARK MODE
      ========================= */}
      <section id="tailwind-dark-mode">
        <h2>Dark Mode</h2>
        <div className="p-6 rounded-lg bg-white text-black dark:bg-slate-900 dark:text-white">
          <p>This box changes with dark mode.</p>
          <p className="text-sm opacity-70">
            Uses <code>dark:</code> variant
          </p>
        </div>
      </section>

      {/* =========================
          TRANSITIONS + ANIMATIONS
      ========================= */}
      <section id="tailwind-transitions">
        <h2>Transitions</h2>
        <button className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-800 transition duration-300 ease-in-out">
          Hover me
        </button>
      </section>

      <section id="tailwind-animations">
        <h2>Animations</h2>
        <div className="flex gap-6 items-center">
          <div className="w-12 h-12 bg-emerald-500 animate-bounce rounded-lg"></div>
          <div className="w-12 h-12 bg-blue-500 animate-pulse rounded-lg"></div>
          <div className="w-12 h-12 bg-purple-500 animate-spin rounded-lg"></div>
        </div>
      </section>

      {/* =========================
          CSS DELIVERY (JSX)
      ========================= */}
      <section id="css-delivery">
        <h2>CSS Delivery Methods (IGAIA)</h2>

        <pre>
          <code className={styles.codeCss}>{`/* External CSS */
<link rel="stylesheet" href="/styles.css" />

/* Tailwind */
className="p-4 text-lg bg-slate-900"`}</code>
        </pre>

        <p>External CSS and Tailwind both compile to CSS.</p>
      </section>

      {/* =========================
          BASIC SYNTAX
      ========================= */}
      <section id="css-syntax">
        <h2>CSS Syntax</h2>

        <pre>
          <code className={styles.codeCss}>{`selector {
  property: value;
}`}</code>
        </pre>
      </section>

      {/* =========================
          SELECTORS
      ========================= */}
      <section id="selectors">
        <h2>Selectors</h2>

        <pre>
          <code className={styles.codeCss}>{`/* Element */
div {}

/* Class */
.card {}

/* ID */
#root {}

/* Attribute */
input[type="text"] {}

/* Descendant */
div p {}

/* Child */
ul > li {}

/* Adjacent sibling */
h1 + p {}

/* General sibling */
h1 ~ p {}`}</code>
        </pre>

        <h3>✅ GAP — FULL EXPLICIT</h3>
        <div className={styles.spacingGrid} aria-hidden>
          {[
            "gap-0",
            "gap-0.5",
            "gap-1",
            "gap-1.5",
            "gap-2",
            "gap-2.5",
            "gap-3",
            "gap-3.5",
            "gap-4",
            "gap-5",
            "gap-6",
            "gap-7",
            "gap-8",
            "gap-9",
            "gap-10",
            "gap-11",
            "gap-12",
            "gap-14",
            "gap-16",
            "gap-20",
            "gap-24",
            "gap-28",
            "gap-32",
            "gap-36",
            "gap-40",
            "gap-44",
            "gap-48",
            "gap-52",
            "gap-56",
            "gap-60",
            "gap-64",
            "gap-72",
            "gap-80",
            "gap-96",
          ].map((s) => (
            <span key={s} className={styles.spacingItem}>
              {s}
            </span>
          ))}
        </div>

        <h3>✅ BORDER RADIUS — FULL</h3>
        <div className={styles.spacingGrid} aria-hidden>
          {[
            "rounded-none",
            "rounded-sm",
            "rounded",
            "rounded-md",
            "rounded-lg",
            "rounded-xl",
            "rounded-2xl",
            "rounded-3xl",
            "rounded-full",
          ].map((s) => (
            <span key={s} className={styles.spacingItem}>
              {s}
            </span>
          ))}
        </div>

        <h3>✅ SHADOW — FULL</h3>
        <div className={styles.spacingGrid} aria-hidden>
          {[
            "shadow-none",
            "shadow-sm",
            "shadow",
            "shadow-md",
            "shadow-lg",
            "shadow-xl",
            "shadow-2xl",
          ].map((s) => (
            <span key={s} className={styles.spacingItem}>
              {s}
            </span>
          ))}
        </div>
      </section>

      {/* =========================
          PSEUDO-CLASSES
      ========================= */}
      <section id="pseudo-classes">
        <h2>Pseudo-Classes</h2>

        <pre>
          <h3>Margins</h3>
          <div className={styles.spacingGrid} aria-hidden>
            {[
              "m-0",
              "m-0.5",
              "m-1",
              "m-1.5",
              "m-2",
              "m-2.5",
              "m-3",
              "m-3.5",
              "m-4",
              "m-5",
              "m-6",
              "m-7",
              "m-8",
              "m-9",
              "m-10",
              "m-11",
              "m-12",
              "m-14",
              "m-16",
              "m-20",
              "m-24",
              "m-28",
              "m-32",
              "m-36",
              "m-40",
              "m-44",
              "m-48",
              "m-52",
              "m-56",
              "m-60",
              "m-64",
              "m-72",
              "m-80",
              "m-96",
            ].map((s) => (
              <span key={s} className={styles.spacingItem}>
                {s}
              </span>
            ))}
          </div>

          <h3>Paddings</h3>
          <div className={styles.spacingGrid} aria-hidden>
            {[
              "p-0",
              "p-0.5",
              "p-1",
              "p-1.5",
              "p-2",
              "p-2.5",
              "p-3",
              "p-3.5",
              "p-4",
              "p-5",
              "p-6",
              "p-7",
              "p-8",
              "p-9",
              "p-10",
              "p-11",
              "p-12",
              "p-14",
              "p-16",
              "p-20",
              "p-24",
              "p-28",
              "p-32",
              "p-36",
              "p-40",
              "p-44",
              "p-48",
              "p-52",
              "p-56",
              "p-60",
              "p-64",
              "p-72",
              "p-80",
              "p-96",
            ].map((s) => (
              <span key={s} className={styles.spacingItem}>
                {s}
              </span>
            ))}
          </div>

          <h3>Axis utilities (mx / my)</h3>
          <div className={styles.spacingGrid} aria-hidden>
            {[
              "mx-0",
              "mx-0.5",
              "mx-1",
              "mx-1.5",
              "mx-2",
              "mx-2.5",
              "mx-3",
              "mx-3.5",
              "mx-4",
              "mx-5",
              "mx-6",
              "mx-7",
              "mx-8",
              "mx-9",
              "mx-10",
              "mx-11",
              "mx-12",
              "mx-14",
              "mx-16",
              "mx-20",
              "mx-24",
              "mx-28",
              "mx-32",
              "mx-36",
              "mx-40",
              "mx-44",
              "mx-48",
              "mx-52",
              "mx-56",
              "mx-60",
              "mx-64",
              "mx-72",
              "mx-80",
              "mx-96",
            ].map((s) => (
              <span key={s} className={styles.spacingItem}>
                {s}
              </span>
            ))}
          </div>

          <div className={styles.spacingGrid} aria-hidden>
            {[
              "my-0",
              "my-0.5",
              "my-1",
              "my-1.5",
              "my-2",
              "my-2.5",
              "my-3",
              "my-3.5",
              "my-4",
              "my-5",
              "my-6",
              "my-7",
              "my-8",
              "my-9",
              "my-10",
              "my-11",
              "my-12",
              "my-14",
              "my-16",
              "my-20",
              "my-24",
              "my-28",
              "my-32",
              "my-36",
              "my-40",
              "my-44",
              "my-48",
              "my-52",
              "my-56",
              "my-60",
              "my-64",
              "my-72",
              "my-80",
              "my-96",
            ].map((s) => (
              <span key={s} className={styles.spacingItem}>
                {s}
              </span>
            ))}
          </div>

          <h3>Width utilities</h3>
          <div className={styles.spacingGrid} aria-hidden>
            {[
              "w-0",
              "w-0.5",
              "w-1",
              "w-1.5",
              "w-2",
              "w-2.5",
              "w-3",
              "w-3.5",
              "w-4",
              "w-5",
              "w-6",
              "w-7",
              "w-8",
              "w-9",
              "w-10",
              "w-11",
              "w-12",
              "w-14",
              "w-16",
              "w-20",
              "w-24",
              "w-28",
              "w-32",
              "w-36",
              "w-40",
              "w-44",
              "w-48",
              "w-52",
              "w-56",
              "w-60",
              "w-64",
              "w-72",
              "w-80",
              "w-96",
              "w-auto",
              "w-full",
              "w-screen",
              "w-min",
              "w-max",
              "w-fit",
            ].map((s) => (
              <span key={s} className={styles.spacingItem}>
                {s}
              </span>
            ))}
          </div>

          <h3>Height utilities</h3>
          <div className={styles.spacingGrid} aria-hidden>
            {[
              "h-0",
              "h-0.5",
              "h-1",
              "h-1.5",
              "h-2",
              "h-2.5",
              "h-3",
              "h-3.5",
              "h-4",
              "h-5",
              "h-6",
              "h-7",
              "h-8",
              "h-9",
              "h-10",
              "h-11",
              "h-12",
              "h-14",
              "h-16",
              "h-20",
              "h-24",
              "h-28",
              "h-32",
              "h-36",
              "h-40",
              "h-44",
              "h-48",
              "h-52",
              "h-56",
              "h-60",
              "h-64",
              "h-72",
              "h-80",
              "h-96",
              "h-auto",
              "h-full",
              "h-screen",
              "h-min",
              "h-max",
              "h-fit",
            ].map((s) => (
              <span key={s} className={styles.spacingItem}>
                {s}
              </span>
            ))}
          </div>

          <h3>Gap utilities</h3>
          <div className={styles.spacingGrid} aria-hidden>
            {[
              "gap-0",
              "gap-0.5",
              "gap-1",
              "gap-1.5",
              "gap-2",
              "gap-2.5",
              "gap-3",
              "gap-3.5",
              "gap-4",
              "gap-5",
              "gap-6",
              "gap-7",
              "gap-8",
              "gap-9",
              "gap-10",
              "gap-11",
              "gap-12",
              "gap-14",
              "gap-16",
              "gap-20",
              "gap-24",
              "gap-28",
              "gap-32",
              "gap-36",
              "gap-40",
              "gap-44",
              "gap-48",
              "gap-52",
              "gap-56",
              "gap-60",
              "gap-64",
              "gap-72",
              "gap-80",
              "gap-96",
            ].map((s) => (
              <span key={s} className={styles.spacingItem}>
                {s}
              </span>
            ))}
          </div>

          <code className={styles.codeCss}>{`:hover
:active
:focus
:visited
:link
:first-child
:last-child
:nth-child(n)
:not(selector)`}</code>
        </pre>
      </section>

      {/* =========================
          PSEUDO-ELEMENTS
      ========================= */}
      <section id="pseudo-elements">
        <h2>Pseudo-Elements</h2>

        <pre>
          <code className={styles.codeCss}>{`::before
::after
::first-letter
::first-line
::selection`}</code>
        </pre>
      </section>

      {/* =========================
          SPECIFICITY
      ========================= */}
      <section id="specificity">
        <h2>Specificity (Lowest → Highest)</h2>

        <pre>
          <code className={styles.codeCss}>{`* {}
div {}
.card {}
[type="text"] {}
:hover {}
#root {}
!important`}</code>
        </pre>

        <p>
          <strong>Rule:</strong> Inline styles are not used in IGAIA.
        </p>
      </section>

      {/* =========================
          UNITS
      ========================= */}
      <section id="units">
        <h2>Units</h2>

        <pre>
          <code className={styles.codeCss}>{`px
%
em
rem
vw
vh
vmin
vmax
ch`}</code>
        </pre>
      </section>

      {/* =========================
          COLORS
      ========================= */}
      <section id="colors">
        <h2>Colors</h2>

        <pre>
          <code className={styles.codeCss}>{`#ff0000
rgb(255,0,0)
rgba(255,0,0,0.5)
hsl(0,100%,50%)
hsla(0,100%,50%,0.5)`}</code>
        </pre>
      </section>

      {/* =========================
          BOX MODEL
      ========================= */}
      <section id="box-model">
        <h2>Box Model</h2>

        <pre>
          <code className={styles.codeCss}>{`margin
border
padding
width
height
box-sizing: border-box`}</code>
        </pre>
      </section>

      {/* =========================
          LAYOUT
      ========================= */}
      <section id="layout">
        <h2>Layout</h2>

        <pre>
          <code className={styles.codeCss}>{`display: block;
display: flex;
display: grid;

position: relative;
position: absolute;
position: fixed;
position: sticky;`}</code>
        </pre>
      </section>

      {/* =========================
          FLEXBOX
      ========================= */}
      <section id="flexbox">
        <h2>Flexbox</h2>

        <pre>
          <code className={styles.codeCss}>{`display: flex;
flex-direction
justify-content
align-items
gap
flex-wrap
flex-grow`}</code>
        </pre>
      </section>

      {/* =========================
          GRID
      ========================= */}
      <section id="grid">
        <h2>Grid</h2>

        <pre>
          <code className={styles.codeCss}>{`display: grid;
grid-template-columns
grid-template-rows
gap
grid-column
grid-row`}</code>
        </pre>
      </section>

      {/* =========================
          TYPOGRAPHY
      ========================= */}
      <section id="typography">
        <h2>Typography</h2>

        <pre>
          <code className={styles.codeCss}>{`font-family
font-size
font-weight
line-height
letter-spacing
text-align`}</code>
        </pre>
      </section>

      {/* =========================
          MEDIA QUERIES
      ========================= */}
      <section id="media-queries">
        <h2>Media Queries</h2>

        <pre>
          <code className={styles.codeCss}>{`@media (max-width: 768px) {
  body {}
}`}</code>
        </pre>
      </section>

      {/* =========================
          CSS VARIABLES
      ========================= */}
      <section id="css-variables">
        <h2>CSS Variables</h2>

        <pre>
          <code className={styles.codeCss}>{`:root {
  --primary: #0ea5e9;
}

color: var(--primary);`}</code>
        </pre>
      </section>

      {/* =========================
          TAILWIND CSS
      ========================= */}
      <section id="tailwind">
        <h2>Tailwind CSS (Latest)</h2>

        <pre>
          <code className={styles.codeCss}>{`/* Spacing */
m-0 → m-96
p-0 → p-96
mx-* my-* mt-* mb-* ml-* mr-*

/* Flex */
flex flex-row flex-col items-start items-center items-end
justify-start justify-center justify-between justify-end

/* Text */
text-xs text-sm text-base text-lg text-xl
text-2xl → text-9xl

/* Font */
font-thin font-light font-normal font-medium font-semibold font-bold font-extrabold

/* Colors */
bg-slate-50 → bg-slate-950
text-slate-50 → text-slate-950
border-slate-50 → border-slate-950

/* Size */
w-0 → w-96 w-full w-screen
h-0 → h-96 h-full h-screen

/* Radius */
rounded-none rounded-sm rounded rounded-md rounded-lg rounded-xl rounded-full

/* Shadow */
shadow-sm shadow shadow-md shadow-lg shadow-xl shadow-2xl

/* Responsive */
sm: md: lg: xl: 2xl`}</code>
        </pre>
        <p>Tailwind replaces authoring with composition.</p>

        <div className={styles.spacingGrid} aria-hidden>
          {[
            "0",
            "0.5",
            "1",
            "1.5",
            "2",
            "2.5",
            "3",
            "3.5",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "10",
            "11",
            "12",
            "14",
            "16",
            "20",
            "24",
            "28",
            "32",
            "36",
            "40",
            "44",
            "48",
            "52",
            "56",
            "60",
            "64",
            "72",
            "80",
            "96",
          ].map((s) => (
            <span key={s} className={styles.spacingItem}>
              {s}
            </span>
          ))}
        </div>
      </section>
    </>
  );
}
