import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Questlog - Transform todos into dark fantasy quests",
  description: "A dark fantasy themed todo app that turns your mundane tasks into quests with flowery language and rewards.",
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
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
