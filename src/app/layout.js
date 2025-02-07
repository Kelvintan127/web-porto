import "./globals.css";

export const metadata = {
  title: 'Kelvin Tan - Portfolio',
  description: 'Personal portfolio website showcasing my projects and skills',
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
