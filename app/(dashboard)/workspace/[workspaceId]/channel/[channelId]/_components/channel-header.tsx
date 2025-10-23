import { ThemeToggle } from "@/components/theme/theme-toggle";
import InviteMembers from "./_members/invite-members";
import { MemberOverview } from "./_members/members-overview";

interface ChannelHeaderProps {
  channelName: string | undefined;
}

export function ChannelHeader({ channelName }: ChannelHeaderProps) {
  return (
    <div className="flex items-center justify-between h-14 px-4 border-b">
      <h1 className="text-lg font-semibold">#{channelName}</h1>
      <div className="flex items-center space-x-3">
        <MemberOverview />
        <InviteMembers />
        <ThemeToggle />
      </div>
    </div>
  );
}
