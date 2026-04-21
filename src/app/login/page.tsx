import type { Metadata } from "next";
import { LoginPageClient } from "@/components/LoginPageClient";

export const metadata: Metadata = {
  title: "Sign In — PouchBase",
  description: "Sign in to rate and review nicotine pouches on PouchBase.",
  robots: {
    index: false,
    follow: false,
  },
};

interface Props {
  searchParams: Promise<{ next?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;

  return <LoginPageClient returnTo={params.next} />;
}
