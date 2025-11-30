import {
  StudyDescription,
  QuizConfig,
  PracticePrompt,
  PracticeCheckResult,
} from "../lessonTypes";

export function getHtmlStudy(lessonCode: string): StudyDescription | null {
  switch (lessonCode) {
    case "2.0":
      return {
        title: "Introduction to HTML and CSS",
        paragraphs: [
          "HTML gives your page structure and meaning; CSS controls how it looks. Together they turn ideas into visible interfaces.",
          "In GAIA, every page you see is ultimately built from HTML elements styled with CSS or Tailwind. Understanding the basics makes every later framework (React, Next.js) feel less magical.",
          "You do not need to memorize every tag or property today. You just need to see the main ingredients: elements, attributes, and how CSS can target them to change layout, color, and spacing.",
        ],
      };
    case "2.6":
      return {
        title: "Elements and Tags",
        paragraphs: [
          "HTML is built from elements expressed with tags like <p>, <h1>, <ul>, and <a>. Each tag describes the role of the content inside it.",
          "Attributes such as class or id add extra information that styling or scripts can use.",
          "Here you practice choosing the right element for the job instead of using <div> everywhere.",
        ],
      };
    case "2.7":
      return {
        title: "HTML Boilerplate",
        paragraphs: [
          "A valid document starts with <!DOCTYPE html>, then <html>, <head>, and <body>.",
          "Inside <head> you typically add <meta charset=\"UTF-8\">, <title>, and links to CSS.",
          "This lesson is about writing that boilerplate by hand until it feels automatic.",
        ],
      };
    case "2.8":
      return {
        title: "Working with Text",
        paragraphs: [
          "Headings, paragraphs, emphasis, and strong text make pages readable.",
          "Use <h1>-<h6> for structure, <p> for paragraphs, <em> for emphasis, and <strong> for importance.",
          "You will turn rough notes into semantic text blocks that screen readers and GAIA can parse.",
        ],
      };
    case "2.9":
      return {
        title: "Lists",
        paragraphs: [
          "Lists organize steps or bullet points. Use <ul> for unordered lists, <ol> for ordered lists, and <li> for each item.",
          "Nested lists help break down substeps without dumping everything into one paragraph.",
          "You will practice turning scattered notes into clear lists.",
        ],
      };
    case "2.10":
      return {
        title: "Links and Images (Essentials)",
        paragraphs: [
          "Links connect users to other pages or sections; images add context and visuals.",
          "Always include href on <a> and alt on <img>. Alt text is required for accessibility and graceful fallback.",
          "You will add internal/external links and meaningful images.",
        ],
      };
    case "2.11":
      return {
        title: "Commit Messages",
        paragraphs: [
          "Commit messages tell the story of your project. Keep them short, clear, and in the imperative mood.",
          "A simple pattern: \"Add <scope>\" or \"Fix <issue>\". Example: \"Add recipe index page\".",
          "You will draft a few messages for common HTML edits to build the habit early.",
        ],
      };
    case "2.12":
      return {
        title: "Project: Recipes",
        paragraphs: [
          "Build a simple multi-page recipe site using only HTML to cement your fundamentals.",
          "Each page should include headings, paragraphs, lists for ingredients/steps, images with alt text, and links back to an index.",
          "Focus on clean structure and navigation; styling can come later.",
        ],
      };
    case "2.1":
      return {
        title: "HTML Foundations: Skeleton of a Page",
        paragraphs: [
          "HTML is the skeleton of every web page. Before you think about colors or animations, you need a clear structure: where is the title, where is the content, where is the navigation.",
          "In this lesson, you focus on the basic structure: <!DOCTYPE html>, <html>, <head>, and <body>. This is the frame that every modern page still uses, including GAIA.",
          "You also see how headings (<h1>, <h2>, ...), paragraphs (<p>), and simple lists (<ul>, <li>) help you express the logical order of your content.",
          "The goal is not to write something beautiful yet. The goal is to write something that is clean, valid, and easy to read - for you and for GAIA.",
        ],
      };
    case "2.2":
      return {
        title: "Semantic HTML: Giving Meaning to Structure",
        paragraphs: [
          "Once you know the basic tags, the next step is semantics: using tags that describe the role of each part of your page.",
          "Instead of wrapping everything in <div>, you can use <header>, <nav>, <main>, <section>, <article>, <aside>, and <footer>. These tags tell a story about your page structure.",
          "Semantic HTML helps screen readers, search engines, and tools like GAIA understand your layout. It also helps future-you quickly see what is going on without reading every line.",
          "In this lesson, you look at a small page and practice choosing semantic tags that match the meaning of each block.",
        ],
      };
    case "2.3":
      return {
        title: "Links and Navigation: Connecting Your Pages",
        paragraphs: [
          "HTML pages become powerful when they are connected. Links let you move between sections of GAIA, between modules, and between completely different sites.",
          "The <a> tag (anchor) plus the href attribute creates a clickable link. The text inside <a> is what the user sees and clicks.",
          "You can link to external sites (like a YouTube video or Mahesh Hamadani tutorial) with full URLs starting with http or https. You can also link between GAIA pages using relative paths like /apollo/academy.",
          "In this lesson, you focus on building simple navigation links and understanding when to use absolute versus relative paths.",
        ],
      };
    case "2.4":
      return {
        title: "Images and Alt Text: Visuals with Meaning",
        paragraphs: [
          "Images are a big part of GAIA: logos, avatars, gallery items, thumbnails. The <img> tag lets you embed an image file into your page.",
          "Every <img> should have a src attribute (where the file lives) and an alt attribute (a short description of what the image is).",
          "Alt text is not decoration. It is how people using screen readers understand your page, and it also appears when images fail to load.",
          "In this lesson, you practice writing <img> tags with good alt text that clearly describes the image, especially for important UI elements like logos and icons.",
        ],
      };
    case "2.5":
      return {
        title: "HTML Forms: Collecting Data from Users",
        paragraphs: [
          "Forms are how users talk back to your app. In GAIA-style apps, forms will be used to add logs, update health metrics, save financial data, and more.",
          "A form is usually built from a <form> element containing <label> and <input> (or other fields like <textarea>, <select>, etc.).",
          "Labels should be clearly connected to inputs so users and screen readers know what each field is about.",
          "In this lesson, you build a tiny form, like a 'New GAIA note' or 'Daily summary' form, with proper labels and input types.",
        ],
      };
    default:
      return null;
  }
}

export function getHtmlQuiz(lessonCode: string): QuizConfig | null {
  switch (lessonCode) {
    case "2.6":
      return {
        id: "quiz-2-6",
        title: "Elements and tags basics",
        questions: [
          {
            id: "q1",
            prompt: "Which tag is best for a top-level page title?",
            options: [
              { id: "q1-a", label: "<p>" },
              { id: "q1-b", label: "<h1>" },
              { id: "q1-c", label: "<div>" },
              { id: "q1-d", label: "<span>" },
            ],
            correctOptionId: "q1-b",
            explanation: "<h1> represents the main heading of a document.",
          },
          {
            id: "q2",
            prompt: "What is the job of an attribute like class on an element?",
            options: [
              { id: "q2-a", label: "It changes the tag name." },
              { id: "q2-b", label: "It adds extra information used by CSS/JS." },
              { id: "q2-c", label: "It makes the element disappear." },
              { id: "q2-d", label: "It turns the element into a list item." },
            ],
            correctOptionId: "q2-b",
            explanation: "Attributes provide extra data or hooks for styling and scripts.",
          },
        ],
      };
    case "2.7":
      return {
        id: "quiz-2-7",
        title: "Boilerplate essentials",
        questions: [
          {
            id: "q1",
            prompt: "Which declaration tells the browser you are writing modern HTML?",
            options: [
              { id: "q1-a", label: "<!DOCTYPE html>" },
              { id: "q1-b", label: "<doctype>" },
              { id: "q1-c", label: "<html5>" },
              { id: "q1-d", label: "<header>" },
            ],
            correctOptionId: "q1-a",
            explanation: "The <!DOCTYPE html> declaration sets standards mode for HTML5.",
          },
          {
            id: "q2",
            prompt: "Where do you put the page title and meta tags?",
            options: [
              { id: "q2-a", label: "Inside <body>" },
              { id: "q2-b", label: "Inside <head>" },
              { id: "q2-c", label: "Inside <footer>" },
              { id: "q2-d", label: "Anywhere in the document" },
            ],
            correctOptionId: "q2-b",
            explanation: "<head> holds metadata like <title> and <meta> tags.",
          },
        ],
      };
    case "2.10":
      return {
        id: "quiz-2-10",
        title: "Links and images essentials",
        questions: [
          {
            id: "q1",
            prompt: "Which attribute is required on an <a> tag for navigation?",
            options: [
              { id: "q1-a", label: "src" },
              { id: "q1-b", label: "alt" },
              { id: "q1-c", label: "href" },
              { id: "q1-d", label: "lang" },
            ],
            correctOptionId: "q1-c",
            explanation: "href defines the destination of the link.",
          },
          {
            id: "q2",
            prompt: "Why must images include alt text?",
            options: [
              { id: "q2-a", label: "For faster loading" },
              { id: "q2-b", label: "Accessibility and graceful fallback" },
              { id: "q2-c", label: "To change the file format" },
              { id: "q2-d", label: "To enable JavaScript" },
            ],
            correctOptionId: "q2-b",
            explanation: "Alt text helps screen readers and appears when images cannot load.",
          },
        ],
      };
    case "2.0":
      return {
        id: "quiz-2-0",
        title: "Check your understanding of HTML + CSS basics",
        questions: [
          {
            id: "q1",
            prompt: "What is the primary role of HTML?",
            options: [
              { id: "q1-a", label: "Define structure and meaning of content" },
              { id: "q1-b", label: "Handle database queries" },
              { id: "q1-c", label: "Define animations only" },
              { id: "q1-d", label: "Replace the browser entirely" },
            ],
            correctOptionId: "q1-a",
            explanation:
              "HTML structures the page: headings, paragraphs, lists, forms, etc.",
          },
          {
            id: "q2",
            prompt: "What does CSS control?",
            options: [
              { id: "q2-a", label: "Server routes" },
              { id: "q2-b", label: "Visual presentation (layout, colors, spacing)" },
              { id: "q2-c", label: "Binary compilation" },
              { id: "q2-d", label: "Database indexing" },
            ],
            correctOptionId: "q2-b",
            explanation:
              "CSS handles the look and feel: sizing, spacing, colors, typography, layout.",
          },
          {
            id: "q3",
            prompt: "How do HTML and CSS usually work together?",
            options: [
              { id: "q3-a", label: "CSS files are ignored by browsers" },
              { id: "q3-b", label: "HTML links to CSS, and the browser applies styles to matching elements" },
              { id: "q3-c", label: "CSS replaces HTML entirely" },
              { id: "q3-d", label: "They cannot be used in the same project" },
            ],
            correctOptionId: "q3-b",
            explanation:
              "CSS rules target HTML elements (by tag, class, id, etc.). The browser combines them to render the page.",
          },
        ],
      };
    case "2.1":
      return {
        id: "quiz-2-1",
        title: "Check your understanding of basic HTML structure",
        questions: [
          {
            id: "q1",
            prompt: "What is the correct order of the main HTML tags in a page?",
            options: [
              {
                id: "q1-a",
                label: "<html> inside <body> inside <head>",
              },
              {
                id: "q1-b",
                label: "<head> and <body> are siblings inside <html>",
              },
              {
                id: "q1-c",
                label: "<body> and <html> are inside <head>",
              },
              {
                id: "q1-d",
                label: "There is no required structure.",
              },
            ],
            correctOptionId: "q1-b",
            explanation:
              "The root is <html>, and inside it you have two main children: <head> and <body>.",
          },
          {
            id: "q2",
            prompt: "Which tag is the best for the main title of the page?",
            options: [
              { id: "q2-a", label: "<p>" },
              { id: "q2-b", label: "<h1>" },
              { id: "q2-c", label: "<div>" },
              { id: "q2-d", label: "<span>" },
            ],
            correctOptionId: "q2-b",
            explanation:
              "<h1> is the main heading of the page. It gives structure and helps screen readers and search engines understand the page.",
          },
          {
            id: "q3",
            prompt: "What is the purpose of the <head> element?",
            options: [
              {
                id: "q3-a",
                label: "To show visible content like text and images.",
              },
              {
                id: "q3-b",
                label:
                  "To contain metadata, title, and links to styles or scripts.",
              },
              {
                id: "q3-c",
                label: "To display the main navigation menu.",
              },
              {
                id: "q3-d",
                label: "It has no purpose, it is optional and unused.",
              },
            ],
            correctOptionId: "q3-b",
            explanation:
              "The <head> contains information about the document itself: title, meta tags, links to CSS, etc.",
          },
        ],
      };
    case "2.2":
      return {
        id: "quiz-2-2",
        title: "Check your understanding of semantic HTML",
        questions: [
          {
            id: "q1",
            prompt:
              "Which tag is most appropriate for the main navigation links of a site?",
            options: [
              { id: "q1-a", label: "<div>" },
              { id: "q1-b", label: "<nav>" },
              { id: "q1-c", label: "<section>" },
              { id: "q1-d", label: "<article>" },
            ],
            correctOptionId: "q1-b",
            explanation:
              "<nav> clearly tells the browser and assistive tech that this area holds navigation links.",
          },
          {
            id: "q2",
            prompt:
              "If you have a block of content that could stand alone (like a blog post), which tag is best?",
            options: [
              { id: "q2-a", label: "<article>" },
              { id: "q2-b", label: "<section>" },
              { id: "q2-c", label: "<aside>" },
              { id: "q2-d", label: "<span>" },
            ],
            correctOptionId: "q2-a",
            explanation:
              "<article> is for self-contained pieces of content that could be reused or syndicated.",
          },
          {
            id: "q3",
            prompt:
              "Why does semantic HTML matter for GAIA and for future-you?",
            options: [
              {
                id: "q3-a",
                label:
                  "It makes the code bigger and more complex, which is fun.",
              },
              {
                id: "q3-b",
                label:
                  "It makes the structure clearer, improves accessibility, and makes it easier for tools (and your brain) to understand pages.",
              },
              {
                id: "q3-c",
                label: "It is required or the browser will not render the page.",
              },
              {
                id: "q3-d",
                label: "It is only for SEO and does not affect you.",
              },
            ],
            correctOptionId: "q3-b",
            explanation:
              "Semantic HTML is about meaning. It makes your pages easier to maintain, extend, and connect into systems like GAIA.",
          },
        ],
      };
    case "2.3":
      return {
        id: "quiz-2-3",
        title: "Check your understanding of links and navigation",
        questions: [
          {
            id: "q1",
            prompt: "Which tag is used to create a hyperlink in HTML?",
            options: [
              { id: "q1-a", label: "<link>" },
              { id: "q1-b", label: "<a>" },
              { id: "q1-c", label: "<href>" },
              { id: "q1-d", label: "<nav>" },
            ],
            correctOptionId: "q1-b",
            explanation:
              "The <a> tag (anchor) is used to create hyperlinks. The href attribute tells the browser where the link goes.",
          },
          {
            id: "q2",
            prompt:
              "What is the purpose of the href attribute on an <a> tag?",
            options: [
              { id: "q2-a", label: "To set the hover color" },
              { id: "q2-b", label: "To specify the destination URL or path" },
              { id: "q2-c", label: "To make the text bold" },
              { id: "q2-d", label: "To change the font family" },
            ],
            correctOptionId: "q2-b",
            explanation:
              "href is short for 'hypertext reference'. It tells the browser where this link should take the user.",
          },
          {
            id: "q3",
            prompt:
              "Which is a good example of a relative link inside a GAIA-style project?",
            options: [
              { id: "q3-a", label: "<a href=\"https://gaia.com\">GAIA</a>" },
              {
                id: "q3-b",
                label: "<a href=\"/apollo/academy\">Academy</a>",
              },
              {
                id: "q3-c",
                label: "<a href=\"C:\\Users\\file.html\">File</a>",
              },
              {
                id: "q3-d",
                label: "<a href=\"mailto:sasa@example.com\">Mail</a>",
              },
            ],
            correctOptionId: "q3-b",
            explanation:
              "In a web app, /apollo/academy is a relative path on the same site. It is how you link between GAIA pages.",
          },
        ],
      };
    case "2.4":
      return {
        id: "quiz-2-4",
        title: "Check your understanding of images and alt text",
        questions: [
          {
            id: "q1",
            prompt: "Which tag is used to display an image in HTML?",
            options: [
              { id: "q1-a", label: "<image>" },
              { id: "q1-b", label: "<img>" },
              { id: "q1-c", label: "<pic>" },
              { id: "q1-d", label: "<src>" },
            ],
            correctOptionId: "q1-b",
            explanation:
              "The <img> tag is used to embed images. It is a self-closing tag that uses src and alt attributes.",
          },
          {
            id: "q2",
            prompt: "Why is the alt attribute important on <img>?",
            options: [
              { id: "q2-a", label: "It makes the image bigger" },
              { id: "q2-b", label: "It is required by the browser" },
              {
                id: "q2-c",
                label:
                  "It provides a text description for screen readers and when the image cannot load.",
              },
              { id: "q2-d", label: "It sets the file size of the image" },
            ],
            correctOptionId: "q2-c",
            explanation:
              "alt text is critical for accessibility. It tells people using screen readers what the image represents, and it appears when the image fails to load.",
          },
          {
            id: "q3",
            prompt:
              "Which of these is the best alt text for a GAIA logo image?",
            options: [
              { id: "q3-a", label: "image1234" },
              { id: "q3-b", label: "logo" },
              { id: "q3-c", label: "GAIA leaf logo" },
              { id: "q3-d", label: "" },
            ],
            correctOptionId: "q3-c",
            explanation:
              "Good alt text describes the content and purpose: 'GAIA leaf logo' is clear and specific without being too long.",
          },
        ],
      };
    case "2.5":
      return {
        id: "quiz-2-5",
        title: "Check your understanding of HTML forms",
        questions: [
          {
            id: "q1",
            prompt: "Which tag wraps a group of inputs that are submitted together?",
            options: [
              { id: "q1-a", label: "<input>" },
              { id: "q1-b", label: "<label>" },
              { id: "q1-c", label: "<form>" },
              { id: "q1-d", label: "<fieldset>" },
            ],
            correctOptionId: "q1-c",
            explanation:
              "<form> groups inputs together and defines where the data will be sent when the user submits.",
          },
          {
            id: "q2",
            prompt: "What is the main purpose of a <label> element?",
            options: [
              { id: "q2-a", label: "To display helper text inside an input" },
              {
                id: "q2-b",
                label:
                  "To provide a caption that is associated with a specific input field.",
              },
              { id: "q2-c", label: "To store the value of an input" },
              { id: "q2-d", label: "To submit the form" },
            ],
            correctOptionId: "q2-b",
            explanation:
              "A <label> is tied to an input by id/for or by wrapping. It makes forms easier to use, especially for screen readers.",
          },
          {
            id: "q3",
            prompt:
              "Which attribute on <input> defines what kind of data the field expects?",
            options: [
              { id: "q3-a", label: "name" },
              { id: "q3-b", label: "type" },
              { id: "q3-c", label: "value" },
              { id: "q3-d", label: "placeholder" },
            ],
            correctOptionId: "q3-b",
            explanation:
              "The type attribute (text, email, password, number, etc.) tells the browser how to treat and validate the input.",
          },
        ],
      };
    default:
      return null;
  }
}

export function getHtmlPractice(lessonCode: string): PracticePrompt | null {
  switch (lessonCode) {
    case "2.6":
      return {
        title: "Tag spotting",
        description: "Practice picking the right element for the right job.",
        instructions: [
          "List five HTML elements and write one sentence about when to use each.",
          "Rewrite a short paragraph of mixed content using proper headings and paragraphs instead of only <div> tags.",
          "Add one attribute example (like class) to show how you would style an element.",
        ],
      };
    case "2.7":
      return {
        title: "Write the boilerplate",
        description: "Assemble a complete HTML5 boilerplate from memory.",
        instructions: [
          "Write <!DOCTYPE html>, <html>, <head>, and <body> with proper nesting.",
          "Inside <head>, include <meta charset=\"UTF-8\"> and a <title> like \"GAIA Recipes\".",
          "Inside <body>, add a main heading and a short paragraph placeholder.",
        ],
      };
    case "2.8":
      return {
        title: "Format text with meaning",
        description: "Turn a rough outline into well-structured text.",
        instructions: [
          "Create a small section with an <h1>, two <h2>s, and at least three <p> paragraphs.",
          "Use <em> and <strong> once each to emphasize important words.",
          "Keep the content GAIA-themed (study notes or reflections).",
        ],
      };
    case "2.9":
      return {
        title: "Build clean lists",
        description: "Organize information into readable lists.",
        instructions: [
          "Write one unordered list (<ul>) with at least four items.",
          "Write one ordered list (<ol>) with at least three steps.",
          "Optional: add a nested list for a sub-step.",
        ],
      };
    case "2.10":
      return {
        title: "Links and images refresh",
        description: "Practice adding links and images with the right attributes.",
        instructions: [
          "Create two links: one internal (like /apollo/academy) and one external (like https://developer.mozilla.org).",
          "Add two images with realistic src placeholders and descriptive alt text.",
          "Explain in a short sentence where each link goes.",
        ],
      };
    case "2.11":
      return {
        title: "Write three commit messages",
        description: "Draft messages you would actually use for HTML changes.",
        instructions: [
          "Write three commit messages in imperative mood (for example: \"Add recipe index page\").",
          "For each, add one sentence describing the change.",
          "Keep them short (50 characters for the subject is a good target).",
        ],
      };
    case "2.12":
      return {
        title: "Project: Recipes",
        description: "Outline or build your multi-page recipe site.",
        instructions: [
          "Sketch the structure: index page plus at least two recipe pages with headings, lists, and images.",
          "Write the core HTML for one recipe page, including ingredients (list) and steps (ordered list).",
          "Add navigation links between pages and a home link, plus alt text on images.",
        ],
      };
    case "2.0":
      return {
        title: "Name the pieces of a simple page",
        description:
          "Warm up by describing how HTML and CSS cooperate on a tiny page.",
        instructions: [
          "Write a short paragraph explaining what HTML does and what CSS does.",
          "List three HTML elements you already know (for example h1, p, a) and one CSS property you would use on each.",
          "Describe where you would place a link tag to connect CSS in a basic HTML document.",
        ],
      };
    case "2.1":
      return {
        title: "Build a clean HTML skeleton",
        description:
          "Now you will write a complete, simple HTML page by hand. Focus on structure and correctness, not on design.",
        instructions: [
          "In the practice box below, write a full HTML document with <!DOCTYPE html>, <html>, <head>, and <body>. In <head>, include a <title> like \"GAIA - HTML Foundations\".",
          "Inside <body>, create a main <h1> heading, at least two <h2> subheadings, some <p> paragraphs, and one unordered list (<ul>) with 3-5 items.",
          "When you are done, click \"Check practice & mark lesson\". GAIA will quickly check if the required tags exist before it marks the lesson completed.",
          "Project pattern: First, build this page completely alone. Later, you can ask AI to review your HTML and suggest improvements for readability and structure.",
        ],
      };
    case "2.2":
      return {
        title: "Refactor a layout using semantic tags",
        description:
          "Here you will practice replacing generic containers with semantic HTML to make the structure clearer.",
        instructions: [
          "In the practice box below, write a simple layout that represents a page with header, navigation, main content area, and footer using semantic tags.",
          "Use <header>, <nav>, <main>, <section> or <article>, and <footer> at minimum.",
          "When you are done, click \"Check practice & mark lesson\". GAIA will check for these semantic tags before it marks the lesson completed.",
        ],
      };
    case "2.3":
      return {
        title: "Build a simple GAIA-style navigation",
        description:
          "Now you will practice creating real links that could exist inside GAIA, both internal and external.",
        instructions: [
          "In the practice box below, write a small HTML snippet for a navigation area with at least three links.",
          "Include at least one internal link (for example /apollo/academy or /health) and at least one external link (for example a YouTube tutorial).",
          "When you are done, click \"Check practice & mark lesson\". GAIA will check that you are actually using <a> tags with href attributes.",
        ],
      };
    case "2.4":
      return {
        title: "Embed images with meaningful alt text",
        description:
          "Here you will practice writing <img> tags that would make sense inside GAIA, with good alt text.",
        instructions: [
          "In the practice box below, write HTML that includes at least two <img> elements.",
          "Give each image a realistic src (you can use placeholder paths like /images/gaia-logo.png) and a clear alt description (for example \"GAIA leaf logo\").",
          "When you are done, click \"Check practice & mark lesson\". GAIA will check that you used <img> with alt attributes.",
        ],
      };
    case "2.5":
      return {
        title: "HTML mini project: GAIA daily note form",
        description:
          "This is the wrap-up mini project for the HTML arc. You will combine structure, semantics, links, and a simple form into one small GAIA-style page.",
        instructions: [
          "Build a full HTML page for a \"GAIA Daily Note\". Use <!DOCTYPE html>, <html>, <head>, and <body> with a clear <title>.",
          "In the body, create a semantic layout with <header>, <nav>, <main>, and <footer>. In the nav, include links like \"Health\", \"Wealth\", \"Academy\", etc.",
          "Inside <main>, add a form for a daily note with at least: a text input for a title, a textarea for the note, and maybe a select or radio buttons for mood.",
          "Add at least one image (for example a GAIA logo) with good alt text.",
          "Project pattern A (solo): Try to build this whole page alone without AI. Only check the docs if you completely forget a tag.",
          "Project pattern B (with AI): Later, ask AI to review your page and help you refactor it for better semantics and accessibility.",
        ],
      };
    default:
      return null;
  }
}

export function validateHtmlPractice(
  lessonCode: string,
  content: string
): PracticeCheckResult | null {
  const src = content.toLowerCase();

  const lengthChecked = new Set([
    "2.6",
    "2.7",
    "2.8",
    "2.9",
    "2.10",
    "2.11",
    "2.12",
  ]);
  if (lengthChecked.has(lessonCode)) {
    if (content.trim().length < 200) {
      return {
        ok: false,
        message: "Add a bit more detail (aim for at least 200 characters).",
      };
    }
    return { ok: true };
  }

  if (lessonCode === "2.0") {
    if (content.trim().length < 200) {
      return {
        ok: false,
        message:
          "Write at least a short paragraph plus your element/property list so future-you can follow it.",
      };
    }
    return { ok: true };
  }

  if (lessonCode === "2.1") {
    const required = [
      "<!doctype html",
      "<html",
      "<head",
      "<body",
      "<h1",
      "<h2",
      "<ul",
      "<li",
    ];
    const missing = required.filter((snippet) => !src.includes(snippet));
    if (missing.length > 0) {
      return {
        ok: false,
        message:
          "Your HTML skeleton is missing some required pieces: " +
          missing.join(", "),
      };
    }
    return { ok: true };
  }

  if (lessonCode === "2.2") {
    const required = ["<header", "<nav", "<main", "<footer"];
    const missing = required.filter((snippet) => !src.includes(snippet));
    if (missing.length > 0) {
      return {
        ok: false,
        message:
          "Your semantic layout is missing some required tags: " +
          missing.join(", "),
      };
    }
    return { ok: true };
  }

  if (lessonCode === "2.3") {
    const required = ["<a", "href="];
    const missing = required.filter((snippet) => !src.includes(snippet));
    if (missing.length > 0) {
      return {
        ok: false,
        message:
          "Your navigation is missing some required link pieces: " +
          missing.join(", "),
      };
    }
    return { ok: true };
  }

  if (lessonCode === "2.4") {
    const required = ["<img", "alt="];
    const missing = required.filter((snippet) => !src.includes(snippet));
    if (missing.length > 0) {
      return {
        ok: false,
        message:
          "Your images are missing some required pieces: " +
          missing.join(", "),
      };
    }
    return { ok: true };
  }

  if (lessonCode === "2.5") {
    const required = ["<form", "<label", "<input"];
    const missing = required.filter((snippet) => !src.includes(snippet));
    if (missing.length > 0) {
      return {
        ok: false,
        message:
          "Your GAIA Daily Note form is missing some required pieces: " +
          missing.join(", "),
      };
    }
    return { ok: true };
  }

  return null;
}
