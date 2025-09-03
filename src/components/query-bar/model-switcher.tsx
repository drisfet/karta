"use client";

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Bot, Check, ChevronDown, Rocket, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const models = [
    { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", description: "Fast and efficient", icon: Zap },
    { id: "gemini-2.0-pro", name: "Gemini 2.0 Pro", description: "Powerful and capable", icon: Rocket },
];

export function ModelSwitcher() {
    const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full text-muted-foreground hover:bg-neutral-700 hover:text-white"
                >
                    <Bot className="h-5 w-5" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-neutral-800 border-neutral-700 text-white p-2" sideOffset={10} align="end">
                <div className="grid gap-1">
                    <div className="px-2 py-1">
                        <h4 className="font-medium leading-none text-sm">Model</h4>
                        <p className="text-xs text-muted-foreground">
                            Select a model for your query.
                        </p>
                    </div>
                    {models.map((model) => (
                        <Button
                            key={model.id}
                            variant="ghost"
                            className={cn(
                                "flex items-center justify-start w-full h-auto text-left p-2",
                                selectedModel === model.id && "bg-primary/20"
                            )}
                            onClick={() => {
                                setSelectedModel(model.id);
                                setIsOpen(false);
                            }}
                        >
                            <model.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                            <div className="flex-grow">
                                <p className="font-medium text-sm">{model.name}</p>
                                <p className="text-xs text-muted-foreground">{model.description}</p>
                            </div>
                            {selectedModel === model.id && <Check className="h-4 w-4 ml-2 text-primary" />}
                        </Button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}
