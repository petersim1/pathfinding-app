import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import GraphProvider from "@/providers/graph";
import "./globals.css";
import { Layout, Nav, Main } from "./_components/Layout";
import Panel from "./_components/Panel";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pathfinding",
  description: "Application for visualizing pathfinding algorithms",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch.png",
    shortcut: "/apple-touch.png",
  },
  keywords: ["pathfinding", "nextjs", "data viz", "DFS", "BFS", "A-Star"],
};

export const viewport: Viewport = {
  themeColor: "#121212",
  width: "device-width",
  userScalable: false,
  initialScale: 1,
  maximumScale: 1,
};

const Root = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): JSX.Element => {
  return (
    <html lang="en">
      <body className={inter.className}>
        <GraphProvider>
          <Layout>
            <Nav>
              <Panel />
            </Nav>
            <Main>{children}</Main>
          </Layout>
        </GraphProvider>
      </body>
    </html>
  );
};

export default Root;
