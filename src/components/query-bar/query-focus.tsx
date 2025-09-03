"use client";

import { Button } from "@/components/ui/button";
import { CheckSquare, DollarSign, Dribbble, BookOpen } from "lucide-react";

const focusOptions = [
    { label: "Fact Check", icon: CheckSquare, query: "Fact check: " },
    { label: "Finance", icon: DollarSign, query: "What's happening in Australian finance: " },
    { label: "Sports", icon: Dribbble, query: "Latest in Australian sports: " },
    { label: "Academic", icon: BookOpen, query: "Academic search: " },
];

interface QueryFocusProps {
    onQuery: (query: string) => void;
}

export function QueryFocus({ onQuery }: QueryFocusProps) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground mr-2">Focus:</span>
            {focusOptions.map(option => (
                <Button 
                    key={option.label}
                    variant="outline" 
                    size="sm" 
                    className="bg-neutral-700/50 border-neutral-600 hover:bg-neutral-600/50 hover:text-white"
                    onClick={() => onQuery(option.query)}
                >
                    <option.icon className="h-4 w-4 mr-2" />
                    {option.label}
                </Button>
            ))}
        </div>
    );
}
