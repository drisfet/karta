"use client";

import { Button } from "@/components/ui/button";
import { Paperclip } from "lucide-react";
import React from "react";

export function AttachmentButton() {
    const handleAttachFile = () => {
        // Placeholder for file attachment logic
        console.log("Attach file clicked");
    };

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleAttachFile}
            className="h-8 w-8 rounded-full text-muted-foreground hover:bg-neutral-700 hover:text-white"
        >
            <Paperclip className="h-5 w-5" />
        </Button>
    );
}
