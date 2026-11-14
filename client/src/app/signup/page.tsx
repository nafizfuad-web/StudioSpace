import type { Metadata } from "next";
import { Suspense } from "react";
import {
  AuthPage,
  AuthPageFallback,
} from "@/components/auth/AuthPage";

export const metadata: Metadata = {
  title: "Create Account — StudioSpace",
  description: "Create your StudioSpace account.",
};

interface SignUpPageProps {
  searchParams: Promise<{
    next?: string | string[];
    error?: string | string[];
  }>;
}

async function SignUpContent({ searchParams }: SignUpPageProps) {
  const params = await searchParams;
  return (
    <AuthPage
      mode="signup"
      nextPath={typeof params.next === "string" ? params.next : undefined}
      hasOAuthError={typeof params.error === "string"}
    />
  );
}

export default function SignUpPage({ searchParams }: SignUpPageProps) {
  return (
    <Suspense fallback={<AuthPageFallback />}>
      <SignUpContent searchParams={searchParams} />
    </Suspense>
  );
}
