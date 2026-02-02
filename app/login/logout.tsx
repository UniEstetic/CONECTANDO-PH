import { signOut } from "@/app/api/auth/[...nextauth]/auth.config"; 

export default function LogoutPage() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/login" });
      }}
    >
      <button type="submit">Cerrar Sesión</button>
    </form>
  );
}