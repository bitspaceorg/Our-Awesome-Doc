import type { Metadata } from "next";
import "highlight.js/styles/github-dark.css";
import "./globals.css";
import { ACCENT_COLOR, FOREGROUND_COLOR, TINTED_ACCENT_COLOR, SITE_TITLE, SITE_DESCRIPTION, SITE_FAVICON } from "@/utils";

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  icons: {
    icon: SITE_FAVICON,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html style={ { 
        "--accent-color": ACCENT_COLOR, 
        "--foreground-color": FOREGROUND_COLOR, 
        "--tinted-accent-color": TINTED_ACCENT_COLOR, 
    } as React.CSSProperties } lang="en">
      <body className='antialiased'>
        {children}
      </body>
    </html>
  );
}

