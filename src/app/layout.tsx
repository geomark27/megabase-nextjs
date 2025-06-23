import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from 'next-themes'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Megabase - Sistema de Gestión",
  description: "Sistema para el manejo eficiente de grandes volúmenes de datos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <ThemeProvider 
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
          disableTransitionOnChange={false}
          storageKey="megabase-theme"
          forcedTheme={undefined}
        >
          <div className="min-h-screen bg-background text-foreground transition-colors">
            {children}
          </div>
        </ThemeProvider>
        
        {/* Script para forzar sync de tema (opcional) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (typeof window !== 'undefined') {
                  const theme = localStorage.getItem('megabase-theme') || 'system';
                  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  const isDark = theme === 'dark' || (theme === 'system' && systemPrefersDark);
                  
                  if (isDark && !document.documentElement.classList.contains('dark')) {
                    document.documentElement.classList.add('dark');
                  } else if (!isDark && document.documentElement.classList.contains('dark')) {
                    document.documentElement.classList.remove('dark');
                  }
                }
              } catch (e) {
                console.log('Theme sync script error:', e);
              }
            `,
          }}
        />
      </body>
    </html>
  )
}