"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";

export function WorkspaceHeader() {
  const {
    data: { currentWorkspace },
  } = useSuspenseQuery(orpc.channel.list.queryOptions());
  return <h2 className="text-lg font-semibold">{currentWorkspace.orgName}</h2>;
}
