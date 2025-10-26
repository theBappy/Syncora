import { z } from "zod";
import { base } from "../middlewares/base";
import { standardSecurityMiddleware } from "../middlewares/arcjet/standard";
import { requiredAuthMiddleware } from "../middlewares/auth";
import { requiredWorkspaceMiddleware } from "../middlewares/workspace";
import { standardWriteSecurityMiddleware } from "../middlewares/arcjet/standard-write";
import prisma from "@/lib/db";
import {
  createMessageSchema,
  GroupedReactionSchema,
  GroupedReactionSchemaType,
  toggleReactionSchema,
  updateMessageSchema,
} from "../schemas/message-schema";
import { getAvatar } from "@/lib/get-avatar";
import { Message } from "@/lib/generated/prisma";
import { standardReadSecurityMiddleware } from "../middlewares/arcjet/standard-read";
import { MessageListItem } from "@/lib/types";

function groupReactions(
  reactions: { emoji: string; userId: string }[],
  userId: string
): GroupedReactionSchemaType[] {
  const reactionMap = new Map<
    string,
    { count: number; reactedByMe: boolean }
  >();

  for (const reaction of reactions) {
    const existing = reactionMap.get(reaction.emoji);
    if (existing) {
      existing.count++;
      if (reaction.userId === userId) {
        existing.reactedByMe = true;
      }
    } else {
      reactionMap.set(reaction.emoji, {
        count: 1,
        reactedByMe: reaction.userId === userId,
      });
    }
  }

  return Array.from(reactionMap.entries()).map(([emoji, data]) => ({
    emoji,
    count: data.count,
    reactedByMe: data.reactedByMe,
  }));
}

export const createMessage = base
  .use(requiredAuthMiddleware)
  .use(requiredWorkspaceMiddleware)
  .use(standardSecurityMiddleware)
  .use(standardWriteSecurityMiddleware)
  .route({
    method: "POST",
    path: "/messages",
    summary: "Create a message",
    tags: ["Messages"],
  })
  .input(createMessageSchema)
  .output(z.custom<Message>())
  .handler(async ({ input, context, errors }) => {
    // verify channel belongs to the user organization
    const channel = await prisma.channel.findFirst({
      where: {
        id: input.channelId,
        workspaceId: context.workspace.orgCode,
      },
    });
    if (!channel) {
      throw errors.FORBIDDEN();
    }

    // if this is a thread reply, validate the parent message
    if (input.threadId) {
      const parentMessage = await prisma.message.findFirst({
        where: {
          id: input.threadId,
          Channel: {
            workspaceId: context.workspace.orgCode,
          },
        },
      });

      if (
        !parentMessage ||
        parentMessage.channelId !== input.channelId ||
        parentMessage.threadId !== null
      ) {
        throw errors.BAD_REQUEST();
      }
    }

    const created = await prisma.message.create({
      data: {
        content: input.content,
        imageUrl: input.imageUrl,
        channelId: input.channelId,
        authorId: context.user.id,
        authorEmail: context.user.email!,
        authorName: context.user.given_name ?? "John Doe",
        authorAvatar: getAvatar(context.user.picture, context.user.email!),
        threadId: input.threadId,
      },
    });

    return {
      ...created,
    };
  });

export const listMessages = base
  .use(requiredAuthMiddleware)
  .use(requiredWorkspaceMiddleware)
  .use(standardSecurityMiddleware)
  .use(standardReadSecurityMiddleware)
  .route({
    method: "GET",
    path: "/messages",
    summary: "List all messages",
    tags: ["Messages"],
  })
  .input(
    z.object({
      channelId: z.string(),
      limit: z.number().min(1).max(100).optional(),
      cursor: z.string().optional(),
    })
  )
  .output(
    z.object({
      items: z.array(z.custom<MessageListItem>()),
      nextCursor: z.string().optional(),
    })
  )
  .handler(async ({ input, context, errors }) => {
    const channel = await prisma.channel.findFirst({
      where: {
        id: input.channelId,
        workspaceId: context.workspace.orgCode,
      },
    });

    if (!channel) {
      throw errors.FORBIDDEN();
    }

    const limit = input.limit ?? 30;

    const messages = await prisma.message.findMany({
      where: {
        channelId: input.channelId,
        threadId: null,
      },
      ...(input.cursor
        ? {
            cursor: { id: input.cursor },
            skip: 1,
          }
        : {}),
      take: limit,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      include: {
        _count: { select: { replies: true } },
        MessageReaction: {
          select: {
            emoji: true,
            userId: true,
          },
        },
      },
    });

    const items: MessageListItem[] = messages.map((msg) => ({
      id: msg.id,
      content: msg.content,
      imageUrl: msg.imageUrl,
      createdAt: msg.createdAt,
      updatedAt: msg.updatedAt,
      authorAvatar: msg.authorAvatar,
      authorEmail: msg.authorEmail,
      authorId: msg.authorId,
      authorName: msg.authorName,
      channelId: msg.channelId,
      threadId: msg.threadId,
      repliesCount: msg._count.replies,
      reactions: groupReactions(
        msg.MessageReaction.map((r) => ({
          emoji: r.emoji,
          userId: r.userId,
        })),
        context.user.id
      ),
    }));

    const nextCursor =
      messages.length === limit ? messages[messages.length - 1].id : undefined;

    return {
      items: items,
      nextCursor,
    };
  });

export const updateMessage = base
  .use(requiredAuthMiddleware)
  .use(requiredWorkspaceMiddleware)
  .use(standardSecurityMiddleware)
  .use(standardWriteSecurityMiddleware)
  .route({
    method: "PUT",
    path: "/messages/:messageId",
    summary: "Update a message",
    tags: ["Messages"],
  })
  .input(updateMessageSchema)
  .output(
    z.object({
      message: z.custom<Message>(),
      canEdit: z.boolean(),
    })
  )
  .handler(async ({ input, context, errors }) => {
    const message = await prisma.message.findFirst({
      where: {
        id: input.messageId,
        Channel: {
          workspaceId: context.workspace.orgCode,
        },
      },
      select: {
        id: true,
        authorId: true,
      },
    });
    if (!message) {
      throw errors.NOT_FOUND();
    }
    if (message.authorId !== context.user.id) {
      throw errors.FORBIDDEN();
    }
    const updatedMessage = await prisma.message.update({
      where: {
        id: input.messageId,
      },
      data: {
        content: input.content,
      },
    });
    return {
      message: updatedMessage,
      canEdit: updatedMessage.authorId === context.user.id,
    };
  });

export const listThreadReplies = base
  .use(requiredAuthMiddleware)
  .use(requiredWorkspaceMiddleware)
  .use(standardSecurityMiddleware)
  .use(standardReadSecurityMiddleware)
  .route({
    method: "GET",
    path: "/messages/:messageId/thread",
    summary: "List replies in a thread",
    tags: ["Messages"],
  })
  .input(
    z.object({
      messageId: z.string(),
    })
  )
  .output(
    z.object({
      parent: z.custom<MessageListItem>(),
      messages: z.array(z.custom<MessageListItem>()),
    })
  )
  .handler(async ({ input, context, errors }) => {
    const parentRow = await prisma.message.findFirst({
      where: {
        id: input.messageId,
        Channel: {
          workspaceId: context.workspace.orgCode,
        },
      },
      include: {
        _count: {
          select: {
            replies: true,
          },
        },
        MessageReaction: {
          select: {
            emoji: true,
            userId: true,
          },
        },
      },
    });
    if (!parentRow) {
      throw errors.NOT_FOUND();
    }
    //fetch messages all thread replies
    const messagesQuery = await prisma.message.findMany({
      where: {
        threadId: input.messageId,
      },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      include: {
        _count: {
          select: {
            replies: true,
          },
        },
        MessageReaction: {
          select: {
            emoji: true,
            userId: true,
          },
        },
      },
    });

    const parent: MessageListItem = {
      id: parentRow.id,
      content: parentRow.content,
      imageUrl: parentRow.imageUrl,
      authorAvatar: parentRow.authorAvatar,
      authorEmail: parentRow.authorEmail,
      authorId: parentRow.authorId,
      authorName: parentRow.authorName,
      channelId: parentRow.channelId,
      createdAt: parentRow.createdAt,
      updatedAt: parentRow.updatedAt,
      threadId: parentRow.threadId,
      repliesCount: parentRow._count.replies,
      reactions: groupReactions(
        parentRow.MessageReaction.map((r) => ({
          emoji: r.emoji,
          userId: r.userId,
        })),
        context.user.id
      ),
    };
    const messages: MessageListItem[] = messagesQuery.map((msg) => ({
      id: msg.id,
      content: msg.content,
      imageUrl: msg.imageUrl,
      authorAvatar: msg.authorAvatar,
      authorEmail: msg.authorEmail,
      authorId: msg.authorId,
      authorName: msg.authorName,
      channelId: msg.channelId,
      createdAt: msg.createdAt,
      updatedAt: msg.updatedAt,
      threadId: msg.threadId,
      repliesCount: msg._count.replies,
      reactions: groupReactions(
        msg.MessageReaction.map((r) => ({
          emoji: r.emoji,
          userId: r.userId,
        })),
        context.user.id
      ),
    }));

    return {
      parent,
      messages,
    };
  });

export const toggleReaction = base
  .use(requiredAuthMiddleware)
  .use(requiredWorkspaceMiddleware)
  .use(standardSecurityMiddleware)
  .use(standardWriteSecurityMiddleware)
  .route({
    method: "POST",
    path: "/messages/:messageId/reactions",
    summary: "Toggle a reactions",
    tags: ["Messages"],
  })
  .input(toggleReactionSchema)
  .output(
    z.object({
      messageId: z.string(),
      reactions: z.array(GroupedReactionSchema),
    })
  )
  .handler(async ({ input, context, errors }) => {
    const message = await prisma.message.findFirst({
      where: {
        id: input.messageId,
        Channel: {
          workspaceId: context.workspace.orgCode,
        },
      },
      select: {
        id: true,
      },
    });

    if (!message) {
      throw errors.NOT_FOUND();
    }

    const inserted = await prisma.messageReaction.createMany({
      data: [
        {
          emoji: input.emoji,
          messageId: input.messageId,
          userId: context.user.id,
          userName: context.user.given_name ?? "John Doe",
          userAvatar: getAvatar(context.user.picture, context.user.email!),
          userEmail: context.user.email!,
        },
      ],
      skipDuplicates: true,
    });

    if (inserted.count === 0) {
      await prisma.messageReaction.deleteMany({
        where: {
          messageId: input.messageId,
          userId: context.user.id,
          emoji: input.emoji,
        },
      });
    }

    const updated = await prisma.message.findUnique({
      where: {
        id: input.messageId,
      },
      include: {
        MessageReaction: {
          select: {
            emoji: true,
            userId: true,
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
    });

    if (!updated) {
      throw errors.NOT_FOUND();
    }

    return {
      messageId: updated.id,
      reactions: groupReactions(
        (updated.MessageReaction ?? []).map((r) => ({
          emoji: r.emoji,
          userId: r.userId,
        })),
        context.user.id
      ),
    };
  });
