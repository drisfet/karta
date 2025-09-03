"use client";

import { FormEvent, useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Wand } from "lucide-react";
import { QueryInput } from "./query-input";
import { QueryModeDropdown } from "./query-mode-dropdown";
import { QueryFocus } from "./query-focus";
import { cn } from "@/lib/utils";

type QueryBarProps = {
    onQuery: (query: string) => void;
};

export function QueryBar({ onQuery }: QueryBarProps) {
    const [query, setQuery] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            onQuery(query.trim());
            setQuery("");
        }
    };
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsFocused(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div 
            ref={containerRef}
            className={cn(
                "relative w-full max-w-3xl mx-auto transition-all duration-300",
                isFocused ? "bg-neutral-800/80 rounded-2xl backdrop-blur-md border border-neutral-700" : ""
            )}
            onFocus={() => setIsFocused(true)}
        >
            <div className={cn(
                "transition-all duration-300",
                isFocused ? 'p-4' : 'p-0'
            )}>
                <form onSubmit={handleSubmit} className="relative flex items-center w-full">
                    <QueryModeDropdown />
                    
                    <div className="relative flex-grow">
                        <QueryInput 
                            query={query}
                            onQueryChange={setQuery}
                            isFocused={isFocused}
                        />
                    </div>
                    
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <Button
                            type="submit"
                            size="icon"
                            className="h-10 w-10 rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105 active:scale-95"
                        >
                            <Sparkles className="h-5 w-5" />
                        </Button>
                    </div>
                </form>

                <div 
                    className={cn(
                        "transition-all duration-300 ease-in-out overflow-hidden",
                        isFocused ? "max-h-40 opacity-100 pt-4" : "max-h-0 opacity-0"
                    )}
                >
                    <div className="flex items-center justify-between">
                         <QueryFocus onQuery={onQuery} />
                         <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white">
                            <Wand className="h-4 w-4 mr-2"/>
                            Rewrite
                         </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
