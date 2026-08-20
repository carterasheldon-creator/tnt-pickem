import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TnT Weekly Pick 'Em",
  description: "TnT Weekly Pick 'Em League",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.className} bg-gray-900 text-white min-h-screen`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
