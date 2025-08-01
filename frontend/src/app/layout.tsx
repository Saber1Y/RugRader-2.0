// app/layout.tsx
"use client";

import "./globals.css";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { IconGauge } from "@tabler/icons-react";

import { ReactNode } from "react";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} flex min-h-screen bg-white dark:bg-neutral-900`}
      >
        <Sidebar>
          <SidebarBody>
            <SidebarLink
              link={{
                label: "Wallet Scanner",
                href: "/",
                icon: <IconGauge size={18} />,
              }}
            />
          </SidebarBody>
        </Sidebar>

        <main className="flex-1 p-6">{children}</main>
      </body>
    </html>
  );
}
