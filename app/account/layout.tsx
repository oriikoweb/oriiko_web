import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Account",
  description:
    "Manage your ORIIKO India profile, recent streetwear orders, and saved delivery preferences.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

