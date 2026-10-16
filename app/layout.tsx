import Sidebar from "@/components/SideBar";
import Topbar from "@/components/TopBar";
import Providers from "@/components/Providers";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://dev-community-by-majd-maroun.vercel.app"),
  title: "DevCommunity",
  description:
    "Connect with developers, explore communities, and share knowledge.",
  openGraph: {
    title: "DevCommunity",
    description:
      "Connect with developers, explore communities, and share knowledge.",
    url: "https://dev-community-by-majd-maroun.vercel.app",
    siteName: "DevCommunity",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white">
        <Providers>
          <div className="flex min-h-screen pb-20 md:pb-0">
            <Sidebar />

            <div className="flex min-w-0 flex-1 flex-col">
              <Topbar />

              <main className="flex-1 p-6">{children}</main>

              <Footer />
            </div>
          </div>
        </Providers>

        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}