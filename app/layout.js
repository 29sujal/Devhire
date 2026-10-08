import './globals.css'
import Providers from '@/components/Providers'
import Navbar from '@/components/Navbar'

export const metadata = {
  title: 'DevHire — Find Developer Jobs',
  description: 'AI powered job board for developers',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          <Navbar />
          <main style={{ minHeight: '100vh' }}>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}