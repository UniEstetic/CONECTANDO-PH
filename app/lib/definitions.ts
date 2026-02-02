import * as z from 'zod'

export const SignupFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters long.' }) // Cambiado error -> message
    .trim(),
  email: z
    .string() // Añade .string() antes de .email()
    .email({ message: 'Please enter a valid email.' }) 
    .trim(),
  password: z
    .string()
    .min(8, { message: 'Be at least 8 characters long' })
    .regex(/[a-zA-Z]/, { message: 'Contain at least one letter.' })
    .regex(/[0-9]/, { message: 'Contain at least one number.' })
    .regex(/[^a-zA-Z0-9]/, {
      message: 'Contain at least one special character.',
    })
    .trim(),
})

export interface Revenue {
  month: string;
  revenue: number;
}

export interface User {
  id: string;
  username: string; 
  email: string;
  isAdmin: boolean; 
  name: string;
  team: string;     
}

export interface SessionPayload {
  userId: string;
  expiresAt: Date;
}

export type FormState =
  | {
      errors?: {
        name?: string[]
        email?: string[]
        password?: string[]
      }
      message?: string
    }
  | undefined

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  document_type: string;
  document_number: string;
  phone_number: string;
  type_person?: string;
  gender?: string;
}

export interface SelectProviderResponse {
  result: {
    authorization: any;
    temp_token: string;
  };
}

export interface ValidateLoginResponse {
  result: {
    access_token: string;
    user: User;
  };
}

export interface getProfileResponse{
  userProfile: {
    email: string;
    firstName: string;
    lastName: string;
    document: string;
    documentType: string;
    phone: string;
    avatar: string;
    roles: string[];
  },
  userId: string;
  ownership: {
    id: string;
    name: string;
    tax_id: string;
    address: string;
    city: string;
    country: string;
    state: string;
  },
  scope: string;
}
