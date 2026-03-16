'use server'

import { SignupFormSchema } from '@/app/types/definitions'
import { redirect } from 'next/navigation';
import { signOut } from "@/app/api/auth/[...nextauth]/auth.config";

export async function signup(state: SignupFormState, formData: FormData): Promise<SignupFormState>{
  SignupFormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  })

  redirect('/auth/login');
}

export async function handleSignOut() {
  // Invalida cookie JWT/sesión de Auth.js y dispara revokeRefreshToken por events.signOut.
  await signOut({ redirect: false });

  // Redirección explícita al login
  redirect('/auth/login');
}

export type SignupFormState = 
  | {
      errors?: {
        name?: string[];
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;
