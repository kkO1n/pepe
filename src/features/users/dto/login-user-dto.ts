import { z } from 'zod';

export const loginUserSchema = z
  .object({
    login: z.string(),
    password: z.string(),
  })
  .required();

export type LoginUserDto = z.infer<typeof loginUserSchema>;
