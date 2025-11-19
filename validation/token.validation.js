import { string, z } from "zod";

export const userTokenSchema = z.object({
  id: string(),
});
