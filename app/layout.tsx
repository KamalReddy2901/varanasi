import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { Cinzel, Inter } from 'next/font/google'
import './globals.css'

const cinzel = Cinzel({ 
  variable: '--font-cinzel', 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700']
})
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://varanasi.pages.dev'),
  title: 'VARANASI | Experience The Formats',
  description: 'An SS Rajamouli Film - Experience the epic in multiple formats. IMAX, 70mm, and beyond.',
  openGraph: {
    title: 'VARANASI | Experience The Formats',
    description: 'An SS Rajamouli Film - Experience the epic in multiple formats. IMAX, 70mm, and beyond.',
    type: 'website',
    images: [
      {
        url: '/varanasi-logo.png',
        width: 1200,
        height: 630,
        alt: 'Varanasi - SS Rajamouli Film',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VARANASI | Experience The Formats',
    description: 'An SS Rajamouli Film - Experience the epic in multiple formats. IMAX, 70mm, and beyond.',
    images: ['/varanasi-logo.png'],
  },
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${cinzel.variable} ${inter.variable} bg-[#0a0806]`}>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
