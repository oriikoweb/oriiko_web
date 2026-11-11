import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "../context/StoreContext";
import { AuthProvider } from "../context/AuthContext";
import { AnnouncementBar } from "../components/navigation/AnnouncementBar";
import { MainHeader } from "../components/navigation/MainHeader";
import { NavigationDrawer } from "../components/navigation/NavigationDrawer";
import { SearchDrawer } from "../components/navigation/SearchDrawer";
import { CartDrawer } from "../components/cart/CartDrawer";
import { QuickViewModal } from "../components/product/QuickViewModal";
import { Footer } from "../components/footer/Footer";

export const metadata: Metadata = {
  title: "ORIIKO — Contemporary Streetwear & Heavyweight Essentials",
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
      className="h-full bg-[#F2F2F0] text-[#26231F] antialiased"
    >
      <body className="min-h-full flex flex-col font-sans bg-[#F2F2F0] text-[#26231F] selection:bg-[#591623] selection:text-[#F2F2F0]">
        <StoreProvider>
          <AuthProvider>
            {/* Section 3.1 Promotional Announcement Bar */}
            <AnnouncementBar />

            {/* Section 3.2 Main Navigation Header */}
            <MainHeader />

            {/* Global Drawers & Modals */}
            <NavigationDrawer />
            <SearchDrawer />
            <CartDrawer />
            <QuickViewModal />

            {/* Main Viewport Content */}
            <div className="flex-1 flex flex-col">{children}</div>

            {/* Section 5 Footer */}
            <Footer />
          </AuthProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
