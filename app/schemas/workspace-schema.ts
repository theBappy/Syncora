import { z } from "zod";

export const workspaceSchema = z.object({
  name: z.string().min(5).max(50),
});

export type WorkspaceSchemaType = z.infer<typeof workspaceSchema>;


