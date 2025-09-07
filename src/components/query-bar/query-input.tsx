"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ModelSwitcher } from "./model-switcher";
import { ChatModelSwitcher } from "./chat-model-switcher";
import { SearchSourceSwitcher } from "./search-source-switcher";
import { AttachmentButton } from "./attachment-button";
import { VoiceInputButton } from "./voice-input-button";

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
                <ModelSwitcher />
                <ChatModelSwitcher />
                <SearchSourceSwitcher />
                <AttachmentButton />
                <VoiceInputButton />
            </div>
        </div>
    );
}
