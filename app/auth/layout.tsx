import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account Access",
  description:
    "Access your ORIIKO India account or register for our upcoming contemporary streetwear drops.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

