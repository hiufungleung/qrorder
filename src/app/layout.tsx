import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
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
        <link rel="icon" href="/favicon-light.svg" media="(prefers-color-scheme: light)" />
        <link rel="icon" href="/favicon-dark.svg" media="(prefers-color-scheme: dark)" />
        <link rel="icon" href="/favicon.svg" />
        <script dangerouslySetInnerHTML={{
          __html: `
            function updateFavicon() {
              const isDark = document.documentElement.classList.contains('dark') || 
                           (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
              const favicon = document.querySelector('link[rel="icon"]:not([media])');
              if (favicon) {
                favicon.href = isDark ? '/favicon-dark.svg' : '/favicon-light.svg';
              } else {
                const newFavicon = document.createElement('link');
                newFavicon.rel = 'icon';
                newFavicon.type = 'image/svg+xml';
                newFavicon.href = isDark ? '/favicon-dark.svg' : '/favicon-light.svg';
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
      <body className={`${montserrat.variable} font-sans antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
