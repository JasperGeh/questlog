import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TodoQuest - Transform Tasks into Epic Adventures",
  description: "A high-fantasy themed todo app that turns your mundane tasks into epic quests with flowery language and rewards.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
