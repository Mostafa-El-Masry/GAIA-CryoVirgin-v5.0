import LoginClient from "./LoginClient";

interface LoginPageProps {
  searchParams:
    | URLSearchParams
    | { [key: string]: string | string[] | undefined };
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  const modeParam =
    searchParams instanceof URLSearchParams
      ? searchParams.get("mode")
      : typeof searchParams?.mode === "string"
      ? searchParams.mode
      : undefined;
  const initialMode = modeParam === "signup" ? "signup" : "signin";

  return <LoginClient initialMode={initialMode} />;
}
