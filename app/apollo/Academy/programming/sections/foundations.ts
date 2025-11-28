import {
  StudyDescription,
  QuizConfig,
  PracticePrompt,
  PracticeCheckResult,
} from "../lessonTypes";

export function getFoundationsStudy(lessonCode: string): StudyDescription | null {
  switch (lessonCode) {
    case "0.1":
      return {
        title: "Computer Basics: Files, Folders, and Comfort",
        paragraphs: [
          "Before touching code, get comfortable with the basics: files, folders, paths, and how to navigate them. Most errors early on come from being in the wrong folder or not knowing where a file lives.",
          "Practice seeing your machine as a tree: a root (C:\\ or /), then folders (like /Users/sasa or C:\\Users\\Sasa), then project folders (like gaia), then files inside.",
          "Learn simple moves: create a folder, rename it, copy a file path, unzip a download, and delete safely. This confidence removes a lot of friction later.",
        ],
      };
    case "0.2":
      return {
        title: "How Does the Web Work? (First look)",
        paragraphs: [
          "The web is a conversation. Your browser (client) sends a request to a server. The server responds with HTML, CSS, JS, or data. The browser renders the response.",
          "Every GAIA surface you build will rely on this loop: request, response, render. Understanding this at a high level makes later topics less mysterious.",
          "You do not need to memorize protocols today. You just need to see the shape of the flow: client → request → server → response → browser renders.",
        ],
      };
    case "0.3":
      return {
        title: "Installation Overview",
        paragraphs: [
          "You will install a few core tools: a modern browser (Chrome/Firefox), Node.js (runtime + npm), Git (version control), and VS Code (editor).",
          "Keep everything organized in a single workspace folder (for example C:\\gaia or ~/gaia). Your projects and repos will live inside it.",
          "This lesson is an overview of what you will install and why, so the actual install steps feel calmer.",
        ],
      };
    case "0.4":
      return {
        title: "Installations (do the setup)",
        paragraphs: [
          "Now you actually install: download Node.js LTS, install Git, install VS Code, and make sure your browser is up to date.",
          "After each install, verify with simple commands: node -v, npm -v, git --version. In VS Code, install the official ESLint and Prettier extensions.",
          "Once you see the versions and the editor opens cleanly, you have a working base for the rest of the path.",
        ],
      };
    case "0.5":
      return {
        title: "Text Editors",
        paragraphs: [
          "Your editor is home base. VS Code gives you a file tree, tabs, search, terminal, and extensions. Learning a few shortcuts will save hours later.",
          "Key moves: open folder (Ctrl/Cmd+O), open file (Ctrl/Cmd+P), search in files (Ctrl/Cmd+Shift+F), open terminal (Ctrl/Cmd+`).",
          "A clean editor with the right extensions reduces friction when you start HTML, CSS, JS, and React.",
        ],
      };
    case "0.6":
      return {
        title: "Command Line Basics",
        paragraphs: [
          "The terminal lets you move through folders, run npm scripts, and use Git. You mainly need a small set of commands: pwd, ls/dir, cd, mkdir, rm, and code .",
          "Respect the current working directory. Most mistakes come from running a command in the wrong folder. Check with pwd before running important commands.",
          "Once you are comfortable moving around, later steps like running dev servers or database migrations will feel familiar.",
        ],
      };
    case "0.7":
      return {
        title: "Setting up Git",
        paragraphs: [
          "Git tracks your changes so you can experiment safely. First-time setup: configure your name and email (git config --global user.name and user.email) and set your default branch name (often main).",
          "Create a test folder, run git init, and make a .gitignore to avoid committing node_modules or environment files.",
          "Once Git is configured, every GAIA project can be versioned without extra friction.",
        ],
      };
    case "0.8":
      return {
        title: "Introduction to Git",
        paragraphs: [
          "Learn the core Git cycle: status → add → commit. Status shows what changed, add stages files, commit saves a checkpoint with a message.",
          "Commits are snapshots. Small, frequent commits make it easy to undo mistakes or understand history later.",
          "You will start local only. Remote pushes can come later; for now, focus on forming the habit of committing your work.",
        ],
      };
    case "0.9":
      return {
        title: "Git Basics: Branches and Logs",
        paragraphs: [
          "Branches let you experiment without breaking main. git branch shows branches, git checkout -b creates one, git merge brings changes back.",
          "git log shows history; git diff shows what changed. These tools help you debug and explain your work to yourself or a teammate.",
          "With these basics, you can keep GAIA code safe while you learn new modules.",
        ],
      };
    case "1.1":
      return {
        title: "How the Web and Browsers Work",
        paragraphs: [
          "In this first lesson, you are not expected to code yet. The goal is to see the whole map before we walk the road.",
          "When you type a URL in your browser, you are acting as a client. The browser sends a request over the internet to a server. That server finds the right data (a page, JSON, etc.), and sends a response back. Your browser then takes that response and renders it into something you can see and interact with.",
          "For GAIA, this matters because everything you will build - from a tiny HTML page to a full Next.js plus Supabase app - is built on top of this simple idea: clients send requests, servers send responses.",
          "The goal here is not to memorize every technical word. It is to feel that the web is a conversation between you (the client) and a server somewhere else.",
        ],
      };
    case "1.2":
      return {
        title: "Your Tools: VS Code, Git, and the Terminal",
        paragraphs: [
          "In this lesson, you connect the abstract idea of web development to concrete tools on your machine.",
          "VS Code (or another editor) is where you write and navigate your code. It gives you syntax highlighting, search, extensions, and a tree of your files so you never feel lost.",
          "Git is your time machine. It remembers your changes, lets you create checkpoints (commits), and gives you the freedom to experiment without fear of losing everything.",
          "The terminal is where you run commands: starting dev servers, installing dependencies, using Git, and running scripts. At first it can feel scary, but you will mostly repeat a small set of commands until they feel natural.",
          "For GAIA, these tools become your base camp. Once they feel familiar, every future lesson (HTML, CSS, JS, React, Supabase) will feel lighter.",
        ],
      };
    case "1.3":
      return {
        title: "How to Learn Programming Without Burning Out",
        paragraphs: [
          "This lesson is about your energy and your relationship with learning. You are not a robot. You are Sasa, with a job, family, and a life that is already full.",
          "Instead of trying to be perfect, you will use short, honest sessions - like 30, 45, or 60 minutes - and then stop. The goal is to come back again tomorrow, not to destroy yourself in one heroic night.",
          "You will also learn to separate study time from output time. Study time is for understanding and following along. Output time is for building small things, like GAIA modules, with the knowledge you collected.",
          "Feeling stuck, tired, or emotional does not mean you are bad. It means you are human. The skill we are building is to pause, breathe, adjust the plan, and then continue - slowly but stubbornly.",
          "This mindset is what will carry you from the first HTML tag all the way to connected GAIA apps and, later, your accounting center.",
        ],
      };
    default:
      return null;
  }
}

export function getFoundationsQuiz(lessonCode: string): QuizConfig | null {
  switch (lessonCode) {
    case "1.1":
      return {
        id: "quiz-1-1",
        title: "Check your understanding of how the web works",
        questions: [
          {
            id: "q1",
            prompt:
              "When you type a URL and press Enter, what is the browser actually doing?",
            options: [
              {
                id: "q1-a",
                label: "It opens the file directly from your computer.",
              },
              {
                id: "q1-b",
                label:
                  "It sends a request over the network to a server, then shows the response it gets back.",
              },
              {
                id: "q1-c",
                label: "It asks GAIA for the page and GAIA sends it.",
              },
              {
                id: "q1-d",
                label: "It just reloads the same page every time.",
              },
            ],
            correctOptionId: "q1-b",
            explanation:
              "The browser is a client. It sends an HTTP request over the network to a server, which sends back a response (HTML, JSON, etc.). The browser then renders that response.",
          },
          {
            id: "q2",
            prompt: "What is HTML mainly responsible for?",
            options: [
              { id: "q2-a", label: "Styling and colors" },
              { id: "q2-b", label: "Storing data in a database" },
              { id: "q2-c", label: "Structure and meaning of the content" },
              { id: "q2-d", label: "Handling user clicks and keyboard input" },
            ],
            correctOptionId: "q2-c",
            explanation:
              "HTML defines the structure and meaning of the content: headings, paragraphs, lists, links, etc.",
          },
          {
            id: "q3",
            prompt: "Which of these is the best description of CSS?",
            options: [
              {
                id: "q3-a",
                label: "The language that defines logic and user interaction.",
              },
              {
                id: "q3-b",
                label: "The language that defines structure and content.",
              },
              {
                id: "q3-c",
                label:
                  "The language that defines the visual presentation (layout, colors, spacing).",
              },
              {
                id: "q3-d",
                label: "A database language for saving information.",
              },
            ],
            correctOptionId: "q3-c",
            explanation:
              "CSS controls how things look: layout, colors, typography, spacing, etc.",
          },
          {
            id: "q4",
            prompt: "Where does JavaScript run in a normal web app?",
            options: [
              { id: "q4-a", label: "Only on the server" },
              {
                id: "q4-b",
                label:
                  "Inside the browser, and sometimes on the server too (for example with Node.js).",
              },
              { id: "q4-c", label: "Inside the database" },
              {
                id: "q4-d",
                label: "It does not actually run, it is only for comments.",
              },
            ],
            correctOptionId: "q4-b",
            explanation:
              "JavaScript can run in the browser (frontend) and also on the server (backend, like Node.js), but in this track we start with the browser.",
          },
        ],
      };
    case "1.2":
      return {
        id: "quiz-1-2",
        title: "Check your understanding of tools and setup",
        questions: [
          {
            id: "q1",
            prompt: "What is the main job of a code editor like VS Code?",
            options: [
              {
                id: "q1-a",
                label: "To run your entire application in production.",
              },
              {
                id: "q1-b",
                label:
                  "To help you write, navigate, and manage your code files comfortably.",
              },
              {
                id: "q1-c",
                label: "To act as a replacement for the browser.",
              },
              {
                id: "q1-d",
                label: "To store your backups for you.",
              },
            ],
            correctOptionId: "q1-b",
            explanation:
              "The editor is your workspace. It helps you write and organize code, but it is not the browser, server, or backup system.",
          },
          {
            id: "q2",
            prompt: "Why do we use Git in our workflow?",
            options: [
              {
                id: "q2-a",
                label: "To change the colors of our website.",
              },
              {
                id: "q2-b",
                label:
                  "To track changes, create history, and safely experiment without losing work.",
              },
              {
                id: "q2-c",
                label: "To make websites load faster.",
              },
              {
                id: "q2-d",
                label: "To host images and videos.",
              },
            ],
            correctOptionId: "q2-b",
            explanation:
              "Git is version control: it keeps history of your changes, lets you go back in time, and experiment safely in branches.",
          },
          {
            id: "q3",
            prompt:
              "What is the terminal mainly used for in web development?",
            options: [
              {
                id: "q3-a",
                label: "Browsing social media without a browser.",
              },
              {
                id: "q3-b",
                label:
                  "Running commands like npm, git, and local dev servers.",
              },
              {
                id: "q3-c",
                label: "Editing images and videos.",
              },
              {
                id: "q3-d",
                label: "It has no real use; it is just for hackers.",
              },
            ],
            correctOptionId: "q3-b",
            explanation:
              "The terminal is where you run commands: installing dependencies, starting dev servers, using Git, running linters, etc.",
          },
          {
            id: "q4",
            prompt:
              "Why is it important to keep your project in a dedicated folder (workspace)?",
            options: [
              {
                id: "q4-a",
                label:
                  "Because VS Code refuses to open files from other folders.",
              },
              {
                id: "q4-b",
                label:
                  "So tools like Git, linters, and dev servers know exactly which files belong to this project.",
              },
              {
                id: "q4-c",
                label: "It makes the website faster in production.",
              },
              {
                id: "q4-d",
                label: "It does not matter at all; any file can be anywhere.",
              },
            ],
            correctOptionId: "q4-b",
            explanation:
              "Keeping everything in a project folder makes it easy for tools to understand the structure and for you to keep things tidy.",
          },
        ],
      };
    case "1.3":
      return {
        id: "quiz-1-3",
        title: "Check your plan for learning without burning out",
        questions: [
          {
            id: "q1",
            prompt:
              "What is the main idea of working in short, focused sessions (like 30-60 minutes)?",
            options: [
              {
                id: "q1-a",
                label: "To finish the whole track in one week.",
              },
              {
                id: "q1-b",
                label:
                  "To give your brain a clear sprint, then rest, so you can come back again tomorrow.",
              },
              {
                id: "q1-c",
                label: "To avoid ever taking breaks.",
              },
              {
                id: "q1-d",
                label:
                  "To impress other people with how long you study.",
              },
            ],
            correctOptionId: "q1-b",
            explanation:
              "Short, focused sessions plus rest is sustainable. It is designed so you can keep coming back instead of burning out.",
          },
          {
            id: "q2",
            prompt:
              "When you feel stuck on a lesson, what is the healthiest first step?",
            options: [
              {
                id: "q2-a",
                label:
                  "Insult yourself and force yourself to stay longer.",
              },
              {
                id: "q2-b",
                label: "Close everything and never come back.",
              },
              {
                id: "q2-c",
                label:
                  "Take a short break, breathe, maybe walk, then come back and ask smaller questions.",
              },
              {
                id: "q2-d",
                label:
                  "Immediately start a completely new topic.",
              },
            ],
            correctOptionId: "q2-c",
            explanation:
              "A small reset plus breaking the problem into smaller questions keeps you moving without destroying your mood.",
          },
          {
            id: "q3",
            prompt:
              "Why is tracking your progress (like GAIA does) helpful for motivation?",
            options: [
              {
                id: "q3-a",
                label:
                  "Because then you can compare yourself to everyone else online.",
              },
              {
                id: "q3-b",
                label:
                  "Because you can see proof that you are moving, even if it is one small lesson at a time.",
              },
              {
                id: "q3-c",
                label: "It is not helpful at all.",
              },
              {
                id: "q3-d",
                label: "Only so others can judge your numbers.",
              },
            ],
            correctOptionId: "q3-b",
            explanation:
              "Progress tracking is for you: it reminds you that every small session is real movement, not just nothing.",
          },
        ],
      };
    default:
      return null;
  }
}

export function getFoundationsPractice(lessonCode: string): PracticePrompt | null {
  switch (lessonCode) {
    case "0.1":
      return {
        title: "Map your folders and paths",
        description:
          "Show that you can think in folders and paths, not just icons. Write out where your GAIA workspace will live and how you will reach it.",
        instructions: [
          "Write the full path to the folder you will keep GAIA projects in (for example C:\\gaia or /home/sasa/gaia).",
          "Describe in 3-5 sentences how you create a folder, rename it, and copy its path on your operating system.",
          "List two mistakes you made before with files/folders and how you will avoid them now.",
        ],
      };
    case "0.2":
      return {
        title: "Explain the web flow in your own words",
        description:
          "Capture the client → request → server → response → render flow so future-you remembers the shape.",
        instructions: [
          "Write a short story (6-8 lines) about what happens when you open a page like https://gaia.local.",
          "Mention browser, request, server, response, and HTML/CSS/JS.",
          "Add one example of a request you send daily (like /api/notes) and what the server returns.",
        ],
      };
    case "0.3":
      return {
        title: "List your installations plan",
        description:
          "Decide exactly which tools and versions you will install so there is no guesswork.",
        instructions: [
          "List the tools (browser, Node.js LTS version, Git, VS Code) and where you will download each.",
          "Write 2-3 sentences on why each tool matters for GAIA.",
          "Note one fallback: what you will do if an installer fails (for example, re-download, run as admin, check docs).",
        ],
      };
    case "0.4":
      return {
        title: "Verify your installs",
        description:
          "Prove that Node, npm, and Git are installed by writing down their versions and where you ran the commands.",
        instructions: [
          "After installing, run: node -v, npm -v, git --version. Capture the outputs here.",
          "Write where your GAIA workspace folder lives and confirm you can open it in VS Code (code .).",
          "Add one screenshot note or description of the VS Code extensions you installed (ESLint, Prettier).",
        ],
      };
    case "0.5":
      return {
        title: "Configure your editor",
        description:
          "Document your VS Code setup so you can reproduce it on a new machine later.",
        instructions: [
          "List the extensions you installed (at least ESLint and Prettier).",
          "Write the key shortcuts you will use often: open file, search in files, toggle terminal.",
          "Describe how you will keep your editor clean (for example, light theme vs dark, hiding minimap, format on save).",
        ],
      };
    case "0.6":
      return {
        title: "Command line reps",
        description:
          "Prove you can move around and run a couple of commands without fear.",
        instructions: [
          "Write the commands you ran to: check the current folder (pwd), list files (ls or dir), create a folder (mkdir), and move into it (cd).",
          "Note one thing that confused you and how you solved it (for example, spaces in folder names).",
          "Add the exact command you will use to open VS Code in the current folder (code .).",
        ],
      };
    case "0.7":
      return {
        title: "First Git setup",
        description:
          "Capture the commands you ran to initialize Git and set identity so you never have to guess later.",
        instructions: [
          "Write the git config commands you ran for user.name, user.email, and default branch.",
          "Describe the contents of your .gitignore (at least node_modules, .env, .next).",
          "Explain in 3-4 sentences why you want Git even when working solo.",
        ],
      };
    case "0.8":
      return {
        title: "Your first commits",
        description:
          "Show you can run the Git cycle: status → add → commit.",
        instructions: [
          "Describe the steps you took to make an initial commit in a test project (git status, git add ., git commit -m \"message\").",
          "Write the commit message you used and why.",
          "Note one thing that surprised you about Git status or staged files.",
        ],
      };
    case "0.9":
      return {
        title: "Branching and logs practice",
        description:
          "Record a small branch experiment and what you saw in git log.",
        instructions: [
          "Write the commands you ran to create a branch (git checkout -b) and switch back.",
          "Describe what git log showed after a couple of commits and how you read it.",
          "Add one idea for how you will use branches in GAIA (for example, feature/ask-panel).",
        ],
      };
    case "1.1":
      return {
        title: "Describe the journey of a web request",
        description:
          "Here we want to check that you can explain in your own words what is happening when you load a page. This is not about perfect English. It is about you understanding the flow.",
        instructions: [
          "In the box below, write a short explanation (at least 5-6 lines) of what happens when you type a URL in the browser and press Enter.",
          "Mention: the browser, the server, the request, the response, and HTML/CSS/JS.",
          "Imagine you are explaining this to a future version of yourself who forgot everything.",
          "Project pattern: First, write it fully by yourself. Later, you can ask AI to help you re-write it more clearly and compare the two versions.",
        ],
      };
    case "1.2":
      return {
        title: "Describe your tools and create your workspace plan",
        description:
          "We want you to be clear about what tools you will use and how you will open them, so there is less friction next time you sit to study.",
        instructions: [
          "In the box below, write which editor you will use (for example VS Code) and where your GAIA projects will live on your machine (for example C:\\gaia or /home/sasa/gaia).",
          "Write 3-5 sentences describing what Git will do for you and why you will use it, even if you are the only person working on GAIA.",
          "Write 2-3 sentences about the terminal: which commands you expect to run often (npm run dev, git status, etc.).",
          "Project pattern: Do this first alone. Later, you can ask AI to suggest improvements to your workflow and folder structure and compare ideas.",
        ],
      };
    case "1.3":
      return {
        title: "Design your realistic study rhythm (Foundations mini project)",
        description:
          "Here you will transform your ideas about learning into a small contract with yourself that GAIA and I will help you respect. This acts as the mini project for the Foundations arc.",
        instructions: [
          "Write down your ideal weekly rhythm: for example, three days programming (30 / 45 / 60 minutes) and three days accounting, plus Friday for self-repair.",
          "Write, honestly, what usually breaks this rhythm for you (tiredness, mood, family, work). Do not judge yourself; just describe.",
          "Finally, write 3 small rules you promise to follow when you feel low (for example: I will still open GAIA, I will do 10-15 minutes, and then I am allowed to rest with no guilt).",
          "Project pattern A (solo): Save this as your personal contract and follow it for at least 2-3 weeks without asking AI to change it.",
          "Project pattern B (with AI): After you test it alone, you can come back later and ask AI to help you optimize or adjust this rhythm based on what actually happened.",
        ],
      };
    default:
      return null;
  }
}

export function validateFoundationsPractice(
  lessonCode: string,
  content: string
): PracticeCheckResult | null {
  const lengthChecked = new Set([
    "0.1",
    "0.2",
    "0.3",
    "0.4",
    "0.5",
    "0.6",
    "0.7",
    "0.8",
    "0.9",
    "1.1",
    "1.2",
    "1.3",
  ]);

  if (lengthChecked.has(lessonCode)) {
    if (content.trim().length < 250) {
      return {
        ok: false,
        message:
          "Write a bit more so future-you can really understand it. Aim for at least 250 characters.",
      };
    }
    return { ok: true };
  }
  return null;
}
