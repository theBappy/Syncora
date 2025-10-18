import { z } from "zod";

export function transformChannelName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const ChannelNameSchema = z.object({
  name: z
    .string()
    .min(5, "Channel name must be at least 5 characters")
    .max(50, "Channel name should not contain more than 50 characters")
    .transform((name, ctx) => {
      const transformed = transformChannelName(name);
      if (transformed.length < 5) {
        ctx.addIssue({
          code: "custom",
          message:
            "Channel name must contain at least 5 characters after transformation",
        });
        return z.NEVER;
      }
      return transformed;
    }),
});

export type ChannelSchemaNameType = z.infer<typeof ChannelNameSchema>;
