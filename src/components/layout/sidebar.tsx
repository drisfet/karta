'use client';

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Home, Compass, LayoutGrid, LogIn } from "lucide-react";
import Link from "next/link";
import { AussieIcon } from "@/components/icons";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "#", icon: Compass, label: "Discover" },
  { href: "#", icon: LayoutGrid, label: "Spaces" },
];

export function AppSidebar() {
  return (
    <aside className="fixed left-0 top-0 z-50 flex h-full w-20 flex-col items-center border-r border-white/5 bg-background/30 py-6 backdrop-blur-lg">
      <Link href="/" className="mb-8">
        <AussieIcon />
      </Link>
      <TooltipProvider delayDuration={0}>
        <nav className="flex flex-col items-center gap-y-3">
          {navItems.map((item) => (
            <Tooltip key={item.label}>
              <TooltipTrigger asChild>
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  className={`rounded-lg transition-colors h-12 w-12 ${
                    item.label === 'Home'
                      ? 'bg-primary/20 text-primary-foreground hover:bg-primary/30'
                      : 'text-muted-foreground hover:bg-accent/10 hover:text-foreground'
                  }`}
                >
                  <Link href={item.href}>
                    <item.icon className="h-6 w-6" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="ml-2">
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </nav>
      </TooltipProvider>
      <div className="mt-auto">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button asChild variant="ghost" size="icon" className="rounded-lg text-muted-foreground hover:bg-accent/10 hover:text-foreground h-12 w-12">
                <Link href="#">
                  <LogIn className="h-6 w-6" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="ml-2">
              <p>Sign In</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </aside>
  );
}
