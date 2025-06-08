import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '一千零一夜的国王 - The King of Arabian Nights',
  description: '与《一千零一夜》中的萨珊王对话',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-night-blue via-royal-purple to-persian-gold">
          {children}
        </div>
      </body>
    </html>
  )
} 