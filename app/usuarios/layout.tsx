import UsuariosFooter from './components/UsuariosFooter';

export default function UsuariosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <><>
      {children}

    </><UsuariosFooter /></>
  );
}
