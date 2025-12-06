"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
import { orpc } from "@/lib/orpc";
import { useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { getAvatar } from "@/lib/get-avatar";
import { useMemo } from "react";
import { User } from "@/app/schemas/realtime";
import { usePresence } from "@/hooks/use-presence";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";

export function WorkspaceMembersList() {
  const {
    data: { members },
  } = useSuspenseQuery(orpc.channel.list.queryOptions());

  const { data: workspaceData } = useQuery(orpc.workspace.list.queryOptions());

  const currentUser = useMemo(() => {
    if (!workspaceData?.user) return null;

    return {
      id: workspaceData.user.id,
      full_name: workspaceData.user.given_name,
      email: workspaceData.user.email,
      picture: workspaceData.user.picture,
    } satisfies User;
  }, [workspaceData]);

  const params = useParams();
  const workspaceId = params.workspaceId as string;

  const { onlineUsers } = usePresence({
    room: `workspace-${workspaceId}`,
    currentUser,
  });

  const onlineUsersIds = useMemo(
    () => new Set(onlineUsers.map((u) => u.id)),
    [onlineUsers]
  );

  return (
    <div className="space-y-0.5 py-1">
      {members.map((member) => (
        <div
          key={member.id}
          className="px-3 py-2 hover:bg-accent cursor-pointer transition-colors flex items-center space-x-3"
        >
          <div className="relative">
            <Avatar className="size-8 relative">
              <Image
                src={getAvatar(member.picture ?? null, member.email!)}
                alt="user image"
                className="object-cover"
                fill
              />
              <AvatarFallback>
                {member.full_name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Online / offline status indicator */}
            <div
              className={cn(
                "absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-background",
                member.id && onlineUsersIds.has(member.id)
                  ? "bg-green-500"
                  : "bg-gray-400"
              )}
            />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{member.full_name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {member.email}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
