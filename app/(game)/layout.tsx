import { Layout } from '@/components/dom/Layout'
import '@/globals.css'
import localFont from 'next/font/local'
import { cn } from '../lib/utils'
import { Toaster } from '@/components/ui/sonner'
import { Metadata } from 'next'

const krypton = localFont({ src: '../../public/krypton.otf' })

export const metadata: Metadata = {
  appleWebApp: true,
  metadataBase: new URL('https://ppobunny.vercel.app'),
  manifest: '/manifest.json',
  icons: { apple: 'https://images.smart.wtf/bunny.png' },
  openGraph: {
    url: 'https://ppobunny.vercel.app',
    title: 'PPO Bunny',
    description: 'Demonstration of PPO on the web',
    images: ['https://images.smart.wtf/bunnycard.png'],
  },
  title: 'ppobunny.vercel.app',
  description: 'Demonstration of PPO on the web',
  twitter: {
    card: 'summary_large_image',
    site: 'ppobunny.vercel.app',
    creator: '@noahgsolomon',
    images: ['https://images.smart.wtf/bunnycard.png'],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang='en' className={cn('antialiased dark', krypton.className)} suppressHydrationWarning>
      {/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head />
      <body>
        {/* To avoid FOUT with styled-components wrap Layout with StyledComponentsRegistry https://beta.nextjs.org/docs/styling/css-in-js#styled-components */}
        <Layout>{children}</Layout>
        <Toaster duration={2000} richColors />
      </body>
    </html>
  )
}
