import {
  StudyDescription,
  QuizConfig,
  PracticePrompt,
  PracticeCheckResult,
} from "../lessonTypes";

export function getCssStudy(lessonCode: string): StudyDescription | null {
  switch (lessonCode) {
    case "3.7":
      return {
        title: "Intro to CSS",
        paragraphs: [
          "CSS controls the presentation of your HTML: colors, spacing, typography, and layout.",
          "Rules target elements with selectors (tags, classes, ids) and set properties (color, margin, padding).",
          "This lesson is a quick orientation before you dive deeper into the cascade and layout systems.",
        ],
      };
    case "3.8":
      return {
        title: "The Cascade",
        paragraphs: [
          "The cascade decides which CSS rule wins when multiple rules target the same element.",
          "Specificity (inline > id > class > tag), order (later wins if specificity ties), and importance (!important) influence the winner.",
          "Understanding the cascade prevents surprises and helps you structure styles so they are predictable.",
        ],
      };
    case "3.9":
      return {
        title: "Inspecting HTML and CSS",
        paragraphs: [
          "Browser devtools let you inspect elements, view applied styles, and test changes live.",
          "The Elements/Inspector tab shows the DOM tree and CSS pane with computed values and the cascade order.",
          "You will use the inspector to debug spacing, fonts, and layout issues quickly.",
        ],
      };
    case "3.10":
      return {
        title: "The Box Model (Deep Dive)",
        paragraphs: [
          "Every element is a box with content, padding, border, and margin. box-sizing controls how width/height are calculated.",
          "Understanding overflow, display types, and how inline vs block elements participate in the box model avoids layout bugs.",
          "You will explore how padding and borders affect total size and how to visualize boxes in devtools.",
        ],
      };
    case "3.1":
      return {
        title: "CSS Foundations: Selectors and Properties",
        paragraphs: [
          "CSS is how you tell the browser what your HTML should look like: colors, spacing, fonts, and layout.",
          "You write rules that target elements using selectors (like h1, .class-name, #id) and then apply properties (like color, background, font-size).",
          "In this lesson, you focus on writing a few simple rules to style headings and paragraphs so they feel more like GAIA, not a default plain page.",
          "Do not worry about layout yet - just get comfortable with the shape: selector { property: value; }.",
        ],
      };
    case "3.2":
      return {
        title: "Box Model: Margin, Padding, and Border",
        paragraphs: [
          "Every element on the page is treated like a box. Understanding that box is the key to controlling spacing.",
          "The content sits in the middle. Padding is the space between the content and the border. Border is the line around the box. Margin is the space outside the border, pushing other elements away.",
          "In this lesson, you will practice styling a simple card-like box with padding, border, and margin so it feels like a GAIA panel instead of text stuck to the edges.",
        ],
      };
    case "3.3":
      return {
        title: "Flexbox Basics: Aligning Items in a Row",
        paragraphs: [
          "Flexbox is a layout system that makes it much easier to line items up in a row or column and control how they grow or shrink.",
          "You turn a container into a flex container with display: flex, then use properties like justify-content and align-items to control alignment.",
          "In this lesson, you will build a simple horizontal navigation bar using flexbox, similar to how GAIA might lay out small pill buttons or tabs.",
        ],
      };
    case "3.4":
      return {
        title: "Responsive Design: Mobile-First Thinking",
        paragraphs: [
          "GAIA needs to feel good on both a phone and a laptop. Responsive design starts with a mobile-first base, then adds media queries for wider screens.",
          "Fluid units like % and rem keep layouts flexible, while max-width keeps content from stretching too far on large monitors.",
          "Media queries such as @media (min-width: 768px) let you change layouts (for example, turn a single column into two columns) when there is enough space.",
          "In this lesson you practice writing a small layout that is readable on mobile and then expands gracefully on tablet/desktop.",
        ],
      };
    case "3.5":
      return {
        title: "Tailwind Setup: Faster Styling in Projects",
        paragraphs: [
          "Tailwind is a utility-first CSS framework that speeds up styling by letting you compose classes instead of writing lots of custom CSS.",
          "To set it up you install the npm packages, add @tailwind base; @tailwind components; @tailwind utilities; to your global CSS, and point the content paths in tailwind.config.{js,ts} to your src/app/components folders.",
          "Tailwind works with PostCSS to generate only the classes you actually use, keeping bundles small even with many utilities available.",
          "In this lesson you focus on wiring Tailwind into a Next.js app the same way GAIA is wired, so you can move quickly in later lessons.",
        ],
      };
    case "3.6":
      return {
        title: "Tailwind Layouts and Reusable Pieces",
        paragraphs: [
          "Once Tailwind is running, you can assemble layouts with classes like flex, grid, gap-4, rounded-xl, and shadow to mirror GAIA panels and pills.",
          "You can extract repeated class combinations into small React components or helper functions so you do not repeat long className strings everywhere.",
          "Customization happens in tailwind.config where you can add colors, spacing scales, and fonts that match the GAIA look.",
          "In this lesson you practice building a reusable card and header bar using Tailwind utilities, keeping the HTML semantic and the classes tidy.",
        ],
      };
    default:
      return null;
  }
}

export function getCssQuiz(lessonCode: string): QuizConfig | null {
  switch (lessonCode) {
    case "3.1":
      return {
        id: "quiz-3-1",
        title: "Check your understanding of selectors and properties",
        questions: [
          {
            id: "q1",
            prompt: "Which of these is a valid CSS rule targeting all <p> elements?",
            options: [
              { id: "q1-a", label: "p = { color: red; }" },
              { id: "q1-b", label: "p { color: red; }" },
              { id: "q1-c", label: "<p> color: red; </p>" },
              { id: "q1-d", label: "p: color = red" },
            ],
            correctOptionId: "q1-b",
            explanation:
              "CSS rules use the pattern: selector { property: value; }. For example: p { color: red; }",
          },
          {
            id: "q2",
            prompt: "What does this rule do? .important { font-weight: bold; }",
            options: [
              {
                id: "q2-a",
                label: "It makes all elements in the document bold.",
              },
              {
                id: "q2-b",
                label: "It makes elements with class=\"important\" bold.",
              },
              {
                id: "q2-c",
                label: "It makes elements with id=\"important\" bold.",
              },
              {
                id: "q2-d",
                label: "It does nothing; the syntax is invalid.",
              },
            ],
            correctOptionId: "q2-b",
            explanation:
              "A dot (.) in CSS selects by class. So .important targets any element with class=\"important\".",
          },
          {
            id: "q3",
            prompt: "Which property controls the text color of an element?",
            options: [
              { id: "q3-a", label: "font-size" },
              { id: "q3-b", label: "background" },
              { id: "q3-c", label: "color" },
              { id: "q3-d", label: "border" },
            ],
            correctOptionId: "q3-c",
            explanation:
              "The color property controls the color of the text itself. Background controls the color behind it.",
          },
        ],
      };
    case "3.2":
      return {
        id: "quiz-3-2",
        title: "Check your understanding of the box model",
        questions: [
          {
            id: "q1",
            prompt:
              "Which option best describes the order from inside to outside of the box model?",
            options: [
              { id: "q1-a", label: "Margin -> Border -> Padding -> Content" },
              { id: "q1-b", label: "Content -> Padding -> Border -> Margin" },
              { id: "q1-c", label: "Padding -> Content -> Border -> Margin" },
              { id: "q1-d", label: "Content -> Border -> Padding -> Margin" },
            ],
            correctOptionId: "q1-b",
            explanation:
              "From the center outwards: content, padding, border, margin.",
          },
          {
            id: "q2",
            prompt: "Which property adds space inside the element around its content?",
            options: [
              { id: "q2-a", label: "margin" },
              { id: "q2-b", label: "padding" },
              { id: "q2-c", label: "border" },
              { id: "q2-d", label: "gap" },
            ],
            correctOptionId: "q2-b",
            explanation:
              "Padding is the space between the content and the border. Margin is outside the border.",
          },
          {
            id: "q3",
            prompt:
              "You want to separate two cards so they are not stuck together. Which property do you change?",
            options: [
              { id: "q3-a", label: "padding on the card" },
              { id: "q3-b", label: "border-radius on the card" },
              { id: "q3-c", label: "margin around the card" },
              { id: "q3-d", label: "font-weight of the text" },
            ],
            correctOptionId: "q3-c",
            explanation:
              "Margin controls the space outside the element, so increasing margin separates the cards from each other.",
          },
        ],
      };
    case "3.3":
      return {
        id: "quiz-3-3",
        title: "Check your understanding of flexbox basics",
        questions: [
          {
            id: "q1",
            prompt: "Which CSS declaration turns a container into a flex container?",
            options: [
              { id: "q1-a", label: "display: block;" },
              { id: "q1-b", label: "display: flex;" },
              { id: "q1-c", label: "position: flex;" },
              { id: "q1-d", label: "flex: container;" },
            ],
            correctOptionId: "q1-b",
            explanation:
              "display: flex; activates flex behavior for the direct children of that element.",
          },
          {
            id: "q2",
            prompt:
              "Which property controls horizontal alignment of items in a row flex container?",
            options: [
              { id: "q2-a", label: "align-items" },
              { id: "q2-b", label: "justify-content" },
              { id: "q2-c", label: "flex-direction" },
              { id: "q2-d", label: "text-align" },
            ],
            correctOptionId: "q2-b",
            explanation:
              "For a row flex container, justify-content controls horizontal alignment, and align-items controls vertical alignment.",
          },
          {
            id: "q3",
            prompt:
              "Which property sets whether the main axis of a flex container is horizontal or vertical?",
            options: [
              { id: "q3-a", label: "flex-flow" },
              { id: "q3-b", label: "flex-wrap" },
              { id: "q3-c", label: "flex-direction" },
              { id: "q3-d", label: "align-content" },
            ],
            correctOptionId: "q3-c",
            explanation:
              "flex-direction: row makes items line up horizontally; column makes them stack vertically.",
          },
        ],
      };
    case "3.4":
      return {
        id: "quiz-3-4",
        title: "Check your understanding of responsive design",
        questions: [
          {
            id: "q1",
            prompt: "What does mobile-first CSS usually mean?",
            options: [
              { id: "q1-a", label: "Writing desktop styles and shrinking them with max-width" },
              { id: "q1-b", label: "Starting with narrow screens and layering on styles with min-width media queries" },
              { id: "q1-c", label: "Using only absolute positioning" },
              { id: "q1-d", label: "Ignoring tablet sizes" },
            ],
            correctOptionId: "q1-b",
            explanation:
              "You set base styles for small screens, then add @media (min-width: ...) rules as the screen gets wider.",
          },
          {
            id: "q2",
            prompt: "Which unit helps keep text sizing flexible across devices?",
            options: [
              { id: "q2-a", label: "px" },
              { id: "q2-b", label: "rem" },
              { id: "q2-c", label: "vh only" },
              { id: "q2-d", label: "deg" },
            ],
            correctOptionId: "q2-b",
            explanation:
              "rem scales with the root font-size, so it adapts better than hard-coded px for many layouts.",
          },
          {
            id: "q3",
            prompt: "What does this media query target? @media (min-width: 1024px)",
            options: [
              { id: "q3-a", label: "Screens smaller than 1024px" },
              { id: "q3-b", label: "Screens exactly 1024px wide" },
              { id: "q3-c", label: "Screens 1024px wide or wider" },
              { id: "q3-d", label: "Only print layouts" },
            ],
            correctOptionId: "q3-c",
            explanation:
              "min-width triggers at that width and above, so you can enhance layouts for desktop sizes.",
          },
        ],
      };
    case "3.5":
      return {
        id: "quiz-3-5",
        title: "Check your understanding of Tailwind setup",
        questions: [
          {
            id: "q1",
            prompt: "Which file needs the @tailwind base/components/utilities directives?",
            options: [
              { id: "q1-a", label: "tailwind.config.ts" },
              { id: "q1-b", label: "A global CSS file (for example globals.css)" },
              { id: "q1-c", label: "package.json" },
              { id: "q1-d", label: "next.config.js" },
            ],
            correctOptionId: "q1-b",
            explanation:
              "You import Tailwind layers in your global stylesheet so the framework can generate utilities.",
          },
          {
            id: "q2",
            prompt: "Why do you list paths like ./app/**/*.{ts,tsx} in tailwind.config content?",
            options: [
              { id: "q2-a", label: "To lint TypeScript files" },
              { id: "q2-b", label: "To tell Tailwind where to scan for class names to keep in the final CSS" },
              { id: "q2-c", label: "To configure routing" },
              { id: "q2-d", label: "To install React" },
            ],
            correctOptionId: "q2-b",
            explanation:
              "Tailwind purges unused styles; it needs to scan your source files to know which classes to include.",
          },
          {
            id: "q3",
            prompt: "Which command typically starts a dev server with Tailwind in a Next.js project?",
            options: [
              { id: "q3-a", label: "npm run build" },
              { id: "q3-b", label: "npm run lint" },
              { id: "q3-c", label: "npm run dev" },
              { id: "q3-d", label: "npx tailwind-only" },
            ],
            correctOptionId: "q3-c",
            explanation:
              "npm run dev (or pnpm dev) runs Next.js with Tailwind processing your CSS in watch mode.",
          },
        ],
      };
    case "3.6":
      return {
        id: "quiz-3-6",
        title: "Check your understanding of Tailwind layouts",
        questions: [
          {
            id: "q1",
            prompt: "What does className=\"flex gap-4 items-center\" do to a container?",
            options: [
              { id: "q1-a", label: "Stacks items vertically with no spacing" },
              { id: "q1-b", label: "Lays out children in a row with 1rem-ish gaps and centers them vertically" },
              { id: "q1-c", label: "Adds padding to children" },
              { id: "q1-d", label: "Creates a CSS grid" },
            ],
            correctOptionId: "q1-b",
            explanation:
              "flex creates a row by default, gap-4 adds space, and items-center aligns on the cross axis.",
          },
          {
            id: "q2",
            prompt: "Where do you add custom colors or spacing scales for Tailwind?",
            options: [
              { id: "q2-a", label: "package-lock.json" },
              { id: "q2-b", label: "tailwind.config.ts/js theme.extend section" },
              { id: "q2-c", label: "next-env.d.ts" },
              { id: "q2-d", label: "Only in CSS variables" },
            ],
            correctOptionId: "q2-b",
            explanation:
              "theme.extend inside tailwind.config is where you add project-specific tokens like colors and spacing.",
          },
          {
            id: "q3",
            prompt: "How can you avoid repeating long Tailwind class lists across components?",
            options: [
              { id: "q3-a", label: "Do not repeat; Tailwind forces duplication" },
              { id: "q3-b", label: "Extract small components or helper functions that encapsulate the className" },
              { id: "q3-c", label: "Inline styles only" },
              { id: "q3-d", label: "Use !important everywhere" },
            ],
            correctOptionId: "q3-b",
            explanation:
              "Wrapping common class combinations in components or helper functions keeps your JSX clean and consistent.",
          },
        ],
      };
    default:
      return null;
  }
}

export function getCssPractice(lessonCode: string): PracticePrompt | null {
  switch (lessonCode) {
    case "3.1":
      return {
        title: "Write basic CSS for headings and paragraphs",
        description:
          "Here you will write a few CSS rules to style headings and paragraphs so they feel more like GAIA than a default browser page.",
        instructions: [
          "In the practice box below, write CSS rules that style h1 and p elements.",
          "Make h1 larger and bolder, and choose a text color for h1 and p (for example a soft green or off-white).",
          "When you are done, click \"Check practice & mark lesson\". GAIA will check that you used selectors and some common properties.",
        ],
      };
    case "3.2":
      return {
        title: "Style a simple GAIA card with box model properties",
        description:
          "You will write CSS for a .card class that feels like a GAIA panel: some internal padding, a border, and space around it.",
        instructions: [
          "In the practice box below, write CSS that targets a class called .card.",
          "Give it padding, a visible border, and some margin so it does not touch the edges or other cards.",
          "When you are done, click \"Check practice & mark lesson\". GAIA will check that you used margin, padding, and border.",
        ],
      };
    case "3.3":
      return {
        title: "CSS mini project: GAIA navigation bar",
        description:
          "This is the wrap-up mini project for the CSS arc. You will combine selectors, box model, and flexbox to style a simple GAIA-style navigation bar.",
        instructions: [
          "Write CSS for a .nav-bar container that uses display: flex to lay out its items in a row. Use justify-content and align-items to center or space the items.",
          "Style the links or buttons inside the navigation bar with padding, some margin between them, and maybe a subtle border-radius to feel like GAIA pills.",
          "Give the bar a background color and some padding so it feels like a real part of an app header.",
          "Project pattern A (solo): First, try to style this nav bar without asking AI. Only use docs if you forget a property name.",
          "Project pattern B (with AI): Later, you can ask AI to help you refactor this CSS into Tailwind utility classes or improve the design details.",
        ],
      };
    case "3.4":
      return {
        title: "Make a layout responsive with a media query",
        description:
          "Practice turning a single-column layout into a two-column layout on wider screens, keeping a readable mobile base.",
        instructions: [
          "Write base CSS for a .page container that uses a single column with max-width and padding for mobile.",
          "Add a media query like @media (min-width: 768px) that switches a child .grid into two columns using display: grid or flex.",
          "Make sure text stays readable by using rem for font sizes or spacing instead of only px.",
        ],
      };
    case "3.5":
      return {
        title: "Wire Tailwind into a tiny Next.js snippet",
        description:
          "Pretend you are adding Tailwind to a Next.js project like GAIA. Show the key pieces in code.",
        instructions: [
          "In the practice box, include the three Tailwind directives (@tailwind base; @tailwind components; @tailwind utilities;) as they would appear in a globals.css file.",
          "Write a short tailwind.config content array that includes ./app/**/*.{ts,tsx} so Tailwind scans the app router files.",
          "Add a tiny JSX snippet that uses Tailwind classes (for example, className=\"rounded-xl bg-slate-900 px-4 py-3 text-white\").",
        ],
      };
    case "3.6":
      return {
        title: "Build a reusable Tailwind card layout",
        description:
          "Use Tailwind utilities to style a card and a header bar the way GAIA panels look.",
        instructions: [
          "Create a container with class names like flex or grid plus gap-4 to align at least two cards.",
          "Style each card with padding, rounded corners, a subtle background, and maybe shadow or border to separate it from the background.",
          "Include a small header bar at the top that uses flex, gap, and text sizing classes to align a title and an action button.",
        ],
      };
    default:
      return null;
  }
}

export function validateCssPractice(
  lessonCode: string,
  content: string
): PracticeCheckResult | null {
  const src = content.toLowerCase();

  if (lessonCode === "3.1") {
    const required = ["h1", "p", "color", "font-size"];
    const missing = required.filter((snippet) => !src.includes(snippet));
    if (missing.length > 0) {
      return {
        ok: false,
        message:
          "Your CSS for headings and paragraphs is missing some pieces: " +
          missing.join(", "),
      };
    }
    return { ok: true };
  }

  if (lessonCode === "3.2") {
    const required = [".card", "margin", "padding", "border"];
    const missing = required.filter((snippet) => !src.includes(snippet));
    if (missing.length > 0) {
      return {
        ok: false,
        message:
          "Your .card style is missing some box model pieces: " +
          missing.join(", "),
      };
    }
    return { ok: true };
  }

  if (lessonCode === "3.3") {
    const required = [".nav-bar", "display", "flex", "justify-content"];
    const missing = required.filter((snippet) => !src.includes(snippet));
    if (missing.length > 0) {
      return {
        ok: false,
        message:
          "Your flexbox navigation is missing some key pieces (display: flex and alignment). Missing: " +
          missing.join(", "),
      };
    }
    return { ok: true };
  }

  if (lessonCode === "3.4") {
    const required = ["@media", "min-width", "max-width"];
    const missing = required.filter((snippet) => !src.includes(snippet));
    if (missing.length > 0) {
      return {
        ok: false,
        message:
          "Your responsive layout is missing some expected responsive pieces (media query and width constraints). Missing: " +
          missing.join(", "),
      };
    }
    return { ok: true };
  }

  if (lessonCode === "3.5") {
    const required = ["@tailwind base", "@tailwind components", "@tailwind utilities", "content:"];
    const missing = required.filter((snippet) => !src.includes(snippet));
    if (missing.length > 0) {
      return {
        ok: false,
        message:
          "Your Tailwind setup snippet is missing some required items (directives and content paths). Missing: " +
          missing.join(", "),
      };
    }
    return { ok: true };
  }

  if (lessonCode === "3.6") {
    const required = ["flex", "gap-", "rounded", "bg-"];
    const missing = required.filter((snippet) => !src.includes(snippet));
    if (missing.length > 0) {
      return {
        ok: false,
        message:
          "Your Tailwind card layout is missing some of the expected utility classes (flex/grid, gap, rounded, background). Missing: " +
          missing.join(", "),
      };
    }
    return { ok: true };
  }

  return null;
}
