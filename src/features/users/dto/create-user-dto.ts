import { z } from 'zod';

export const createUserSchema = z
  .object({
    login: z.string(),
    email: z.string(),
    password: z.string(),
    age: z.number(),
    description: z.string().max(1000),
  })
  .required();

export type CreateUserDto = z.infer<typeof createUserSchema>;
