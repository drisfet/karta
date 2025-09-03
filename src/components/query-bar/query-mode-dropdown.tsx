
"use client";

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Search, ChevronDown } from "lucide-react";

export function QueryModeDropdown() {
    const [deepResearchMode, setDeepResearchMode] = useState(false);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" className="h-10 text-muted-foreground hover:bg-neutral-700 hover:text-white rounded-full px-3 mr-2">
                    <Search className="h-5 w-5" />
                    <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-neutral-800 border-neutral-700 text-white" sideOffset={10}>
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Search</h4>
                        <p className="text-sm text-muted-foreground">
                            Fast answers to everyday questions.
                        </p>
                    </div>
                    <div className="border-t border-neutral-700 -mx-4"></div>
                    <div className="flex items-center justify-between">
                         <div className="space-y-1">
                             <label htmlFor="deep-research-mode" className="font-medium">Deep Research</label>
                             <p className="text-xs text-muted-foreground">Comprehensive results from more sources.</p>
                         </div>
                        <Switch id="deep-research-mode" checked={deepResearchMode} onCheckedChange={setDeepResearchMode} />
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
