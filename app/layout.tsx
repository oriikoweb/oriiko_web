import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "../context/StoreContext";
import { AuthProvider } from "../context/AuthContext";
import { StorefrontFrame } from "../components/navigation/StorefrontFrame";

export const metadata: Metadata = {
  title: {
    default: "ORIIKO",
    template: "%s — ORIIKO",
  },
  description:
    "Indian streetwear label crafting heavyweight hoodies, embroidered oversized tees, sweatshirts, and contemporary essentials.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className="h-full bg-[#F2F2F0] text-[#26231F] antialiased overflow-x-clip"
    >
      <body className="min-h-full flex flex-col overflow-x-clip font-sans bg-[#F2F2F0] text-[#26231F] selection:bg-[#591623] selection:text-[#F2F2F0]">
        <StoreProvider>
          <AuthProvider>
            <StorefrontFrame>{children}</StorefrontFrame>
          </AuthProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
