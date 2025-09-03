"use client";

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Globe, BookOpen, Users, Landmark } from "lucide-react";

const sources = [
    { id: "web", name: "Web", description: "Search across the entire Internet", icon: Globe, default: true },
    { id: "academic", name: "Academic", description: "Search academic papers", icon: BookOpen, default: false },
    { id: "social", name: "Social", description: "Discussions and opinions", icon: Users, default: false },
    { id: "finance", name: "Finance", description: "Search SEC filings", icon: Landmark, default: false },
];

export function SearchSourceSwitcher() {
    const [sourceState, setSourceState] = useState(
        sources.reduce((acc, source) => ({ ...acc, [source.id]: source.default }), {})
    );

    const handleCheckedChange = (id: string, checked: boolean) => {
        setSourceState(prev => ({ ...prev, [id]: checked }));
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full text-muted-foreground hover:bg-neutral-700 hover:text-white"
                >
                    <Globe className="h-5 w-5" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-neutral-800 border-neutral-700 text-white p-2" sideOffset={10} align="end">
                <div className="grid gap-1">
                    {sources.map((source) => (
                         <div key={source.id} className="flex items-center justify-between p-2">
                            <div className="flex items-center gap-3">
                                <source.icon className="h-5 w-5 text-muted-foreground" />
                                <div className="space-y-1">
                                    <label htmlFor={`source-${source.id}`} className="font-medium text-sm">{source.name}</label>
                                    <p className="text-xs text-muted-foreground">{source.description}</p>
                                </div>
                            </div>
                           <Switch id={`source-${source.id}`} checked={sourceState[source.id]} onCheckedChange={(checked) => handleCheckedChange(source.id, checked)} />
                       </div>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}
