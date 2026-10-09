import type { Metadata } from "next";
import { SignJourney } from "@/components/signs/SignJourney";
import { SignsAbout } from "@/components/signs/SignsAbout";

export const metadata: Metadata = {
  title: "Uzbekistan road signs",
  description:
    "Drive down the road and meet Uzbekistan's warning, priority, prohibitory, mandatory and information signs one by one.",
};

export default function SignsPage() {
  return (
    <>
      <SignJourney />
      <SignsAbout />
    </>
  );
}
