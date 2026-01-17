import LoginClient from "./LoginClient";

interface LoginPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams;
  const modeParam =
    typeof resolvedSearchParams?.mode === "string"
      ? resolvedSearchParams.mode
      : undefined;
  const initialMode = modeParam === "signup" ? "signup" : "signin";

  return <LoginClient initialMode={initialMode} />;
}
