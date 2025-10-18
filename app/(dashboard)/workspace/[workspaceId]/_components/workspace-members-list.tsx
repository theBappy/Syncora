import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";

const members = [
  {
    id: 1,
    name: "The Bappy",
    imageUrl: "https://avatars.githubusercontent.com/u/182516578?v=4",
    email: "abappy575@gmail.com",
  },
  {
    id: 2,
    name: "John Doe",
    imageUrl: "https://avatars.githubusercontent.com/u/182516578?v=4",
    email: "johndoe@gmail.com",
  },
];

export function WorkspaceMembersList() {
  return (
    <div className="space-y-0.5 py-1">
      {members.map((member) => (
        <div key={member.id} className="px-3 py-2 hover:bg-accent cursor-pointer transition-colors flex items-center space-x-3">
          <div className="relative">
            <Avatar className="size-8 relative">
              <Image
                src={member.imageUrl}
                alt="user image"
                className="object-cover"
                fill
              />
              <AvatarFallback>
                {member.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{member.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {member.email}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
