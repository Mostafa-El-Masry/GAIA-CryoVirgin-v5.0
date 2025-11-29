import {
  StudyDescription,
  QuizConfig,
  PracticePrompt,
  PracticeCheckResult,
} from "../lessonTypes";

export function getJsStudy(lessonCode: string): StudyDescription | null {
  switch (lessonCode) {
    case "4.1":
      return {
        title: "JavaScript Foundations: Values, Variables, and Types",
        paragraphs: [
          "JavaScript is the language that lets your pages think and react. HTML is the structure, CSS is the look, and JavaScript is the brain.",
          "In this lesson, you meet values (like numbers, strings, booleans) and variables (const, let) which hold those values so you can reuse them.",
          "You will also see how JavaScript has different types, and why using clear variable names makes your code readable for future-you and for GAIA.",
          "The goal is to feel comfortable reading tiny pieces of JavaScript and predicting what value they hold.",
        ],
      };
    case "4.2":
      return {
        title: "Conditions and Loops: Making Decisions over Time",
        paragraphs: [
          "Conditions (if, else) let your code choose different paths based on data. Loops (for, while) let you repeat actions without copying and pasting.",
          "You will learn how to write if statements that check values and run different blocks, and for loops that step through a set of items.",
          "In GAIA-style apps, you will use these ideas to, for example, loop over an array of lessons, filter health logs, or check which plans are completed.",
          "The goal is to feel like you can read and write simple branching logic without getting lost in the braces.",
        ],
      };
    case "4.3":
      return {
        title: "Functions: Reusable Pieces of Logic",
        paragraphs: [
          "Functions are named blocks of code that you can call many times. Instead of repeating the same logic, you put it into a function.",
          "You will learn how to define functions with parameters, return values, and how to choose clear names like calculateProgress or formatDate.",
          "In GAIA, many small utilities - like computing completion percentage or mapping a mood value to a color - will be implemented as functions.",
          "The goal is to trust that you can break a problem into small functions instead of writing one huge, messy block.",
        ],
      };
    case "4.4":
      return {
        title: "Arrays and Objects: Structuring Data for GAIA",
        paragraphs: [
          "Arrays and objects are the containers you will use all the time. Arrays are ordered lists (like a list of lessons). Objects are key-value collections (like a single lesson with properties).",
          "You will practice creating arrays of numbers and strings, and objects with clear keys like title, estimateMinutes, and completed.",
          "In GAIA, almost all data - lessons, daily notes, certificates, health logs - can be expressed as arrays of objects.",
          "The goal is to be comfortable reading and shaping this data so you can pass it into React components or send it to Supabase later.",
        ],
      };
    case "4.5":
      return {
        title: "DOM Basics: Talking to the Page",
        paragraphs: [
          "The DOM (Document Object Model) is JavaScript's live view of the page. It lets you read and change elements on the screen.",
          "You will learn how to select elements with document.querySelector, update text content, and respond to simple events like button clicks.",
          "Even though GAIA uses React and Next.js, this DOM understanding will help you reason about what React is abstracting away for you.",
          "The goal is to see that JavaScript can take your static HTML and turn it into something interactive, one tiny step at a time.",
        ],
      };
    case "4.6":
      return {
        title: "Events and User Interaction",
        paragraphs: [
          "Events are how JavaScript responds to the real world: clicks, input changes, key presses, form submissions, and more.",
          "You attach listeners with addEventListener and receive an event object that tells you what happened and where.",
          "Preventing default form submission or stopping propagation are common patterns to keep your UI predictable.",
          "In GAIA-style apps, you will lean on events to update progress, toggle states, and connect user input to data.",
        ],
      };
    case "4.7":
      return {
        title: "Fetch and APIs: Talking to Servers",
        paragraphs: [
          "fetch is a built-in browser API that lets you request data from servers, turning a URL into a Response you can read as JSON or text.",
          "Most modern code wraps fetch in async/await for readability: const res = await fetch(...); const data = await res.json();",
          "You should handle errors (non-200 status codes, network issues) and consider loading states so the UI does not feel frozen.",
          "In GAIA, you will use fetch to talk to Supabase edge functions or APIs, so this lesson sets the foundation for connected data.",
        ],
      };
    default:
      return null;
  }
}

export function getJsQuiz(lessonCode: string): QuizConfig | null {
  switch (lessonCode) {
    case "4.1":
      return {
        id: "quiz-4-1",
        title: "Check your understanding of values and variables",
        questions: [
          {
            id: "q1",
            prompt: "Which keyword creates a block-scoped variable that can change?",
            options: [
              { id: "q1-a", label: "var" },
              { id: "q1-b", label: "let" },
              { id: "q1-c", label: "const" },
              { id: "q1-d", label: "change" },
            ],
            correctOptionId: "q1-b",
            explanation:
              "let creates a block-scoped variable that can be reassigned. const is also block-scoped but cannot be reassigned.",
          },
          {
            id: "q2",
            prompt: "What is the type of the value true in JavaScript?",
            options: [
              { id: "q2-a", label: "number" },
              { id: "q2-b", label: "string" },
              { id: "q2-c", label: "boolean" },
              { id: "q2-d", label: "object" },
            ],
            correctOptionId: "q2-c",
            explanation:
              "true and false are boolean values in JavaScript.",
          },
          {
            id: "q3",
            prompt: "Which is a good variable name for a completion percentage?",
            options: [
              { id: "q3-a", label: "x1" },
              { id: "q3-b", label: "data" },
              { id: "q3-c", label: "completionPercent" },
              { id: "q3-d", label: "a" },
            ],
            correctOptionId: "q3-c",
            explanation:
              "Meaningful names like completionPercent make your code easier to read and debug later.",
          },
        ],
      };
    case "4.2":
      return {
        id: "quiz-4-2",
        title: "Check your understanding of conditions and loops",
        questions: [
          {
            id: "q1",
            prompt: "Which keyword starts a conditional block?",
            options: [
              { id: "q1-a", label: "loop" },
              { id: "q1-b", label: "if" },
              { id: "q1-c", label: "for" },
              { id: "q1-d", label: "repeat" },
            ],
            correctOptionId: "q1-b",
            explanation:
              "if starts a conditional block. You can add else or else if for additional branches.",
          },
          {
            id: "q2",
            prompt: "Which loop is best for running code a fixed number of times?",
            options: [
              { id: "q2-a", label: "if" },
              { id: "q2-b", label: "for" },
              { id: "q2-c", label: "else" },
              { id: "q2-d", label: "switch" },
            ],
            correctOptionId: "q2-b",
            explanation:
              "for loops are commonly used when you know how many times you want to repeat something.",
          },
          {
            id: "q3",
            prompt: "What does === check in JavaScript?",
            options: [
              { id: "q3-a", label: "Assignment" },
              { id: "q3-b", label: "Loose equality with type coercion" },
              { id: "q3-c", label: "Strict equality (same value and type)" },
              { id: "q3-d", label: "Inequality" },
            ],
            correctOptionId: "q3-c",
            explanation:
              "=== checks both value and type, which avoids some confusing coercion that happens with ==.",
          },
        ],
      };
    case "4.3":
      return {
        id: "quiz-4-3",
        title: "Check your understanding of functions",
        questions: [
          {
            id: "q1",
            prompt: "Which keyword defines a function in this example? function greet() { ... }",
            options: [
              { id: "q1-a", label: "greet" },
              { id: "q1-b", label: "function" },
              { id: "q1-c", label: "()" },
              { id: "q1-d", label: "{}" },
            ],
            correctOptionId: "q1-b",
            explanation:
              "The function keyword declares a function. greet is the function name.",
          },
          {
            id: "q2",
            prompt: "What does return do inside a function?",
            options: [
              { id: "q2-a", label: "It logs a value to the console." },
              { id: "q2-b", label: "It stops the function and sends a value back to the caller." },
              { id: "q2-c", label: "It repeats the function." },
              { id: "q2-d", label: "It defines a new variable." },
            ],
            correctOptionId: "q2-b",
            explanation:
              "return ends the function and hands the given value back to whatever called the function.",
          },
          {
            id: "q3",
            prompt: "Why are small, focused functions useful in GAIA-style apps?",
            options: [
              { id: "q3-a", label: "They make the file size bigger." },
              { id: "q3-b", label: "They are harder to reuse." },
              { id: "q3-c", label: "They are easier to test, reuse, and reason about." },
              { id: "q3-d", label: "They cannot be called from other files." },
            ],
            correctOptionId: "q3-c",
            explanation:
              "Small, focused functions are easier to reuse and test, and they make your codebase easier to understand.",
          },
        ],
      };
    case "4.4":
      return {
        id: "quiz-4-4",
        title: "Check your understanding of arrays and objects",
        questions: [
          {
            id: "q1",
            prompt: "Which syntax creates an empty array?",
            options: [
              { id: "q1-a", label: "{}" },
              { id: "q1-b", label: "[]" },
              { id: "q1-c", label: "array()" },
              { id: "q1-d", label: "empty[]" },
            ],
            correctOptionId: "q1-b",
            explanation:
              "[] creates an empty array in JavaScript.",
          },
          {
            id: "q2",
            prompt: "How do you access the first element of an array called lessons?",
            options: [
              { id: "q2-a", label: "lessons(1)" },
              { id: "q2-b", label: "lessons[0]" },
              { id: "q2-c", label: "lessons{0}" },
              { id: "q2-d", label: "lessons.first" },
            ],
            correctOptionId: "q2-b",
            explanation:
              "Arrays are zero-indexed, so the first element is at index 0.",
          },
          {
            id: "q3",
            prompt: "Which is a valid object literal for a lesson?",
            options: [
              { id: "q3-a", label: "{ title: 'Intro', estimateMinutes: 45 }" },
              { id: "q3-b", label: "{ 'Intro', 45 }" },
              { id: "q3-c", label: "[ title: 'Intro', estimateMinutes: 45 ]" },
              { id: "q3-d", label: "lesson('Intro', 45)" },
            ],
            correctOptionId: "q3-a",
            explanation:
              "Objects use key: value pairs inside { } like { title: 'Intro', estimateMinutes: 45 }.",
          },
        ],
      };
    case "4.5":
      return {
        id: "quiz-4-5",
        title: "Check your understanding of DOM basics",
        questions: [
          {
            id: "q1",
            prompt: "Which method selects the first element that matches a CSS selector?",
            options: [
              { id: "q1-a", label: "document.getElements()" },
              { id: "q1-b", label: "document.querySelector()" },
              { id: "q1-c", label: "document.find()" },
              { id: "q1-d", label: "document.dom()" },
            ],
            correctOptionId: "q1-b",
            explanation:
              "document.querySelector() takes a CSS selector string and returns the first matching element.",
          },
          {
            id: "q2",
            prompt: "How do you listen for a click on a button element in plain JavaScript?",
            options: [
              { id: "q2-a", label: "button.onClick = ..." },
              { id: "q2-b", label: "button.addEvent('click', ...)" },
              { id: "q2-c", label: "button.addEventListener('click', ...)" },
              { id: "q2-d", label: "click(button)" },
            ],
            correctOptionId: "q2-c",
            explanation:
              "element.addEventListener('click', handler) is the standard way to listen for click events.",
          },
          {
            id: "q3",
            prompt: "Which property sets the visible text inside an element?",
            options: [
              { id: "q3-a", label: "innerHTML" },
              { id: "q3-b", label: "textContent" },
              { id: "q3-c", label: "value" },
              { id: "q3-d", label: "style" },
            ],
            correctOptionId: "q3-b",
            explanation:
              "textContent safely sets or reads the text inside an element without parsing HTML.",
          },
        ],
      };
    case "4.6":
      return {
        id: "quiz-4-6",
        title: "Check your understanding of events",
        questions: [
          {
            id: "q1",
            prompt: "Which method attaches a click handler to a button element?",
            options: [
              { id: "q1-a", label: "button.listen('click', handler)" },
              { id: "q1-b", label: "button.addEventListener('click', handler)" },
              { id: "q1-c", label: "button.on('click', handler)" },
              { id: "q1-d", label: "button.run(handler)" },
            ],
            correctOptionId: "q1-b",
            explanation:
              "addEventListener is the standard method to register event handlers in the browser.",
          },
          {
            id: "q2",
            prompt: "What does event.preventDefault() do in a submit handler?",
            options: [
              { id: "q2-a", label: "Stops the page from refreshing or navigating on submit" },
              { id: "q2-b", label: "Deletes the form" },
              { id: "q2-c", label: "Logs the event to the console" },
              { id: "q2-d", label: "Automatically saves data to GAIA" },
            ],
            correctOptionId: "q2-a",
            explanation:
              "preventDefault stops the browser's default action (like navigating away), so you can handle the data with JavaScript.",
          },
          {
            id: "q3",
            prompt: "Where can you read details about what triggered an event?",
            options: [
              { id: "q3-a", label: "Only by guessing" },
              { id: "q3-b", label: "Inside the event object passed to your handler" },
              { id: "q3-c", label: "In a global eventHistory variable" },
              { id: "q3-d", label: "You cannot access it" },
            ],
            correctOptionId: "q3-b",
            explanation:
              "The event argument contains properties like target, currentTarget, and key information depending on the event type.",
          },
        ],
      };
    case "4.7":
      return {
        id: "quiz-4-7",
        title: "Check your understanding of fetch and APIs",
        questions: [
          {
            id: "q1",
            prompt: "What does await fetch('/api/data') return when the promise resolves?",
            options: [
              { id: "q1-a", label: "A parsed JSON object directly" },
              { id: "q1-b", label: "A Response object you can read" },
              { id: "q1-c", label: "An HTML string" },
              { id: "q1-d", label: "Only a status code" },
            ],
            correctOptionId: "q1-b",
            explanation:
              "fetch returns a Response object. You then call res.json() or res.text() to read the body.",
          },
          {
            id: "q2",
            prompt: "Which pattern handles errors when using fetch with async/await?",
            options: [
              { id: "q2-a", label: "Ignore them; fetch never fails" },
              { id: "q2-b", label: "Wrap the call in try/catch and check res.ok" },
              { id: "q2-c", label: "Only use then() chains" },
              { id: "q2-d", label: "Write errors to a file" },
            ],
            correctOptionId: "q2-b",
            explanation:
              "Network errors throw, and non-OK responses still resolve. You typically check res.ok and use try/catch around await fetch.",
          },
          {
            id: "q3",
            prompt: "What is a common reason to set headers on a fetch request?",
            options: [
              { id: "q3-a", label: "To change the browser theme" },
              { id: "q3-b", label: "To tell the server what content type you are sending, like JSON" },
              { id: "q3-c", label: "To make CSS load faster" },
              { id: "q3-d", label: "Headers are never used" },
            ],
            correctOptionId: "q3-b",
            explanation:
              "Headers like Content-Type: application/json tell the server how to parse the request body and can include auth tokens.",
          },
        ],
      };
    default:
      return null;
  }
}

export function getJsPractice(lessonCode: string): PracticePrompt | null {
  switch (lessonCode) {
    case "4.1":
      return {
        title: "Write and read simple variables",
        description:
          "Here you will declare a few variables and think about their types and names.",
        instructions: [
          "In the practice box, write JavaScript that declares at least five variables using const or let.",
          "Include: your name as a string, your current GAIA level as a number, a boolean like isStudyingToday, and maybe a completionPercent.",
          "Log them using console.log to show their values.",
          "Project pattern: First, create and name everything yourself. Later, you can ask AI to review your variable names and suggest clearer ones.",
        ],
      };
    case "4.2":
      return {
        title: "Write conditions and loops for sessions",
        description:
          "You will write JavaScript that decides what to say about your study session length and loops through a set of days.",
        instructions: [
          "Create a variable sessionMinutes and set it to a number (like 30, 45, or 60).",
          "Write an if / else if / else block that logs a different message depending on the length (short, medium, or long session).",
          "Create an array of three strings like ['Day 1', 'Day 2', 'Day 3'] and use a for loop to log each one with a message about studying.",
        ],
      };
    case "4.3":
      return {
        title: "Write a function to compute completion",
        description:
          "You will write a small function that computes a completion percentage for lessons - exactly the kind of utility GAIA needs.",
        instructions: [
          "Write a function called calculateCompletion that takes two parameters: completed and total.",
          "Inside, compute the percentage (completed / total * 100) and return a rounded value using Math.round.",
          "Test it by calling calculateCompletion with different values and logging the result.",
        ],
      };
    case "4.4":
      return {
        title: "Shape GAIA-style lesson data",
        description:
          "You will practice building arrays and objects that look very close to what GAIA really uses for lessons.",
        instructions: [
          "Create an array called lessons that contains at least three objects.",
          "Each object should have keys like code (for example '2.1'), title (for example 'HTML Skeleton'), and estimateMinutes (a number).",
          "Then, write a loop that goes through lessons and logs a short summary line for each one.",
        ],
      };
    case "4.5":
      return {
        title: "JavaScript mini project: Tiny GAIA session tracker",
        description:
          "This is the wrap-up mini project for the JavaScript arc. You will build a tiny plain-JS session tracker that reacts to a button click and updates the page.",
        instructions: [
          "Imagine a simple HTML structure with: a heading, a paragraph that shows how many sessions you have completed today, and a button labeled 'Add session'. You can either imagine it or create it in the HTML playground.",
          "Write JavaScript that: (1) selects the paragraph and button, (2) keeps a counter variable for completedSessions, and (3) updates the text when you click the button.",
          "Make sure the text updates every time you click, for example: 'Sessions today: 1', 'Sessions today: 2', etc.",
          "Project pattern A (solo): First, try to write this JavaScript completely alone and debug it yourself if it does not work.",
          "Project pattern B (with AI): Later, you can ask AI to review your code and suggest improvements, like better variable names or small refactors.",
        ],
      };
    case "4.6":
      return {
        title: "Handle events for a tiny form",
        description:
          "Practice wiring up event listeners so a form feels interactive instead of static.",
        instructions: [
          "Create variables that select a form element and an input (for example, document.querySelector('.note-form')).",
          "Add a submit listener with addEventListener('submit', ...) that calls event.preventDefault().",
          "Inside the handler, read the input value, log it, and clear the field. Optionally show a message that includes the submitted text.",
        ],
      };
    case "4.7":
      return {
        title: "Fetch data and handle errors",
        description:
          "Write a small async function that fetches JSON, checks the response, and handles failures gracefully.",
        instructions: [
          "Write an async function called loadLessons that calls fetch with a URL like 'https://example.com/api/lessons'.",
          "Await the response, check res.ok, and if true parse JSON with await res.json(); otherwise log an error with the status code.",
          "Wrap the call in try/catch and set a friendly fallback (for example, const lessons = [] if something fails).",
        ],
      };
    default:
      return null;
  }
}

export function validateJsPractice(
  lessonCode: string,
  content: string
): PracticeCheckResult | null {
  const src = content.toLowerCase();

  if (lessonCode === "4.1") {
    const required = ["const ", "let ", "console.log"];
    const missing = required.filter((snippet) => !src.includes(snippet));
    if (missing.length > 0) {
      return {
        ok: false,
        message:
          "Your variables practice is missing some expected pieces (const/let and console.log). Missing: " +
          missing.join(", "),
      };
    }
    return { ok: true };
  }

  if (lessonCode === "4.2") {
    const required = ["if", "else", "for", "["];
    const missing = required.filter((snippet) => !src.includes(snippet));
    if (missing.length > 0) {
      return {
        ok: false,
        message:
          "Your conditions/loops practice is missing some pieces (if/else and a loop over an array). Missing: " +
          missing.join(", "),
      };
    }
    return { ok: true };
  }

  if (lessonCode === "4.3") {
    const required = ["function", "calculatecompletion", "return", "math.round"];
    const missing = required.filter((snippet) => !src.includes(snippet));
    if (missing.length > 0) {
      return {
        ok: false,
        message:
          "Your function practice is missing some key pieces (function, return, Math.round, and the name calculateCompletion). Missing: " +
          missing.join(", "),
      };
    }
    return { ok: true };
  }

  if (lessonCode === "4.4") {
    const required = ["[", "{", "code", "title", "estimateminutes"];
    const missing = required.filter((snippet) => !src.includes(snippet));
    if (missing.length > 0) {
      return {
        ok: false,
        message:
          "Your data practice is missing some signs of an array of lesson objects. Missing: " +
          missing.join(", "),
      };
    }
    return { ok: true };
  }

  if (lessonCode === "4.5") {
    const required = ["let", "addEventListener", "document.queryselector"];
    const missing = required.filter((snippet) => !src.includes(snippet));
    if (missing.length > 0) {
      return {
        ok: false,
        message:
          "Your DOM mini project is missing some expected pieces (variables, addEventListener, and querySelector). Missing: " +
          missing.join(", "),
      };
    }
    return { ok: true };
  }

  if (lessonCode === "4.6") {
    const required = ["addeventlistener", "preventdefault", "event"];
    const missing = required.filter((snippet) => !src.includes(snippet));
    if (missing.length > 0) {
      return {
        ok: false,
        message:
          "Your events practice is missing some expected pieces (addEventListener, event, preventDefault). Missing: " +
          missing.join(", "),
      };
    }
    return { ok: true };
  }

  if (lessonCode === "4.7") {
    const required = ["fetch", "async", "await", "res.ok"];
    const missing = required.filter((snippet) => !src.includes(snippet));
    if (missing.length > 0) {
      return {
        ok: false,
        message:
          "Your fetch practice is missing some expected pieces (async/await, fetch, and an ok check). Missing: " +
          missing.join(", "),
      };
    }
    return { ok: true };
  }

  return null;
}
