import type { Metadata } from "next";
import { ProfilePage } from "@/components/profile/ProfilePage";

export const metadata: Metadata = {
  title: "Your Profile — StudioSpace",
  description: "View your StudioSpace account profile.",
};

export default function Profile() {
  return <ProfilePage />;
}
