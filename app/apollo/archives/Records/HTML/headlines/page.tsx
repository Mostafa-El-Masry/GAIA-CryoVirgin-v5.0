export default function HTMLHeadlinesRecord() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      <h1 className="text-2xl font-semibold">
        HTML — What You Must Know (Headlines Only, Complete)
      </h1>

      <section>
        <h2 className="text-lg font-medium">
          1. What HTML is (and what it is not)
        </h2>
        <ul className="list-disc pl-6">
          <li>HTML = structure + meaning, not styling, not logic</li>
          <li>Browser reads HTML to build the DOM</li>
          <li>HTML describes content hierarchy, not appearance</li>
          <li>HTML is declarative, not procedural</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-medium">
          2. Basic HTML document structure (plain HTML)
        </h2>
        <p className="text-sm">You must know:</p>
        <ul className="list-disc pl-6">
          <li>&lt;!DOCTYPE html&gt; — what it does</li>
          <li>&lt;html lang=""&gt; — why lang matters</li>
          <li>&lt;head&gt; vs &lt;body&gt;</li>
          <li>&lt;meta charset="UTF-8"&gt;</li>
          <li>&lt;meta name="viewport"&gt;</li>
          <li>&lt;title&gt;</li>
        </ul>
        <p className="text-sm">You must understand:</p>
        <ul className="list-disc pl-6">
          <li>What goes in &lt;head&gt; vs what must not</li>
          <li>Why metadata matters for SEO, accessibility, mobile</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-medium">3. Elements, tags, and anatomy</h2>
        <ul className="list-disc pl-6">
          <li>Opening tag / closing tag</li>
          <li>Self-closing tags</li>
          <li>Element vs tag vs attribute</li>
          <li>Nested elements (parent / child / sibling)</li>
          <li>Proper indentation and readability</li>
        </ul>
        <p className="text-sm">Examples conceptually (not code-heavy):</p>
        <ul className="list-disc pl-6">
          <li>&lt;tag&gt;content&lt;/tag&gt;</li>
          <li>&lt;tag attribute="value"&gt;</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-medium">
          4. Global attributes (apply to almost everything)
        </h2>
        <ul className="list-disc pl-6">
          <li>id</li>
          <li>class</li>
          <li>style (and why not to abuse it)</li>
          <li>title</li>
          <li>hidden</li>
          <li>tabindex</li>
          <li>contenteditable</li>
          <li>data-* attributes (very important)</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-medium">
          5. Text & content semantics (this is huge)
        </h2>
        <p className="text-sm">You must know when and why to use:</p>
        <ul className="list-disc pl-6">
          <li>Headings: h1 → h6 (structure, not size)</li>
          <li>Paragraphs: p</li>
          <li>Inline text: span</li>
          <li>Emphasis vs importance: em vs strong</li>
          <li>small, mark, del, ins, sub, sup</li>
          <li>Line breaks vs paragraphs: br (rare use)</li>
        </ul>
        <p className="text-sm">You must understand:</p>
        <ul className="list-disc pl-6">
          <li>Heading hierarchy rules</li>
          <li>Why skipping heading levels is bad</li>
          <li>SEO + screen reader implications</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-medium">6. Links & navigation</h2>
        <ul className="list-disc pl-6">
          <li>&lt;a href=""&gt;</li>
          <li>Absolute vs relative URLs</li>
          <li>target="_blank" + rel="noopener noreferrer"</li>
          <li>Anchor links (#id)</li>
          <li>Email (mailto:) and phone (tel:)</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-medium">7. Images & media</h2>
        <ul className="list-disc pl-6">
          <li>&lt;img&gt; and required alt</li>
          <li>When alt should be descriptive vs empty</li>
          <li>width / height attributes (layout stability)</li>
          <li>&lt;picture&gt; conceptually</li>
          <li>&lt;audio&gt; and &lt;video&gt; basics</li>
          <li>&lt;source&gt; usage conceptually</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-medium">8. Lists</h2>
        <ul className="list-disc pl-6">
          <li>Ordered lists (ol)</li>
          <li>Unordered lists (ul)</li>
          <li>List items (li)</li>
          <li>Description lists (dl, dt, dd)</li>
          <li>When lists are semantic, not just visual</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-medium">
          9. Tables (real meaning, not layout)
        </h2>
        <ul className="list-disc pl-6">
          <li>table, thead, tbody, tfoot</li>
          <li>tr, th, td</li>
          <li>scope attribute</li>
          <li>Accessibility implications</li>
          <li>When not to use tables</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-medium">
          10. Forms (critical even if backend comes later)
        </h2>
        <ul className="list-disc pl-6">
          <li>form and action / method</li>
          <li>
            Input types (text, email, password, number, date, checkbox, radio,
            file)
          </li>
          <li>label and for</li>
          <li>name attribute (extremely important)</li>
          <li>placeholder vs label</li>
          <li>required, disabled, readonly</li>
          <li>textarea, select, option</li>
          <li>button vs &lt;input type="submit"&gt;</li>
        </ul>
        <p className="text-sm">You must understand:</p>
        <ul className="list-disc pl-6">
          <li>How browsers submit form data</li>
          <li>Basic client-side validation behavior</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-medium">
          11. Semantic layout elements (modern HTML)
        </h2>
        <ul className="list-disc pl-6">
          <li>header</li>
          <li>nav</li>
          <li>main</li>
          <li>section</li>
          <li>article</li>
          <li>aside</li>
          <li>footer</li>
        </ul>
        <p className="text-sm">You must understand:</p>
        <ul className="list-disc pl-6">
          <li>Why div is generic</li>
          <li>When semantic tags matter</li>
          <li>Landmark roles for accessibility</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-medium">
          12. Accessibility (non-negotiable)
        </h2>
        <ul className="list-disc pl-6">
          <li>What accessibility means in HTML</li>
          <li>Proper use of semantic elements</li>
          <li>alt text rules</li>
          <li>label + input</li>
          <li>aria-* (what it is, when to avoid it)</li>
          <li>Keyboard navigation basics</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-medium">
          13. HTML vs CSS vs JavaScript (boundaries)
        </h2>
        <ul className="list-disc pl-6">
          <li>HTML = structure + meaning</li>
          <li>CSS = layout + visuals</li>
          <li>JS = behavior + logic</li>
        </ul>
        <p className="text-sm">You must know:</p>
        <ul className="list-disc pl-6">
          <li>Why mixing responsibilities causes bad code</li>
          <li>Why HTML should remain readable without CSS/JS</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-medium">
          14. HTML in React / Next.js (this is key for you)
        </h2>
        <p className="text-sm">
          You must know the differences, not just syntax:
        </p>
        <ul className="list-disc pl-6">
          <li>
            What stays the same: Almost all HTML tags still exist; semantic and
            accessibility rules still apply
          </li>
          <li>
            What changes: class → className; self-closing tags are strict; for →
            htmlFor; inline styles become JS objects; comments syntax is
            different; fragment usage instead of unnecessary wrappers
          </li>
        </ul>
        <p className="text-sm">Mental model:</p>
        <ul className="list-disc pl-6">
          <li>JSX = HTML-like syntax inside JavaScript</li>
          <li>JSX compiles to React.createElement</li>
          <li>HTML becomes component output, not static files</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-medium">
          15. HTML files vs component-based HTML
        </h2>
        <ul className="list-disc pl-6">
          <li>Plain HTML = static document</li>
          <li>Next.js = HTML generated by components</li>
          <li>Server Components vs Client Components (conceptually)</li>
          <li>Why you rarely open .html files in Next.js</li>
          <li>Why understanding plain HTML still matters deeply</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-medium">
          16. Validity, standards, and browser behavior
        </h2>
        <ul className="list-disc pl-6">
          <li>Browsers are forgiving (but you shouldn’t rely on it)</li>
          <li>Invalid HTML can still “work” but cause bugs</li>
          <li>What HTML validation is</li>
          <li>Why consistent structure matters</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-medium">
          17. Mental test: “Do I know HTML?”
        </h2>
        <p className="text-sm">You know HTML if you can:</p>
        <ul className="list-disc pl-6">
          <li>Look at any page and explain its structure</li>
          <li>Rebuild a page without CSS and still make sense</li>
          <li>Choose the right semantic tag instinctively</li>
          <li>Write HTML that is readable, accessible, and logical</li>
          <li>Translate HTML → JSX without guessing</li>
        </ul>
      </section>
    </main>
  );
}
