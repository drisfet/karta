"use client";

import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";
import React from "react";

export function VoiceInputButton() {
    const handleVoiceInput = () => {
        // Placeholder for voice input logic
        console.log("Voice input clicked");
    };

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleVoiceInput}
            className="h-8 w-8 rounded-full text-muted-foreground hover:bg-neutral-700 hover:text-white"
        >
            <Mic className="h-5 w-5" />
        </Button>
    );
}
