import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "QR Order - Modern Restaurant Ordering System",
  description: "Transform your dining experience with QR code menus, seamless ordering, and real-time order management",
};

// Force dynamic rendering for the entire app
export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.png" media="(prefers-color-scheme: light)" />
        <link rel="icon" href="/favicon-dark.png" media="(prefers-color-scheme: dark)" />
        <script dangerouslySetInnerHTML={{
          __html: `
            function updateFavicon() {
              const isDark = document.documentElement.classList.contains('dark') || 
                           (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
              const favicon = document.querySelector('link[rel="icon"]:not([media])');
              if (favicon) {
                favicon.href = isDark ? '/favicon-dark.png' : '/favicon.png';
              } else {
                const newFavicon = document.createElement('link');
                newFavicon.rel = 'icon';
                newFavicon.href = isDark ? '/favicon-dark.png' : '/favicon.png';
                document.head.appendChild(newFavicon);
              }
            }
            
            // Update favicon immediately
            updateFavicon();
            
            // Listen for theme changes
            if (window.matchMedia) {
              window.matchMedia('(prefers-color-scheme: dark)').addListener(updateFavicon);
            }
            
            // Listen for manual theme toggle
            const observer = new MutationObserver(updateFavicon);
            observer.observe(document.documentElement, { 
              attributes: true, 
              attributeFilter: ['class'] 
            });
          `
        }} />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
