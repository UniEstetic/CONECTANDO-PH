'use client'; // 1. Obligatorio para detectar la ruta actual del usuario
import { usePathname } from 'next/navigation'; // 2. Hook para identificar la página
//import { ContextProvider } from 'auth-lib'
import { Providers } from './components/Providers';
import { montserrat } from './ui/fonts';

import './ui/global.css';
import Footer from "@/app/components/general/footer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 3. Detectamos la ruta en la que se encuentra 
  const pathname = usePathname();

  // 4. Definimos que en la ruta de login el menú/footer debe estar oculto
  // Basado en tus archivos, la ruta es '/auth/login'
  const isLoginPage = pathname === '/auth/login';

  return (
    <html lang="en">
      <body className={`${montserrat.className} antialised`}>
        <Providers>
          {children}
          {!isLoginPage && <Footer />}
        </Providers>
      </body>
    </html>
  )
}
