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

export default function LoginPage() {
  return <LoginPageClient />;
}
