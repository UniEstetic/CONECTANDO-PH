import * as z from "zod";

export const SignupFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long." }) // Cambiado error -> message
    .trim(),
  email: z
    .string() // Añade .string() antes de .email()
    .email({ message: "Please enter a valid email." })
    .trim(),
  password: z
    .string()
    .min(8, { message: "Be at least 8 characters long" })
    .regex(/[a-zA-Z]/, { message: "Contain at least one letter." })
    .regex(/[0-9]/, { message: "Contain at least one number." })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Contain at least one special character.",
    })
    .trim(),
});

export interface Revenue {
  month: string;
  revenue: number;
}

export type FormState =
  | {
      errors?: {
        name?: string[];
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

export interface responseError {
  message: string;
  error: string;
  statusCode: number;
}

export interface propertiesList {
  total_items: number;
  items_per_page: number;
  current_page: number;
  total_pages: number;
}

export interface removeRegister {
  status: string;
  message: string;
}

export interface listFilters{
  fields?: string;
  where?: string;
  phs_id?: string;
  limit?: string;
  page?: string;
}