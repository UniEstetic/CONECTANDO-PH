'use server'

import { SignupFormSchema, FormState } from '@/app/lib/definitions'
import { redirect } from 'next/navigation';
import { createSession } from '@/app/lib/utils/session'

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
