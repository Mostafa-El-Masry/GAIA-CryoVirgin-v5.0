import {
  StudyDescription,
  QuizConfig,
  PracticePrompt,
  PracticeCheckResult,
} from "../lessonTypes";

export function getSupabaseStudy(lessonCode: string): StudyDescription | null {
  switch (lessonCode) {
    case "6.1":
      return {
        title: "Relational Database Basics",
        paragraphs: [
          "Supabase sits on top of Postgres, a relational database. Data lives in tables with rows (records) and columns (fields).",
          "Each table should have a primary key (often id) that uniquely identifies each row.",
          "Relationships link tables together via foreign keys: for example, lesson_progress.user_id references users.id.",
          "Designing tables with clear types and relationships makes queries predictable and keeps your GAIA data consistent.",
        ],
      };
    case "6.2":
      return {
        title: "Supabase Setup and Auth Basics",
        paragraphs: [
          "To use Supabase from the browser, you create a client with your project URL and the public anon key. Keep the service role key on the server only.",
          "Authentication is built in: you can sign up, sign in, and listen for auth state changes with supabase.auth methods.",
          "Environment variables (for example NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY) keep secrets out of source control.",
          "In GAIA, you will use the anon key on the client, and protect data with Row Level Security (RLS) policies.",
        ],
      };
    case "6.3":
      return {
        title: "Reading Data from Supabase",
        paragraphs: [
          "Reading data uses the fluent API: supabase.from('table').select('columns').eq('field', value) and so on.",
          "Queries return { data, error }. You should always check error before using data.",
          "Ordering and limiting results keeps responses small: .order('created_at', { ascending: false }).limit(20).",
          "In GAIA, reading might fetch recent lessons, health logs, or inventory items for the dashboard.",
        ],
      };
    case "6.4":
      return {
        title: "Writing Data and Simple CRUD",
        paragraphs: [
          "Inserts, updates, and deletes use the same style: supabase.from('table').insert([...]) / update({...}).eq(...) / delete().eq(...).",
          "upsert lets you insert or update in one call, usually with a unique constraint on a key like lesson_id + user_id.",
          "Always check { error } on write operations and consider returning minimal columns to keep payloads small.",
          "RLS policies must allow the current user to perform the write; otherwise Supabase returns an error even if your code is correct.",
        ],
      };
    default:
      return null;
  }
}

export function getSupabaseQuiz(lessonCode: string): QuizConfig | null {
  switch (lessonCode) {
    case "6.1":
      return {
        id: "quiz-6-1",
        title: "Check your understanding of relational basics",
        questions: [
          {
            id: "q1",
            prompt: "What is a table in a relational database?",
            options: [
              { id: "q1-a", label: "A random collection of files" },
              { id: "q1-b", label: "A structured set of rows and columns" },
              { id: "q1-c", label: "A single text document" },
              { id: "q1-d", label: "Only a view of other databases" },
            ],
            correctOptionId: "q1-b",
            explanation:
              "Tables organize data into rows (records) and columns (fields) with defined types.",
          },
          {
            id: "q2",
            prompt: "What is the purpose of a primary key?",
            options: [
              { id: "q2-a", label: "To style the table" },
              { id: "q2-b", label: "To uniquely identify each row" },
              { id: "q2-c", label: "To compress data" },
              { id: "q2-d", label: "To sort results automatically" },
            ],
            correctOptionId: "q2-b",
            explanation:
              "Primary keys ensure each row is unique and make joins reliable.",
          },
          {
            id: "q3",
            prompt: "How do tables relate to each other?",
            options: [
              { id: "q3-a", label: "They cannot relate" },
              { id: "q3-b", label: "Through foreign keys that reference another table's primary key" },
              { id: "q3-c", label: "By matching column colors" },
              { id: "q3-d", label: "Only via CSV export" },
            ],
            correctOptionId: "q3-b",
            explanation:
              "Foreign keys link rows between tables so you can query connected data with joins.",
          },
        ],
      };
    case "6.2":
      return {
        id: "quiz-6-2",
        title: "Check your understanding of Supabase setup",
        questions: [
          {
            id: "q1",
            prompt: "Which key should you use in the browser client?",
            options: [
              { id: "q1-a", label: "Service role key" },
              { id: "q1-b", label: "Public anon key" },
              { id: "q1-c", label: "Database password" },
              { id: "q1-d", label: "SSH key" },
            ],
            correctOptionId: "q1-b",
            explanation:
              "The anon key is safe for the client (with RLS). Service role should stay on the server.",
          },
          {
            id: "q2",
            prompt: "What two values are required to create a Supabase client?",
            options: [
              { id: "q2-a", label: "Project URL and anon key" },
              { id: "q2-b", label: "User email and password" },
              { id: "q2-c", label: "GitHub token and branch" },
              { id: "q2-d", label: "Only the project name" },
            ],
            correctOptionId: "q2-a",
            explanation:
              "createClient needs the Supabase URL and the public anon key to authenticate requests.",
          },
          {
            id: "q3",
            prompt: "How does Supabase enforce data safety on the client?",
            options: [
              { id: "q3-a", label: "It blocks all reads" },
              { id: "q3-b", label: "Through Row Level Security policies" },
              { id: "q3-c", label: "By hiding tables randomly" },
              { id: "q3-d", label: "It has no safety features" },
            ],
            correctOptionId: "q3-b",
            explanation:
              "RLS policies define which rows a user can read or write, protecting data even with a public key.",
          },
        ],
      };
    case "6.3":
      return {
        id: "quiz-6-3",
        title: "Check your understanding of reading data",
        questions: [
          {
            id: "q1",
            prompt: "What does supabase.from('lessons').select('*') return?",
            options: [
              { id: "q1-a", label: "Only a status code" },
              { id: "q1-b", label: "An object with data and error properties" },
              { id: "q1-c", label: "A DOM element" },
              { id: "q1-d", label: "Nothing; select does not fetch" },
            ],
            correctOptionId: "q1-b",
            explanation:
              "Supabase returns { data, error } so you can handle both success and failure.",
          },
          {
            id: "q2",
            prompt: "How do you filter rows where user_id equals a value?",
            options: [
              { id: "q2-a", label: ".filter('user_id', value)" },
              { id: "q2-b", label: ".eq('user_id', value)" },
              { id: "q2-c", label: ".where user_id = value" },
              { id: "q2-d", label: "Filtering is automatic" },
            ],
            correctOptionId: "q2-b",
            explanation:
              "eq(column, value) filters rows to those matching the provided value.",
          },
          {
            id: "q3",
            prompt: "What should you do before using the data returned from Supabase?",
            options: [
              { id: "q3-a", label: "Ignore errors and hope for the best" },
              { id: "q3-b", label: "Check if error exists and handle it" },
              { id: "q3-c", label: "Assume the data is always correct" },
              { id: "q3-d", label: "Parse HTML from it" },
            ],
            correctOptionId: "q3-b",
            explanation:
              "Always check error first to handle failures gracefully.",
          },
        ],
      };
    case "6.4":
      return {
        id: "quiz-6-4",
        title: "Check your understanding of writing data",
        questions: [
          {
            id: "q1",
            prompt: "Which method inserts new rows into a table?",
            options: [
              { id: "q1-a", label: ".insert()" },
              { id: "q1-b", label: ".select()" },
              { id: "q1-c", label: ".order()" },
              { id: "q1-d", label: ".range()" },
            ],
            correctOptionId: "q1-a",
            explanation:
              ".insert adds rows. update modifies existing rows, and upsert does insert-or-update.",
          },
          {
            id: "q2",
            prompt: "What does .eq('id', someId) do on an update?",
            options: [
              { id: "q2-a", label: "Sorts rows" },
              { id: "q2-b", label: "Filters rows to those whose id matches someId" },
              { id: "q2-c", label: "Deletes the table" },
              { id: "q2-d", label: "Creates a new column" },
            ],
            correctOptionId: "q2-b",
            explanation:
              "eq acts as a WHERE clause so the update only touches the intended rows.",
          },
          {
            id: "q3",
            prompt: "Why is it important to check error after an insert/update?",
            options: [
              { id: "q3-a", label: "Because writes can fail due to validation or RLS" },
              { id: "q3-b", label: "Errors never happen" },
              { id: "q3-c", label: "It automatically retries" },
              { id: "q3-d", label: "Errors only matter on select" },
            ],
            correctOptionId: "q3-a",
            explanation:
              "RLS, validation, or network issues can block writes. Checking error lets you react and show messages.",
          },
        ],
      };
    default:
      return null;
  }
}

export function getSupabasePractice(lessonCode: string): PracticePrompt | null {
  switch (lessonCode) {
    case "6.1":
      return {
        title: "Design a GAIA-friendly table",
        description:
          "Sketch a relational table for storing lesson progress.",
        instructions: [
          "Define a table name (for example guardian_academy_progress) and list at least five columns with types (id, user_id, lesson_code, completed_at, score, notes).",
          "Mark which column is the primary key and which columns should be foreign keys to other tables.",
          "Write one or two sentences about how this table relates to lessons or users.",
        ],
      };
    case "6.2":
      return {
        title: "Create a Supabase client and sign in",
        description:
          "Write the code you would place in a Supabase client module for the browser.",
        instructions: [
          "Use createClient with a SUPABASE_URL and SUPABASE_ANON_KEY placeholder.",
          "Show a simple signInWithPassword example and a signOut call.",
          "Mention that the keys should come from environment variables, not hard-coded secrets.",
        ],
      };
    case "6.3":
      return {
        title: "Read rows with filters and ordering",
        description:
          "Write an async function that loads the latest 10 progress rows for the current user.",
        instructions: [
          "Use supabase.from('guardian_academy_progress').select('*') with .eq('user_id', userId).",
          "Order by completed_at descending and limit the results.",
          "Check for error and return an empty array if something goes wrong.",
        ],
      };
    case "6.4":
      return {
        title: "Insert or update a progress row",
        description:
          "Practice writing data with Supabase, handling errors and conflicts.",
        instructions: [
          "Write an async function saveProgress that upserts a row with lesson_code, user_id, score, and completed_at.",
          "Use supabase.from('guardian_academy_progress').upsert([ { ... } ]) and, if useful, specify a conflict target like ['user_id', 'lesson_code'].",
          "Check error and log or return a friendly message if the write fails.",
        ],
      };
    default:
      return null;
  }
}

export function validateSupabasePractice(
  lessonCode: string,
  content: string
): PracticeCheckResult | null {
  const src = content.toLowerCase();

  if (lessonCode === "6.1") {
    const required = ["table", "primary", "id"];
    const missing = required.filter((snippet) => !src.includes(snippet));
    if (missing.length > 0) {
      return {
        ok: false,
        message:
          "Call out the table structure, a primary key, and an id column so the design is concrete. Missing: " +
          missing.join(", "),
      };
    }
    return { ok: true };
  }

  if (lessonCode === "6.2") {
    const required = ["createclient", "supabase", "anon", "signin"];
    const missing = required.filter((snippet) => !src.includes(snippet));
    if (missing.length > 0) {
      return {
        ok: false,
        message:
          "Your setup snippet should show createClient, the anon key, and an auth call like signIn. Missing: " +
          missing.join(", "),
      };
    }
    return { ok: true };
  }

  if (lessonCode === "6.3") {
    const required = ["from", "select", "eq", "order"];
    const missing = required.filter((snippet) => !src.includes(snippet));
    if (missing.length > 0) {
      return {
        ok: false,
        message:
          "Your read example should show from/select plus a filter and order. Missing: " +
          missing.join(", "),
      };
    }
    return { ok: true };
  }

  if (lessonCode === "6.4") {
    const required = ["upsert", "from", "await", "error"];
    const missing = required.filter((snippet) => !src.includes(snippet));
    if (missing.length > 0) {
      return {
        ok: false,
        message:
          "Your write example should show upsert/insert with an await and error handling. Missing: " +
          missing.join(", "),
      };
    }
    return { ok: true };
  }

  return null;
}
