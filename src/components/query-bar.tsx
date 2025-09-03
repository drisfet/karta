"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import { FormEvent, useState } from "react";

type QueryBarProps = {
    onQuery: (query: string) => void;
};

export function QueryBar({ onQuery }: QueryBarProps) {
    const [query, setQuery] = useState("");

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            onQuery(query.trim());
            setQuery("");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto">
            <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask anything, mate..."
                className="h-14 rounded-full border-2 bg-neutral-900/80 pl-6 pr-16 text-base backdrop-blur-sm focus:border-primary"
            />
            <Button
                type="submit"
                size="icon"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105 active:scale-95"
            >
                <ArrowUp className="h-5 w-5" />
            </Button>
        </form>
    );
}
