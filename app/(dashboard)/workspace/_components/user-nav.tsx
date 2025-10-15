"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAvatar } from "@/lib/get-avatar";
import { orpc } from "@/lib/orpc";
import {
  LogoutLink,
  PortalLink,
} from "@kinde-oss/kinde-auth-nextjs/components";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CreditCard, LogOut, User } from "lucide-react";


export function UserNav() {
  const {data: {user}} = useSuspenseQuery(orpc.workspace.list.queryOptions())
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="size-10 rounded-xl hover:rounded-lg transition-all duration-200 bg-background/50 border-border/50 hover:bg-accent hover:text-accent-foreground"
          variant="outline"
          size="icon"
        >
          <Avatar>
            <AvatarImage
              src={getAvatar(user.picture, user.email!)}
              alt="user-image"
              className="object-cover"
            />
            <AvatarFallback>
              {user.given_name?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side="right"
        sideOffset={8}
        className="w-[200px]"
      >
        <DropdownMenuLabel className="font-normal flex items-center gap-2 px-1 py-1.5 text-left text-sm">
          <Avatar className="relative size-8 rounded-lg">
            <AvatarImage
              src={getAvatar(user.picture, user.email!)}
              alt="user-image"
              className="object-cover"
            />
            <AvatarFallback>
              {user.given_name?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <p className="truncate">{user.given_name}</p>
            <p className="text-muted-foreground text-xs truncate">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <PortalLink>
              <User /> Account
            </PortalLink>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <PortalLink>
              <CreditCard /> Billing
            </PortalLink>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <LogoutLink>
            <LogOut /> Logout
          </LogoutLink>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
