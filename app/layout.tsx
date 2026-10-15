import Sidebar from "@/components/SideBar";
import Topbar from "@/components/TopBar";
import Providers from "@/components/Providers";
import Footer from "@/components/Footer";
import "./globals.css";

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
      </body>
    </html>
  );
}
