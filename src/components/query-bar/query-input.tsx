"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bot, Globe, Paperclip, Mic } from "lucide-react";
import { cn } from "@/lib/utils";

interface QueryInputProps {
    query: string;
    onQueryChange: (query: string) => void;
    isFocused: boolean;
}

export function QueryInput({ query, onQueryChange, isFocused }: QueryInputProps) {
    
    return (
        <div className="relative w-full">
            <Input
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder="Ask anything, mate..."
                className="h-14 rounded-full border-2 bg-neutral-900/80 px-4 pr-52 text-base backdrop-blur-sm focus:border-primary transition-all duration-300"
            />
            <div 
                className={cn(
                    "absolute right-14 top-1/2 -translate-y-1/2 flex items-center gap-1 transition-opacity duration-300",
                    isFocused ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
            >
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:bg-neutral-700 hover:text-white"><Bot className="h-5 w-5" /></Button>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:bg-neutral-700 hover:text-white"><Globe className="h-5 w-5" /></Button>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:bg-neutral-700 hover:text-white"><Paperclip className="h-5 w-5" /></Button>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:bg-neutral-700 hover:text-white"><Mic className="h-5 w-5" /></Button>
            </div>
        </div>
    );
}
