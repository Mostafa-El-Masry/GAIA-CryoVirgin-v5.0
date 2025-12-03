import {
  StudyDescription,
  QuizConfig,
  PracticePrompt,
  PracticeCheckResult,
} from "../lessonTypes";

export function getFoundationsStudy(lessonCode: string): StudyDescription | null {
  switch (lessonCode) {
    case "0.0":
      return {
        title: "A Short History of Programming",
        videoUrl: "https://www.youtube.com/watch?v=OwS9aTE2Go4",
        paragraphs: [
          "Before we write any code, zoom out and see where programming came from. In the 1800s, Ada Lovelace wrote the first published algorithm for Babbage’s Analytical Engine — showing a machine could follow precise instructions.",
          "Early computers used punched cards (inspired by the Jacquard loom) to feed instructions. Those cards led to low-level assembly languages that talked almost directly to hardware.",
          "High-level languages arrived to make humans more productive: FORTRAN and COBOL in the 1950s for math and business, then C in the 1970s, which still shapes modern languages like C++, Go, and Rust.",
          "The personal-computer era (1970s-80s) and the internet (1990s) exploded the need for accessible languages. HTML, CSS, and JavaScript emerged so people could publish and interact on the web.",
          "Open-source communities (Linux, Python, PHP, Ruby, JavaScript ecosystems) made it normal to share code freely and improve it together. Modern package managers like npm and bundlers build on this culture.",
          "Read The Odin Project Foundations \"History of the Web\" to see how the internet’s growth pulled programming forward. It uses simple language and free references.",
          "Skim Codecademy’s free blog article \"A Brief History of Programming Languages\" (or similar free history pieces). It retells the same story with short, approachable examples.",
          "Optional extra: browse freeCodeCamp’s timeline-style articles on computing history to hear the same milestones in another voice. Multiple sources help the narrative stick.",
          "Keep one idea: programming is about giving clear instructions. Over time, languages improved so humans could express those instructions more easily — the principle stays the same.",
        ],
      };
    case "0.1":
      return {
        title: "What Is Programming? Computer Basics, Files, and Comfort",
        videoUrl: "https://www.youtube.com/watch?v=O5nskjZ_GoI",
        paragraphs: [
          "Programming is giving clear, step-by-step instructions to a computer so it can do useful work. Computers are fast but literal: if your steps are fuzzy, they fail; if your steps are clear, they repeat them perfectly.",
          "Before any code, feel calm with your machine: know where files live, how to create and rename folders, and how to avoid losing work because you do not know the path.",
          "Imagine teaching someone to make tea. You break the goal into tiny steps: fill kettle, boil water, add a tea bag, wait, then pour. Programming is the same: a vague idea becomes a list of exact moves the computer can follow.",
          "See your file system like a tree: drive or home at the top, a workspace folder inside it (for example, gaia), then one folder per project. Inside each project live your code files. This mental map prevents getting lost.",
          "Practice the simple moves now: create a folder, rename it, move it, delete it safely, and copy its path. Keep all GAIA projects in one workspace so every future command starts from a known place.",
          "Read The Odin Project Foundations intro on \"What is Programming?\" and \"How Does the Web Work?\". They explain these ideas slowly with plain language and pictures.",
          "Skim Codecademy free Code Foundations \"What Is Programming?\" section. It repeats the same ideas with short examples and lets you hear the concepts in another voice.",
          "For another free voice, read a short \"How Computers Work\" primer on freeCodeCamp or Khan Academy. Hearing the same core ideas from multiple places makes them stick.",
          "The goal is comfort: you can explain what programming is, describe your folder map out loud, and feel ready to take the next steps instead of only using other people's apps.",
        ],
      };
    case "0.2":
      return {
        title: "How Does the Web Work? (First look)",
        videoUrl: "https://www.youtube.com/watch?v=AEaKrq3SpW8",
        paragraphs: [
          "The web is a conversation. Your browser (client) sends a request to a server. The server responds with HTML, CSS, JS, or data. The browser renders what comes back.",
          "Every GAIA surface you build uses this loop: client request, server response, browser renders. Seeing this big picture now makes later topics feel less mysterious.",
          "Read The Odin Project Foundations article \"How Does the Web Work?\". It explains requests, responses, and files with calm drawings and short text.",
          "Open Codecademy free \"Intro to Web Development\" lesson on how websites work. It repeats the same ideas and shows how HTML, CSS, and JS arrive together.",
          "Scan the MDN Web Docs page \"How the web works\". It introduces HTTP requests, DNS, and responses in beginner-friendly language without forcing you to memorize jargon.",
          "You do not need to memorize protocols today. You just need the shape: your browser sends a request, a server answers, and the browser paints the result for you.",
          "Practice by describing one real example: when you visit /apollo, your browser requests the page, the server responds with HTML plus links to CSS and JS, and the browser uses them to build what you see.",
        ],
      };
    case "0.3":
      return {
        title: "Installation Overview",
        videoUrl: "https://www.youtube.com/watch?v=fBNz5xF-Kx4",
        paragraphs: [
          "You need a small toolkit: a modern browser (Chrome or Firefox), Node.js (runtime plus npm), Git (version control), and VS Code (editor). These four pieces unlock every lesson that follows.",
          "Keep everything organized in one workspace folder (for example C:\\\\gaia or ~/gaia). All projects live there, which keeps commands and paths predictable.",
          "Read The Odin Project Foundations \"Installation Overview\" to see screenshots and why each tool matters. It walks through the same setup for beginners.",
          "Check Codecademy free setup guides (for example \"Install Node\" and \"Set up VS Code\"). They show the same installs in short, calm steps.",
          "Use the official sites when downloading: nodejs.org for Node LTS, git-scm.com for Git, code.visualstudio.com for VS Code. Avoid random mirrors.",
          "Plan a quick verify step after each install: node -v, npm -v, git --version, and opening VS Code with code . from your workspace folder.",
          "If an installer fails, retry the download, run as administrator, or search the official docs first. Small, steady steps beat rushing.",
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

    case "0.0":
      return {
        id: "quiz-0-0",
        title: "Check your understanding of programming history",
        questions: [
          {
            id: "q1",
            prompt:
              "Why is Ada Lovelace often called the first programmer?",
            options: [
              {
                id: "q1-a",
                label: "She wrote one of the earliest algorithms for a mechanical computer (the Analytical Engine).",
              },
              {
                id: "q1-b",
                label: "She invented modern laptops.",
              },
              {
                id: "q1-c",
                label: "She created the internet.",
              },
              {
                id: "q1-d",
                label: "She was the first person to use JavaScript.",
              },
            ],
            correctOptionId: "q1-a",
            explanation:
              "Lovelace described how to instruct Babbage’s Analytical Engine, showing machines could follow step-by-step algorithms.",
          },
          {
            id: "q2",
            prompt:
              "Why were high-level languages like FORTRAN and COBOL created?",
            options: [
              {
                id: "q2-a",
                label: "To make humans write instructions faster and more clearly than raw machine code or punched cards.",
              },
              {
                id: "q2-b",
                label: "To make computers heavier.",
              },
              {
                id: "q2-c",
                label: "To eliminate the need for electricity.",
              },
              {
                id: "q2-d",
                label: "To replace the web browser.",
              },
            ],
            correctOptionId: "q2-a",
            explanation:
              "High-level languages help humans express logic without micromanaging hardware details, boosting productivity.",
          },
          {
            id: "q3",
            prompt:
              "What is one key reason open-source communities matter in programming history?",
            options: [
              {
                id: "q3-a",
                label: "They make it normal to share code, learn from others, and improve tools together for free.",
              },
              {
                id: "q3-b",
                label: "They prevent anyone from writing new code.",
              },
              {
                id: "q3-c",
                label: "They only allow programming on weekends.",
              },
              {
                id: "q3-d",
                label: "They eliminated the need for version control.",
              },
            ],
            correctOptionId: "q3-a",
            explanation:
              "Open-source culture encourages collaboration and reuse, which accelerated modern languages, frameworks, and package ecosystems.",
          },
        ],
      };

    case "0.1":
      return {
        id: "quiz-0-1",
        title: "Check your understanding of what programming is",
        questions: [
          {
            id: "q1",
            prompt:
              "Which description best matches what programming actually is?",
            options: [
              {
                id: "q1-a",
                label: "Giving clear, step-by-step instructions to a computer so it can do useful work.",
              },
              {
                id: "q1-b",
                label: "Randomly clicking on apps until something works.",
              },
              {
                id: "q1-c",
                label: "Only drawing user interface designs.",
              },
              {
                id: "q1-d",
                label: "Buying more expensive hardware.",
              },
            ],
            correctOptionId: "q1-a",
            explanation:
              "Programming is about precise instructions the computer can follow, not just using apps or hardware.",
          },
          {
            id: "q2",
            prompt:
              "Why is the tea-making example useful for understanding programming?",
            options: [
              {
                id: "q2-a",
                label: "Tea and computers use the same technology.",
              },
              {
                id: "q2-b",
                label: "It shows you should always rush to finish tasks.",
              },
              {
                id: "q2-c",
                label: "It shows how a vague goal can be broken down into clear, ordered steps.",
              },
              {
                id: "q2-d",
                label: "It proves you must drink tea to be a programmer.",
              },
            ],
            correctOptionId: "q2-c",
            explanation:
              "Just like making tea, programming turns a vague goal into a series of clear, ordered actions.",
          },
          {
            id: "q3",
            prompt:
              "Why does this lesson spend time on files and folders before writing code?",
            options: [
              {
                id: "q3-a",
                label: "Because file icons are more important than code.",
              },
              {
                id: "q3-b",
                label: "Because feeling calm with where your projects live removes a lot of stress later.",
              },
              {
                id: "q3-c",
                label: "Because you will never actually write code.",
              },
              {
                id: "q3-d",
                label: "Because programming is only about renaming folders.",
              },
            ],
            correctOptionId: "q3-b",
            explanation:
              "If you always know where your projects live, you avoid a huge amount of confusion and anxiety later.",
          },
          {
            id: "q4",
            prompt:
              "Which picture of your computer does the lesson suggest you keep in mind?",
            options: [
              {
                id: "q4-a",
                label: "A random pile of files scattered everywhere.",
              },
              {
                id: "q4-b",
                label: "A single folder that contains every file on the machine.",
              },
              {
                id: "q4-c",
                label: "Only the Desktop, because nothing else matters.",
              },
              {
                id: "q4-d",
                label: "A tree: drive or home folder → workspace → project folders → files.",
              },
            ],
            correctOptionId: "q4-d",
            explanation:
              "Thinking of your machine as a tree helps you understand where projects and files fit in that structure.",
          },
          {
            id: "q5",
            prompt:
              "What is the main benefit of keeping all GAIA projects in one workspace folder?",
            options: [
              {
                id: "q5-a",
                label: "It makes it easier to delete them by mistake.",
              },
              {
                id: "q5-b",
                label: "You always know where to find your projects when using the terminal or editor.",
              },
              {
                id: "q5-c",
                label: "It makes your computer run twice as fast.",
              },
              {
                id: "q5-d",
                label: "It allows you to install more games.",
              },
            ],
            correctOptionId: "q5-b",
            explanation:
              "A single workspace folder gives you one mental location for all projects, which simplifies every command you run later.",
          },
          {
            id: "q6",
            prompt:
              "How does the lesson suggest you respond when you feel confused at the beginning?",
            options: [
              {
                id: "q6-a",
                label: "Give up immediately and assume you cannot learn programming.",
              },
              {
                id: "q6-b",
                label: "Hide your confusion and keep pretending you understand.",
              },
              {
                id: "q6-c",
                label: "Accept some confusion, move in small steps, and write notes for your future self.",
              },
              {
                id: "q6-d",
                label: "Keep reinstalling tools again and again.",
              },
            ],
            correctOptionId: "q6-c",
            explanation:
              "Confusion at the beginning is normal; the important part is moving gently and documenting what you learn.",
          },
          {
            id: "q7",
            prompt:
              'Which action best matches the idea of "basic comfort" with your computer?',
            options: [
              {
                id: "q7-a",
                label: "Knowing how to create, rename, move, and delete folders without fear.",
              },
              {
                id: "q7-b",
                label: "Installing random programs without reading what they do.",
              },
              {
                id: "q7-c",
                label: "Only using search to find files, never organising them.",
              },
              {
                id: "q7-d",
                label: "Keeping all files on the Desktop with long names.",
              },
            ],
            correctOptionId: "q7-a",
            explanation:
              "Basic comfort means you can perform the simple file operations calmly and on purpose.",
          },
          {
            id: "q8",
            prompt:
              "What is the big shift this track wants to create for you?",
            options: [
              {
                id: "q8-a",
                label: "To make you afraid of touching your computer.",
              },
              {
                id: "q8-b",
                label: "To keep you only as a passive user of other people’s apps.",
              },
              {
                id: "q8-c",
                label: "To avoid using AI tools completely.",
              },
              {
                id: "q8-d",
                label: "To help you become someone who can design and guide the tools you use, not just click them.",
              },
            ],
            correctOptionId: "q8-d",
            explanation:
              "The goal is to move you from passive user to someone who can shape tools with code and AI.",
          },
          {
            id: "q9",
            prompt:
              "Why does the lesson talk specifically about GAIA when explaining programming?",
            options: [
              {
                id: "q9-a",
                label: "Because GAIA is the only possible project you can ever build.",
              },
              {
                id: "q9-b",
                label: "Because connecting concepts to a real, personal project makes the ideas much easier to remember.",
              },
              {
                id: "q9-c",
                label: "Because GAIA replaces all other programming languages.",
              },
              {
                id: "q9-d",
                label: "Because you should never build smaller practice projects.",
              },
            ],
            correctOptionId: "q9-b",
            explanation:
              "Linking the theory to your real GAIA project makes the learning feel relevant and sticks better in your memory.",
          },
          {
            id: "q10",
            prompt:
              'What does "from noob to hero" mean in the context of this lesson?',
            options: [
              {
                id: "q10-a",
                label: "Becoming a world-famous computer scientist overnight.",
              },
              {
                id: "q10-b",
                label: "Memorising every programming language before writing any code.",
              },
              {
                id: "q10-c",
                label: "Gaining enough skill to understand code, work with AI, and build small tools confidently.",
              },
              {
                id: "q10-d",
                label: "Never making mistakes again.",
              },
            ],
            correctOptionId: "q10-c",
            explanation:
              "The goal is realistic confidence: understanding code and using it with AI to build the tools you need.",
          },
        ],
      };
    case "0.2":
      return {
        id: "quiz-0-2",
        title: "Check your understanding of how the web works (first look)",
        questions: [
          {
            id: "q1",
            prompt:
              "In the client–server model, what role does your browser usually play?",
            options: [
              {
                id: "q1-a",
                label: "The server that stores all websites.",
              },
              {
                id: "q1-b",
                label: "The database that holds all user data.",
              },
              {
                id: "q1-c",
                label: "The operating system itself.",
              },
              {
                id: "q1-d",
                label: "The client that sends requests and displays responses.",
              },
            ],
            correctOptionId: "q1-d",
            explanation:
              "Your browser is the client: it sends requests to servers and shows you the responses.",
          },
          {
            id: "q2",
            prompt:
              "What is the main job of a web server in this first mental model?",
            options: [
              {
                id: "q2-a",
                label: "To draw the user interface on your monitor.",
              },
              {
                id: "q2-b",
                label: "To store code and data and send back responses when the client asks.",
              },
              {
                id: "q2-c",
                label: "To manage your local file system.",
              },
              {
                id: "q2-d",
                label: "To decide which apps you are allowed to install.",
              },
            ],
            correctOptionId: "q2-b",
            explanation:
              "The server holds code and data and returns responses when a client (like your browser) sends a request.",
          },
          {
            id: "q3",
            prompt:
              "When you type a URL like https://example.com into your browser, what is the simplest way to describe what happens?",
            options: [
              {
                id: "q3-a",
                label: "Your computer sends a request to a server and waits for a response.",
              },
              {
                id: "q3-b",
                label: "Your computer only opens a local file with that name.",
              },
              {
                id: "q3-c",
                label: "Your browser formats your hard drive.",
              },
              {
                id: "q3-d",
                label: "Your Wi‑Fi router deletes old websites.",
              },
            ],
            correctOptionId: "q3-a",
            explanation:
              "Typing a URL sends a request to a remote server, which returns a response that your browser renders.",
          },
          {
            id: "q4",
            prompt:
              "In the GAIA project, how can you think about the frontend and backend?",
            options: [
              {
                id: "q4-a",
                label: "Frontend and backend are exactly the same thing.",
              },
              {
                id: "q4-b",
                label: "The frontend is what runs in the browser; the backend runs on a server and works with data.",
              },
              {
                id: "q4-c",
                label: "The frontend is only images; the backend is only videos.",
              },
              {
                id: "q4-d",
                label: "Frontend means your keyboard, backend means your mouse.",
              },
            ],
            correctOptionId: "q4-b",
            explanation:
              "The frontend is your visible interface in the browser, the backend is the server side that handles logic and data.",
          },
          {
            id: "q5",
            prompt:
              "Why does this lesson say you do NOT need to memorise all protocols right now?",
            options: [
              {
                id: "q5-a",
                label: "Because protocols are not used on the web anymore.",
              },
              {
                id: "q5-b",
                label: "Because details never matter in programming.",
              },
              {
                id: "q5-c",
                label: "Because only network engineers are allowed to learn them.",
              },
              {
                id: "q5-d",
                label: "Because the main goal now is to understand the simple flow: client → request → server → response.",
              },
            ],
            correctOptionId: "q5-d",
            explanation:
              "At this stage, the key idea is the flow of requests and responses, not the low-level protocol details.",
          },
          {
            id: "q6",
            prompt:
              "Which of these is a good mental picture of how GAIA talks to a database like Supabase?",
            options: [
              {
                id: "q6-a",
                label: "The browser directly edits your hard drive without any requests.",
              },
              {
                id: "q6-b",
                label: "The frontend sends a request to an API endpoint, which talks to the database and sends data back.",
              },
              {
                id: "q6-c",
                label: "The database lives inside the browser cache.",
              },
              {
                id: "q6-d",
                label: "There is no communication; they are completely separate.",
              },
            ],
            correctOptionId: "q6-b",
            explanation:
              "The frontend talks to an API on the backend, which then reads or writes data in the database and returns a response.",
          },
          {
            id: "q7",
            prompt:
              "What does it mean when we say the browser \"renders\" a response?",
            options: [
              {
                id: "q7-a",
                label: "It deletes the response and shows nothing.",
              },
              {
                id: "q7-b",
                label: "It stores the response in a log file only.",
              },
              {
                id: "q7-c",
                label: "It turns the HTML, CSS, and JavaScript into the page you see and can interact with.",
              },
              {
                id: "q7-d",
                label: "It automatically prints the page on paper.",
              },
            ],
            correctOptionId: "q7-c",
            explanation:
              "Rendering is the browser’s process of taking the response and making it into the page you see.",
          },
          {
            id: "q8",
            prompt:
              "Why is it useful for you, as a beginner, to have even a rough client–server mental model?",
            options: [
              {
                id: "q8-a",
                label: "So you can fix every network problem on the planet.",
              },
              {
                id: "q8-b",
                label: "So you can feel superior to non-programmers.",
              },
              {
                id: "q8-c",
                label: "So you never have to think about the web again.",
              },
              {
                id: "q8-d",
                label: "So later, when code says fetch or API, you have a place in your mind to put those ideas.",
              },
            ],
            correctOptionId: "q8-d",
            explanation:
              "A simple mental model gives future concepts like fetch, APIs, and endpoints somewhere to attach in your mind.",
          },
          {
            id: "q9",
            prompt:
              "Which of these situations best shows a healthy beginner attitude toward \"how the web works\"?",
            options: [
              {
                id: "q9-a",
                label: "Refusing to code until you memorise every protocol and port number.",
              },
              {
                id: "q9-b",
                label: "Ignoring the web completely and only writing offline programs.",
              },
              {
                id: "q9-c",
                label: "Accepting a high-level mental model now and trusting that details will come when you need them.",
              },
              {
                id: "q9-d",
                label: "Only learning through random error messages.",
              },
            ],
            correctOptionId: "q9-c",
            explanation:
              "You do not need every detail now; a clear high-level model is enough to start building.",
          },
          {
            id: "q10",
            prompt:
              "How does this lesson connect to your future GAIA work?",
            options: [
              {
                id: "q10-a",
                label: "It shows that GAIA will never need a backend.",
              },
              {
                id: "q10-b",
                label: "It shows that GAIA is only a server and never runs in a browser.",
              },
              {
                id: "q10-c",
                label: "It reminds you that every GAIA page in the browser is the result of requests, responses, and data flowing behind the scenes.",
              },
              {
                id: "q10-d",
                label: "It proves that GAIA must be rewritten in a different language.",
              },
            ],
            correctOptionId: "q10-c",
            explanation:
              "Understanding the basic flow of requests and responses helps you reason about every GAIA screen you build.",
          },
        ],
      };
    case "0.3":
      return {
        id: "quiz-0-3",
        title: "Check your understanding of the installation overview",
        questions: [
          {
            id: "q1",
            prompt:
              "Which tools does this lesson describe as core parts of your developer toolkit for GAIA?",
            options: [
              {
                id: "q1-a",
                label: "A modern browser, Node.js + npm, Git, and VS Code.",
              },
              {
                id: "q1-b",
                label: "Only a photo editing app.",
              },
              {
                id: "q1-c",
                label: "Only a spreadsheet application.",
              },
              {
                id: "q1-d",
                label: "A random set of games.",
              },
            ],
            correctOptionId: "q1-a",
            explanation:
              "The core stack here is: browser, Node.js + npm, Git, and VS Code as your main editor.",
          },
          {
            id: "q2",
            prompt:
              "What is the purpose of Node.js + npm in your GAIA setup?",
            options: [
              {
                id: "q2-a",
                label: "They run the operating system.",
              },
              {
                id: "q2-b",
                label: "They let you run JavaScript outside the browser and manage project dependencies.",
              },
              {
                id: "q2-c",
                label: "They are only used to edit images.",
              },
              {
                id: "q2-d",
                label: "They replace your browser entirely.",
              },
            ],
            correctOptionId: "q2-b",
            explanation:
              "Node.js runs JavaScript on your machine and npm manages the packages your projects need.",
          },
          {
            id: "q3",
            prompt:
              "Why does the lesson recommend one main workspace folder for all GAIA projects (for example, gaia)?",
            options: [
              {
                id: "q3-a",
                label: "So you can easily forget where projects are.",
              },
              {
                id: "q3-b",
                label: "So every project is in a different random location.",
              },
              {
                id: "q3-c",
                label: "So commands and editor sessions always start from a predictable place.",
              },
              {
                id: "q3-d",
                label: "So you can mix system files and project files together.",
              },
            ],
            correctOptionId: "q3-c",
            explanation:
              "A single workspace folder makes it much easier to run commands and open projects without getting lost.",
          },
          {
            id: "q4",
            prompt:
              "What is the main job of Git in this toolkit?",
            options: [
              {
                id: "q4-a",
                label: "Tracking your changes so you can make commits and roll back if needed.",
              },
              {
                id: "q4-b",
                label: "Controlling your internet connection.",
              },
              {
                id: "q4-c",
                label: "Replacing your file explorer.",
              },
              {
                id: "q4-d",
                label: "Automatically writing all your code.",
              },
            ],
            correctOptionId: "q4-a",
            explanation:
              "Git is version control: it tracks changes and lets you create safe checkpoints for your projects.",
          },
          {
            id: "q5",
            prompt:
              "Why does the lesson say this is an \"overview\" of installation rather than a full tutorial?",
            options: [
              {
                id: "q5-a",
                label: "Because you are not expected to install any tools at all.",
              },
              {
                id: "q5-b",
                label: "Because the goal is to give you a mental map first so detailed steps feel calmer later.",
              },
              {
                id: "q5-c",
                label: "Because installation is not important for programmers.",
              },
              {
                id: "q5-d",
                label: "Because only experts are allowed to install tools.",
              },
            ],
            correctOptionId: "q5-b",
            explanation:
              "The lesson focuses on the big picture so you know why each tool matters before following step-by-step guides.",
          },
          {
            id: "q6",
            prompt:
              "How does VS Code fit into this toolkit?",
            options: [
              {
                id: "q6-a",
                label: "It is only used to browse the internet.",
              },
              {
                id: "q6-b",
                label: "It replaces your operating system.",
              },
              {
                id: "q6-c",
                label: "It is only for designing images and logos.",
              },
              {
                id: "q6-d",
                label: "It is the main code editor where you open your GAIA projects and write code.",
              },
            ],
            correctOptionId: "q6-d",
            explanation:
              "VS Code is your main development environment where you view and edit project files.",
          },
          {
            id: "q7",
            prompt:
              "What attitude does the lesson recommend if installation steps feel overwhelming?",
            options: [
              {
                id: "q7-a",
                label: "Rush through everything in one night, no matter how confused you feel.",
              },
              {
                id: "q7-b",
                label: "Give up completely and never come back.",
              },
              {
                id: "q7-c",
                label: "Slow down, take breaks, and do one small piece at a time while taking notes.",
              },
              {
                id: "q7-d",
                label: "Uninstall all tools whenever you see an error.",
              },
            ],
            correctOptionId: "q7-c",
            explanation:
              "The lesson encourages a gentle pace and small steps, not panic or all-or-nothing thinking.",
          },
          {
            id: "q8",
            prompt:
              "Why is it helpful to know roughly what each tool does before you follow a specific installation guide?",
            options: [
              {
                id: "q8-a",
                label: "So you can impress people with tool names.",
              },
              {
                id: "q8-b",
                label: "So you can skip all installation steps forever.",
              },
              {
                id: "q8-c",
                label: "So every click in the installer feels connected to a purpose in your GAIA work.",
              },
              {
                id: "q8-d",
                label: "So you can safely ignore error messages.",
              },
            ],
            correctOptionId: "q8-c",
            explanation:
              "When you know why a tool matters, the detailed installation steps feel less random and more meaningful.",
          },
          {
            id: "q9",
            prompt:
              "Which of these best describes the toolkit after you finish this installation overview?",
            options: [
              {
                id: "q9-a",
                label: "A complete, unchangeable setup that you must never touch again.",
              },
              {
                id: "q9-b",
                label: "A starting point that you can refine later as you learn more.",
              },
              {
                id: "q9-c",
                label: "A temporary trial that will be deleted automatically.",
              },
              {
                id: "q9-d",
                label: "Only useful for other people, not for GAIA.",
              },
            ],
            correctOptionId: "q9-b",
            explanation:
              "This toolkit is a foundation you can improve over time as your needs and skills change.",
          },
          {
            id: "q10",
            prompt:
              "How does this lesson support your goal of becoming comfortable with GAIA as a development project?",
            options: [
              {
                id: "q10-a",
                label: "By giving you a clear picture of the tools and folders involved before you start heavy coding.",
              },
              {
                id: "q10-b",
                label: "By avoiding any mention of tools or setup.",
              },
              {
                id: "q10-c",
                label: "By focusing only on theory and never on your machine.",
              },
              {
                id: "q10-d",
                label: "By telling you that setup is someone else’s job.",
              },
            ],
            correctOptionId: "q10-a",
            explanation:
              "A clear overview of tools and folder structure makes GAIA feel like a real, manageable project on your own machine.",
          },
        ],
      };
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
    case "0.0":
      return {
        title: "Write your quick programming history timeline",
        description:
          "Capture the key moments so you remember why languages evolved and how that shapes what you will learn next.",
        instructions: [
          "In 8-12 lines, write a simple timeline from Ada Lovelace and punched cards to high-level languages (FORTRAN/COBOL), C, the web (HTML/CSS/JS), and open source/package managers.",
          "Mention one insight from the YouTube video (Early Programming) and one from a free article (for example The Odin Project’s history piece or a Codecademy/freeCodeCamp history blog).",
          "Add a sentence on why this matters to you: how does knowing the history reduce intimidation or help you explain programming to someone else?",
        ],
      };
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
    "0.0",
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
