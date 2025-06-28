import "./globals.css";
import { ThemeProvider } from './context/ThemeContext';

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
    <html lang="en" className="dark">
      <body className="bg-white text-black dark:bg-black dark:text-white transition-colors duration-300">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
