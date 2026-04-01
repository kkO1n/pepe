import z from 'zod';
import { createUserSchema } from './create-user-dto';
export const putUserSchema = createUserSchema.partial();

export type PutUserDto = z.infer<typeof putUserSchema>;
