import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const workspaces = [
  { id: "1", name: "Alpha", avatar: "AL" },
  { id: "2", name: "Nova", avatar: "NO" },
  { id: "3", name: "Orion", avatar: "OR" },
  { id: "4", name: "Phoenix", avatar: "PH" },
  { id: "5", name: "Titan", avatar: "TI" }
];

const colorCombinations = [
  "bg-blue-500 hover:bg-blue-600 text-white",
  "bg-green-500 hover:bg-green-600 text-white",
  "bg-red-500 hover:bg-red-600 text-white",
  "bg-purple-500 hover:bg-purple-600 text-white",
  "bg-yellow-500 hover:bg-yellow-600 text-black",
  "bg-pink-500 hover:bg-pink-600 text-white",
  "bg-indigo-500 hover:bg-indigo-600 text-white"
];

const getWorkspaceColor = (id: string) => {
  const charSum = id
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);

    const colorIndex = charSum % colorCombinations.length;
    
    return colorCombinations[colorIndex];
};

export function WorkspaceList() {
  return (
    <TooltipProvider>
      <div className="flex flex-col gap-2">
        {workspaces.map((ws) => (
          <Tooltip key={ws.id}>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                className={cn("size-10 transition-all duration-200", getWorkspaceColor(ws.id))}
              >
                <span className="text-sm font-semibold">{ws.avatar}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
                <p>{ws.name}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
