import {
  StudyDescription,
  QuizConfig,
  PracticePrompt,
  PracticeCheckResult,
} from "../lessonTypes";

export function getReactNextStudy(lessonCode: string): StudyDescription | null {
  switch (lessonCode) {
    case "5.1":
      return {
        title: "Thinking in Components",
        paragraphs: [
          "React apps are built as trees of components. Each component has a clear job and can receive data (props) from its parent.",
          "When you see a UI, you can sketch it as nested boxes: layout shell, header, list, list item, button. Each box can become a component.",
          "Keeping components small and focused makes them easier to test, reuse, and evolve. If a component needs too many props, it may need to be split.",
          "In GAIA, this mindset lets you map a dashboard into panels, cards, and controls that can be rearranged without rewriting everything.",
        ],
      };
    case "5.2":
      return {
        title: "Props and State",
        paragraphs: [
          "Props are inputs passed from parent to child. They are read-only from the child's perspective.",
          "State (useState) lives inside a component and changes over time. Updating state triggers a re-render of that component and its children.",
          "Derived values should be computed from props/state instead of stored twice. That keeps the source of truth clear.",
          "In this lesson you will wire props and state together: pass a title down, store a count locally, and update it in response to an event.",
        ],
      };
    case "5.3":
      return {
        title: "Next.js Pages and Routing",
        paragraphs: [
          "Next.js uses file-system routing. In the app router, every folder inside app with a page.tsx becomes a route.",
          "Layouts (layout.tsx) wrap pages and let you share navigation or shells. Dynamic segments like [id] capture URL parts.",
          "The Link component enables client-side navigation without full page reloads, keeping GAIA feeling instant.",
          "In this lesson you map URLs to folders and practice creating a simple page component for a route like /apollo/notes/[id].",
        ],
      };
    case "5.4":
      return {
        title: "Data Fetching Basics in Next.js",
        paragraphs: [
          "In the app router, server components can be async and fetch data directly. They run on the server, so secrets stay safe.",
          "You can control caching with fetch options (cache: 'no-store') or by exporting revalidate to opt into incremental static regeneration.",
          "Client components fetch with useEffect when data must be loaded in the browser (for example, when using local storage or browser-only APIs).",
          "This lesson shows how to load data in a server component list and when to choose client fetching instead.",
        ],
      };
    case "5.5":
      return {
        title: "Forms and Local State in React",
        paragraphs: [
          "Forms in React are often controlled: the input value comes from state, and onChange updates that state.",
          "onSubmit should usually call event.preventDefault() so you can handle data yourself instead of letting the browser navigate.",
          "Validation and messaging live in state too (for example, error text when a field is empty).",
          "In this lesson you wire a simple form that collects text, tracks its value, and clears the field when submitted.",
        ],
      };
    default:
      return null;
  }
}

export function getReactNextQuiz(lessonCode: string): QuizConfig | null {
  switch (lessonCode) {
    case "5.1":
      return {
        id: "quiz-5-1",
        title: "Check your understanding of components",
        questions: [
          {
            id: "q1",
            prompt: "What is a good first step when turning a screen into components?",
            options: [
              { id: "q1-a", label: "Write all logic in a single file" },
              { id: "q1-b", label: "Sketch nested boxes and name each logical piece" },
              { id: "q1-c", label: "Start with CSS only" },
              { id: "q1-d", label: "Create one component per HTML tag" },
            ],
            correctOptionId: "q1-b",
            explanation:
              "Breaking the UI into named boxes helps you spot natural component boundaries before writing code.",
          },
          {
            id: "q2",
            prompt: "What is a sign that a component is doing too much?",
            options: [
              { id: "q2-a", label: "It receives many unrelated props and manages unrelated concerns" },
              { id: "q2-b", label: "It renders exactly one child" },
              { id: "q2-c", label: "It uses semantic HTML" },
              { id: "q2-d", label: "It imports a CSS file" },
            ],
            correctOptionId: "q2-a",
            explanation:
              "Too many unrelated props often means the component should be split into smaller parts.",
          },
          {
            id: "q3",
            prompt: "How does data usually flow in React?",
            options: [
              { id: "q3-a", label: "Randomly between components" },
              { id: "q3-b", label: "From children up to parents only" },
              { id: "q3-c", label: "From parents down to children via props" },
              { id: "q3-d", label: "Directly into the DOM without components" },
            ],
            correctOptionId: "q3-c",
            explanation:
              "Props move data down the tree. Events bubble up to notify parents when something changed.",
          },
        ],
      };
    case "5.2":
      return {
        id: "quiz-5-2",
        title: "Check your understanding of props and state",
        questions: [
          {
            id: "q1",
            prompt: "Which statement is true about props?",
            options: [
              { id: "q1-a", label: "They are mutable by the child component" },
              { id: "q1-b", label: "They are read-only inputs provided by the parent" },
              { id: "q1-c", label: "They can only hold numbers" },
              { id: "q1-d", label: "They automatically persist to Supabase" },
            ],
            correctOptionId: "q1-b",
            explanation:
              "Props come from parents. Children should not mutate them; if changes are needed, request them via callbacks.",
          },
          {
            id: "q2",
            prompt: "What does useState return?",
            options: [
              { id: "q2-a", label: "A value and a setter function" },
              { id: "q2-b", label: "Only a setter function" },
              { id: "q2-c", label: "Only a value" },
              { id: "q2-d", label: "A DOM node" },
            ],
            correctOptionId: "q2-a",
            explanation:
              "useState returns a tuple: [value, setValue]. Calling setValue triggers a re-render with the new state.",
          },
          {
            id: "q3",
            prompt: "How should you update state based on its previous value?",
            options: [
              { id: "q3-a", label: "Directly mutate the state variable" },
              { id: "q3-b", label: "Use the setter with a callback: setCount((c) => c + 1)" },
              { id: "q3-c", label: "Change a prop instead" },
              { id: "q3-d", label: "State cannot depend on previous values" },
            ],
            correctOptionId: "q3-b",
            explanation:
              "Using the functional form of setState avoids stale values and keeps updates predictable.",
          },
        ],
      };
    case "5.3":
      return {
        id: "quiz-5-3",
        title: "Check your understanding of Next.js routing",
        questions: [
          {
            id: "q1",
            prompt: "Which file creates a route at /dashboard in the app router?",
            options: [
              { id: "q1-a", label: "app/dashboard/page.tsx" },
              { id: "q1-b", label: "pages/dashboard.js only" },
              { id: "q1-c", label: "app/page.tsx only" },
              { id: "q1-d", label: "config/routes.json" },
            ],
            correctOptionId: "q1-a",
            explanation:
              "In the app router, each folder with page.tsx inside app/ maps to a route.",
          },
          {
            id: "q2",
            prompt: "How do you create a dynamic segment for an id?",
            options: [
              { id: "q2-a", label: "Use curly braces like {id}" },
              { id: "q2-b", label: "Use a folder named [id]" },
              { id: "q2-c", label: "Add a query string manually" },
              { id: "q2-d", label: "Dynamic segments are not supported" },
            ],
            correctOptionId: "q2-b",
            explanation:
              "A folder named [id] captures that part of the URL and passes it to your component as params.",
          },
          {
            id: "q3",
            prompt: "Why use Link instead of a plain <a> for internal navigation?",
            options: [
              { id: "q3-a", label: "Link only works on mobile" },
              { id: "q3-b", label: "Link triggers client-side navigation without full reloads" },
              { id: "q3-c", label: "Link is required for external URLs" },
              { id: "q3-d", label: "Plain anchors do not work in Next.js" },
            ],
            correctOptionId: "q3-b",
            explanation:
              "Link keeps navigation fast and preserves state by avoiding full page reloads for internal routes.",
          },
        ],
      };
    case "5.4":
      return {
        id: "quiz-5-4",
        title: "Check your understanding of data fetching",
        questions: [
          {
            id: "q1",
            prompt: "Where is it safest to fetch data that needs a secret key?",
            options: [
              { id: "q1-a", label: "Inside a client component useEffect" },
              { id: "q1-b", label: "Inside an async server component or server action" },
              { id: "q1-c", label: "Directly in the browser console" },
              { id: "q1-d", label: "In CSS" },
            ],
            correctOptionId: "q1-b",
            explanation:
              "Server components run on the server, so secrets are not exposed to the browser.",
          },
          {
            id: "q2",
            prompt: "What does cache: 'no-store' do in fetch?",
            options: [
              { id: "q2-a", label: "Caches forever" },
              { id: "q2-b", label: "Skips caching and always fetches fresh data" },
              { id: "q2-c", label: "Only works in development" },
              { id: "q2-d", label: "Deletes the database" },
            ],
            correctOptionId: "q2-b",
            explanation:
              "no-store tells Next.js to skip caching this request, which is useful for dashboards or frequently changing data.",
          },
          {
            id: "q3",
            prompt: "When should you fetch in a client component instead of a server component?",
            options: [
              { id: "q3-a", label: "When you need browser-only APIs (like localStorage) or live client interaction" },
              { id: "q3-b", label: "Never; server components are required" },
              { id: "q3-c", label: "Only when styles need it" },
              { id: "q3-d", label: "Client components cannot fetch" },
            ],
            correctOptionId: "q3-a",
            explanation:
              "Client components are for interactive or browser-only scenarios; server components handle most data fetching otherwise.",
          },
        ],
      };
    case "5.5":
      return {
        id: "quiz-5-5",
        title: "Check your understanding of forms in React",
        questions: [
          {
            id: "q1",
            prompt: "What should onSubmit handlers usually call first?",
            options: [
              { id: "q1-a", label: "event.preventDefault()" },
              { id: "q1-b", label: "window.close()" },
              { id: "q1-c", label: "alert('submit')" },
              { id: "q1-d", label: "Nothing; the browser handles it" },
            ],
            correctOptionId: "q1-a",
            explanation:
              "preventDefault stops the default page reload so you can handle the data yourself.",
          },
          {
            id: "q2",
            prompt: "What is a controlled input?",
            options: [
              { id: "q2-a", label: "An input that uses random values" },
              { id: "q2-b", label: "An input whose value comes from React state and updates via onChange" },
              { id: "q2-c", label: "An input that cannot be edited" },
              { id: "q2-d", label: "An input that saves directly to Supabase" },
            ],
            correctOptionId: "q2-b",
            explanation:
              "Controlled inputs bind their value to state and call setState in onChange handlers.",
          },
          {
            id: "q3",
            prompt: "Why keep form validation errors in state?",
            options: [
              { id: "q3-a", label: "So the browser ignores them" },
              { id: "q3-b", label: "To display messages reactively when values change" },
              { id: "q3-c", label: "To disable CSS" },
              { id: "q3-d", label: "State cannot hold errors" },
            ],
            correctOptionId: "q3-b",
            explanation:
              "State-driven errors let you show and clear messages based on user input in real time.",
          },
        ],
      };
    default:
      return null;
  }
}

export function getReactNextPractice(lessonCode: string): PracticePrompt | null {
  switch (lessonCode) {
    case "5.1":
      return {
        title: "Break a screen into components",
        description:
          "Choose a simple GAIA-style screen (dashboard or lesson viewer) and name the components you would create.",
        instructions: [
          "List the component tree (for example: PageShell -> Header -> ProgressPills -> LessonList -> LessonItem).",
          "Write 1-2 responsibilities for each component and the props it would need.",
          "Mark which components likely need local state versus which should stay stateless.",
        ],
      };
    case "5.2":
      return {
        title: "Wire props and state together",
        description:
          "Write a small React component that receives a title prop and tracks a local count.",
        instructions: [
          "Accept a prop like title: string and render it.",
          "Use useState to store a count starting at 0.",
          "Add a button with an onClick handler that increments the count and shows the new value.",
        ],
      };
    case "5.3":
      return {
        title: "Map a route to a page component",
        description:
          "Describe or write the minimal files for a route /apollo/notes/[id] in the app router.",
        instructions: [
          "Show the folder structure under app/ including the [id]/page.tsx file.",
          "Inside the page component, read params.id and render a heading that includes the id.",
          "Add at least one Link that navigates back to /apollo/notes or another internal route.",
        ],
      };
    case "5.4":
      return {
        title: "Fetch data in a server component",
        description:
          "Write an async page or component that fetches JSON, checks the response, and renders a list.",
        instructions: [
          "Use an async function component that calls await fetch with cache: 'no-store' or a revalidate export.",
          "Parse JSON with await res.json() and handle non-ok responses with a fallback message.",
          "Render a list of items (title and id) from the fetched data.",
        ],
      };
    case "5.5":
      return {
        title: "Build a controlled form component",
        description:
          "Create a small React form that captures a note and clears after submit.",
        instructions: [
          "Use useState to track the input value and an optional error string.",
          "Handle onSubmit by preventing default, validating non-empty text, and then clearing the field.",
          "Show the current value and any error message in the rendered output.",
        ],
      };
    default:
      return null;
  }
}

export function validateReactNextPractice(
  lessonCode: string,
  content: string
): PracticeCheckResult | null {
  const src = content.toLowerCase();

  if (lessonCode === "5.1") {
    const required = ["component", "props"];
    const missing = required.filter((snippet) => !src.includes(snippet));
    if (missing.length > 0) {
      return {
        ok: false,
        message:
          "Mention your component names and the props they accept so the plan is concrete. Missing: " +
          missing.join(", "),
      };
    }
    return { ok: true };
  }

  if (lessonCode === "5.2") {
    const required = ["usestate", "onclick", "props"];
    const missing = required.filter((snippet) => !src.includes(snippet));
    if (missing.length > 0) {
      return {
        ok: false,
        message:
          "Your props/state practice should show useState, an onClick handler, and a prop being rendered. Missing: " +
          missing.join(", "),
      };
    }
    return { ok: true };
  }

  if (lessonCode === "5.3") {
    const hasPage = src.includes("page.tsx") || src.includes("app/");
    const hasDynamic = src.includes("[id]") || src.includes("params");
    const hasLink = src.includes("link");
    if (!hasPage || !hasDynamic || !hasLink) {
      return {
        ok: false,
        message:
          "Show the app/ folder route, a dynamic segment, and an internal Link in your answer.",
      };
    }
    return { ok: true };
  }

  if (lessonCode === "5.4") {
    const required = ["async", "await", "fetch"];
    const missing = required.filter((snippet) => !src.includes(snippet));
    if (missing.length > 0) {
      return {
        ok: false,
        message:
          "Your data fetching practice should include an async component and fetch with await. Missing: " +
          missing.join(", "),
      };
    }
    return { ok: true };
  }

  if (lessonCode === "5.5") {
    const required = ["form", "onsubmit", "usestate", "preventdefault"];
    const missing = required.filter((snippet) => !src.includes(snippet));
    if (missing.length > 0) {
      return {
        ok: false,
        message:
          "Your form practice should show a controlled input and submit handler with preventDefault. Missing: " +
          missing.join(", "),
      };
    }
    return { ok: true };
  }

  return null;
}
