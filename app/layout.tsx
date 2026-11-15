import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "../context/ThemeContext";
import { StoreProvider } from "../context/StoreContext";
import { AuthProvider } from "../context/AuthContext";
import { StorefrontFrame } from "../components/navigation/StorefrontFrame";
import { fetchStoreBootstrap } from "../lib/store/server";

const THEME_INIT_SCRIPT = `(function(){try{if(window.location.pathname.indexOf('/admin')===0){var t=localStorage.getItem('oriiko_theme');if(t==='dark'){document.documentElement.classList.add('dark');document.documentElement.setAttribute('data-theme','dark');document.documentElement.style.colorScheme='dark';}}}catch(e){}})();`;

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await fetchStoreBootstrap();
  const iconHref = settings.faviconUrl || "/api/favicon";

  return {
    title: {
      default: "ORIIKO",
      template: "%s — ORIIKO",
    },
    description:
      "Indian streetwear label crafting heavyweight hoodies, embroidered oversized tees, sweatshirts, and contemporary essentials.",
    icons: {
      icon: iconHref,
      shortcut: iconHref,
      apple: iconHref,
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="h-full bg-[#F2F2F0] dark:bg-[#26231F] text-[#26231F] dark:text-[#F2F2F0] antialiased overflow-x-clip"
    >
      <body className="min-h-full flex flex-col overflow-x-clip font-sans bg-[#F2F2F0] dark:bg-[#26231F] text-[#26231F] dark:text-[#F2F2F0] selection:bg-[#591623] selection:text-[#F2F2F0]">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
        <ThemeProvider>
          <StoreProvider>
            <AuthProvider>
              <StorefrontFrame>{children}</StorefrontFrame>
            </AuthProvider>
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
