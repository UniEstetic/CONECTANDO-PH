'use server'

import { SignupFormSchema, FormState } from '@/app/lib/definitions/definitions'
import { redirect } from 'next/navigation';
import { createSession } from '@/app/lib/utils/session'
import { signOut } from "@/app/api/auth/[...nextauth]/auth.config";

export async function signup(state: SignupFormState, formData: FormData): Promise<SignupFormState>{
  const validatedFields = SignupFormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  })
  
  const user= {id: "1"}
  await createSession(user.id)
  redirect('/login');
}

export async function handleSignOut() {
  await signOut({ redirectTo: "/login" });
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
