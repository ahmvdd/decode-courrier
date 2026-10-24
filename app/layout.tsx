import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Décode ton courrier",
  description: "Comprenez vos courriers administratifs, simplement et en plusieurs langues.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body>{children}</body></html>;
}
