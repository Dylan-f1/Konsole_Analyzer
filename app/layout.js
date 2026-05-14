import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Konsole Analyzer",
  description: "Analysez n'importe quel site et obtenez des insights B2B actionnables en quelques secondes.",
  openGraph: {
    title: "Konsole Analyzer",
    description: "Analysez n'importe quel site et obtenez des insights B2B actionnables en quelques secondes.",
    type: "website",
    url: "https://konsole-analyzer.vercel.app",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
