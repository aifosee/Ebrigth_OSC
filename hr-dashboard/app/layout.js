import './globals.css'

export const metadata = {
  title: 'HR Dashboard',
  description: 'Human Resources Management Dashboard',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  )
}
