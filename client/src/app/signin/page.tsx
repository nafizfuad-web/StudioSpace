import type { Metadata } from "next";
import { Suspense } from "react";
import {
  AuthPage,
  AuthPageFallback,
} from "@/components/auth/AuthPage";

export const metadata: Metadata = {
  title: "Sign In — StudioSpace",
  description: "Sign in to your StudioSpace account.",
};

interface SignInPageProps {
  searchParams: Promise<{
    next?: string | string[];
    error?: string | string[];
  }>;
}

async function SignInContent({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  return (
    <AuthPage
      mode="signin"
      nextPath={typeof params.next === "string" ? params.next : undefined}
      hasOAuthError={typeof params.error === "string"}
    />
  );
}

export default function SignInPage({ searchParams }: SignInPageProps) {
  return (
    <Suspense fallback={<AuthPageFallback />}>
      <SignInContent searchParams={searchParams} />
    </Suspense>
  );
}
