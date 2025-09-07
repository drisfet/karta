"use client";

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { MessageSquare, Check, ChevronDown, Zap, Rocket, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChatModel } from "@/hooks/use-chat-model";
import { chatModels } from "@/lib/models";


export function ChatModelSwitcher() {
    const [isOpen, setIsOpen] = useState(false);
    const { selectedModel, setSelectedModel } = useChatModel();

    const handleModelSelect = (modelId: string) => {
        setSelectedModel(modelId);
        setIsOpen(false);
    };

    const selectedModelData = selectedModel ? chatModels.find(model => model.id === selectedModel) : null;

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 rounded-full hover:bg-neutral-700 hover:text-white border ${
                        selectedModel
                            ? 'text-muted-foreground border-neutral-600'
                            : 'text-yellow-400 border-yellow-500 animate-pulse'
                    }`}
                    title={selectedModel
                        ? `Chat Model: ${selectedModelData?.name || 'Unknown'}`
                        : 'Click to select a chat model'
                    }
                >
                    <MessageSquare className="h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 bg-neutral-800 border-neutral-700 text-white p-2" sideOffset={10} align="end">
                <div className="grid gap-1">
                    <div className="px-2 py-1">
                        <h4 className="font-medium leading-none text-sm">Chat Model</h4>
                        <p className="text-xs text-muted-foreground">
                            Select a model for chat conversations.
                        </p>
                    </div>

                    {/* Google Gemini Models */}
                    <div className="px-2 py-1">
                        <h5 className="text-xs font-semibold text-primary">Google Gemini</h5>
                    </div>
                    {chatModels.filter(model => model.provider === "Google").map((model) => (
                        <Button
                            key={model.id}
                            variant="ghost"
                            className={cn(
                                "flex items-center justify-start w-full h-auto text-left p-2 ml-2",
                                selectedModel === model.id && "bg-primary/20"
                            )}
                            onClick={() => handleModelSelect(model.id)}
                        >
                            <model.icon className="h-4 w-4 mr-3 flex-shrink-0" />
                            <div className="flex-grow">
                                <p className="font-medium text-sm">{model.name}</p>
                                <p className="text-xs text-muted-foreground">{model.description}</p>
                            </div>
                            {selectedModel === model.id && <Check className="h-4 w-4 ml-2 text-primary" />}
                        </Button>
                    ))}

                    {/* OpenRouter Models */}
                    <div className="px-2 py-2 border-t border-neutral-700">
                        <h5 className="text-xs font-semibold text-green-400">OpenRouter (Free)</h5>
                    </div>
                    {chatModels.filter(model => model.provider === "OpenRouter").map((model) => (
                        <Button
                            key={model.id}
                            variant="ghost"
                            className={cn(
                                "flex items-center justify-start w-full h-auto text-left p-2 ml-2",
                                selectedModel === model.id && "bg-green-500/20"
                            )}
                            onClick={() => handleModelSelect(model.id)}
                        >
                            <model.icon className="h-4 w-4 mr-3 flex-shrink-0" />
                            <div className="flex-grow">
                                <p className="font-medium text-sm">{model.name}</p>
                                <p className="text-xs text-muted-foreground">{model.description}</p>
                            </div>
                            {selectedModel === model.id && <Check className="h-4 w-4 ml-2 text-green-400" />}
                        </Button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}