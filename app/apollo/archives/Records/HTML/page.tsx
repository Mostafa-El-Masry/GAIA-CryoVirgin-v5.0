export default function HTMLRecord() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      <h1 className="text-2xl font-semibold">
        HTML + JSX — UNIFIED KNOWLEDGE MAP
      </h1>

      <section>
        <h2 className="text-lg font-medium">1. Document & Root Structure</h2>
        <p className="text-sm">
          Concept — The outer shell of a document; metadata vs visible content.
        </p>
        <p className="text-sm font-medium">Plain HTML</p>
        <ul className="list-disc pl-6">
          <li>&lt;!DOCTYPE html&gt;</li>
          <li>&lt;html lang="en"&gt;</li>
          <li>&lt;head&gt; (meta, title, links)</li>
          <li>&lt;body&gt; (everything visible)</li>
        </ul>
        <p className="text-sm font-medium">JSX / Next.js</p>
        <ul className="list-disc pl-6">
          <li>
            No &lt;!DOCTYPE&gt; in components — layouts handle document root.
          </li>
          <li>
            Use <code>layout.tsx</code> and metadata APIs for head content.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-medium">2. Text & Headings</h2>
        <p className="text-sm">
          Headings define hierarchy: keep levels logical and do not skip.
        </p>
        <pre className="bg-gray-100 p-3 rounded">
          <code>{`<h1>Main Title</h1>
<h2>Subtitle</h2>
<p>Body text...</p>`}</code>
        </pre>
      </section>

      <section>
        <h2 className="text-lg font-medium">3. Links & Navigation</h2>
        <p className="text-sm">
          HTML anchors vs Next.js <code>Link</code> for SPA routing.
        </p>
        <pre className="bg-gray-100 p-3 rounded">
          <code>{`<!-- HTML -->
<a href="/about">About</a>

// Next.js
import Link from 'next/link'
<Link href="/about">About</Link>`}</code>
        </pre>
      </section>

      <section>
        <h2 className="text-lg font-medium">Demo Section: Images</h2>
        <p className="text-sm">
          Element matched: <code>img</code> (media)
        </p>
        <h3 className="font-medium">1. Plain HTML</h3>
        <pre className="bg-gray-100 p-3 rounded">
          <code>{`<img src="/images/avatar.jpg" alt="User avatar" width="150" height="150">`}</code>
        </pre>
        <h3 className="font-medium">2. JSX / Next.js (basic)</h3>
        <pre className="bg-gray-100 p-3 rounded">
          <code>{`<img src="/images/avatar.jpg" alt="User avatar" width={150} height={150} />`}</code>
        </pre>
        <h3 className="font-medium">3. JSX / Next.js (optimized)</h3>
        <pre className="bg-gray-100 p-3 rounded">
          <code>{`import Image from 'next/image'

<Image src="/images/avatar.jpg" alt="User avatar" width={150} height={150} />`}</code>
        </pre>
        <p className="text-sm">
          Notes: Next.js <code>Image</code> adds optimization (lazy,
          responsive). Always provide <code>alt</code> and dimensions for layout
          stability.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-medium">Demo Section: Headings</h2>
        <p className="text-sm">
          Headings are identical in JSX; preserve semantic hierarchy.
        </p>
        <pre className="bg-gray-100 p-3 rounded">
          <code>{`<h1>Main Title</h1>
<h2>Subtitle</h2>`}</code>
        </pre>
      </section>

      <section>
        <h2 className="text-lg font-medium">Demo Section: Links</h2>
        <p className="text-sm">
          Use <code>Link</code> for client-side navigation; anchors still apply
          for external links.
        </p>
        <pre className="bg-gray-100 p-3 rounded">
          <code>{`<a href="/about">About Us</a>

import Link from 'next/link'
<Link href="/about">About Us</Link>`}</code>
        </pre>
      </section>

      <section>
        <h2 className="text-lg font-medium">Demo Section: Form Input</h2>
        <p className="text-sm">
          JSX uses <code>htmlFor</code> and requires self-closing inputs.
        </p>
        <pre className="bg-gray-100 p-3 rounded">
          <code>{`<!-- HTML -->
<form>
  <label for="email">Email</label>
  <input type="email" id="email" name="email" required>
</form>

// JSX
<form>
  <label htmlFor="email">Email</label>
  <input type="email" id="email" name="email" required />
</form>`}</code>
        </pre>
      </section>

      <section>
        <h2 className="text-lg font-medium">4. Media — Images (summary)</h2>
        <p className="text-sm">
          Images load from URLs; alt for accessibility; optimize for performance
          to avoid CLS.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-medium">5. Media — Video & Audio</h2>
        <p className="text-sm">
          Use native <code>video</code> and <code>audio</code> with{" "}
          <code>source</code>; JSX requires self-closing <code>source</code>{" "}
          tags.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-medium">6. Lists</h2>
        <p className="text-sm">
          Use semantic lists; when rendering from arrays, include{" "}
          <code>key</code> on list items.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-medium">7. Layout & Semantic Structure</h2>
        <p className="text-sm">
          Prefer semantic elements (<code>header</code>, <code>nav</code>,{" "}
          <code>main</code>, <code>section</code>, <code>aside</code>,{" "}
          <code>footer</code>).
        </p>
      </section>

      <section>
        <h2 className="text-lg font-medium">8. Forms & Inputs</h2>
        <p className="text-sm">
          Understand native form behavior before adding React-controlled logic.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-medium">9. Attributes vs Props</h2>
        <ul className="list-disc pl-6">
          <li>
            <code>class</code> → <code>className</code>
          </li>
          <li>
            <code>for</code> → <code>htmlFor</code>
          </li>
          <li>
            Boolean attributes become props (e.g. <code>disabled</code>).
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-medium">10. Comments & Whitespace</h2>
        <p className="text-sm">
          HTML comments: <code>&lt;!-- --&gt;</code>; JSX comments:{" "}
          <code>{`{/* ... */}`}</code>.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-medium">11. Validity & Errors</h2>
        <p className="text-sm">
          Browsers are forgiving; JSX is strict — fix nesting and self-closing
          errors early.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-medium">Accessibility (non-negotiable)</h2>
        <ul className="list-disc pl-6">
          <li>
            Use semantic elements and meaningful <code>alt</code> text.
          </li>
          <li>
            Pair <code>label</code> with inputs and preserve keyboard order.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-medium">Mental test: “Do I know HTML?”</h2>
        <ul className="list-disc pl-6">
          <li>Explain a page structure by inspection.</li>
          <li>Rebuild a page without CSS and keep semantic order.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-medium">Consolidated Cheat Sheet</h2>
        <ul className="list-disc pl-6">
          <li>
            Think HTML first → translate to JSX → apply Next.js enhancements.
          </li>
          <li>Remember attribute mappings and self-closing rules.</li>
          <li>
            Use <code>next/image</code> and <code>Link</code> where appropriate.
          </li>
        </ul>
      </section>
    </main>
  );
}
