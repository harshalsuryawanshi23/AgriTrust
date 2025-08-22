import type { Metadata, Viewport } from 'next';
import { AppShell } from '@/components/layout/app-shell';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from "@/components/ui/toaster";
import './globals.css';

// Preload critical fonts
const preloadFonts = () => (
  <>
    <link
      rel="preload"
      href="https://fonts.gstatic.com/s/playfairdisplay/v30/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDXbtXK-F2qO0isEw.woff2"
      as="font"
      type="font/woff2"
      crossOrigin="anonymous"
    />
    <link
      rel="preload"
      href="https://fonts.gstatic.com/s/ptsans/v17/jizaRExUiTo99u79D0aExc9OIwA.woff2"
      as="font"
      type="font/woff2"
      crossOrigin="anonymous"
    />
  </>
);

export const metadata: Metadata = {
  title: 'AgriTrust',
  description: 'Advanced agricultural management and forecasting platform.',
  metadataBase: new URL('http://localhost:3000'),
  // Performance optimizations
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // For PWA-like behavior
  viewportFit: 'cover',
  themeColor: [{
    media: '(prefers-color-scheme: light)',
    color: 'hsl(125, 83%, 96%)'
  }, {
    media: '(prefers-color-scheme: dark)',
    color: 'hsl(224, 71%, 4%)'
  }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* DNS prefetching for performance */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* Font optimization */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {preloadFonts()}
        <link 
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=PT+Sans:wght@400;700&family=Source+Code+Pro:wght@400;700&display=swap" 
          rel="stylesheet" 
        />
        
        {/* Viewport and performance meta tags */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <AppShell>
            {children}
          </AppShell>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
