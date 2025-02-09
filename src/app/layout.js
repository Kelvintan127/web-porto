import "./globals.css";

export const metadata = {
  title: 'Kelvin Tan - Portfolio',
  description: 'Personal portfolio website showcasing my projects and skills',
  icons: {
    icon: [
      {
        url: '/assets/favicon.ico',
        href: '/assets/favicon.ico',
      },
    ],
    shortcut: '/assets/favicon.ico',
    apple: '/assets/favicon.ico',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        {children}
      </body>
    </html>
  )
}
