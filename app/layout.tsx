//import { ContextProvider } from 'auth-lib'
import { Providers } from './components/Providers';

import { montserrat } from './ui/fonts';
import './ui/global.css';
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html lang="en">
      <body className={`${montserrat.className} antialised`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
