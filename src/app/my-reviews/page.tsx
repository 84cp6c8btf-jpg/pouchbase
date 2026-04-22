import type { Metadata } from "next";
import { PageIntro } from "@/components/common/PageIntro";
import { MyReviewsClient } from "./_components/MyReviewsClient";

export const metadata: Metadata = {
  title: "My Reviews — PouchBase",
  description: "Manage your pouch reviews and public display name.",
  robots: { index: false, follow: false },
};

export default function MyReviewsPage() {
  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Account"
        title="My reviews."
        description="Every pouch you have reviewed, in one place. Edit ratings, remove old reviews, or update your public display name."
      />
      <MyReviewsClient />
    </div>
  );
}
