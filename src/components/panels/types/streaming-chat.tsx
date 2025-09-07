"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUp, Loader2 } from "lucide-react";
import { UIMessage } from 'ai';

interface StreamingChatProps {
   messages: UIMessage[];
   sendMessage: (message: { text: string }) => void;
   status: string;
   error: Error | null;
   initialMessage?: string;
   isLoading?: boolean;
   className?: string;
   modelSelected?: boolean;
}

export function StreamingChat({ messages, sendMessage, status, error, initialMessage, isLoading, className = "", modelSelected = true }: StreamingChatProps) {
   const [input, setInput] = useState("");
   const messagesEndRef = useRef<HTMLDivElement>(null);

   const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
   };

   useEffect(() => {
      scrollToBottom();
   }, [messages]);


   const handleFormSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim()) return;

      sendMessage({ text: input });
      setInput("");
   };

 return (
   <div className={`relative h-full flex flex-col ${className}`}>
     {/* Messages Area - Fixed height with bottom padding for input */}
     <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
       {isLoading && messages.length === 0 && (
         <div className="flex justify-start">
           <div className="max-w-[80%] rounded-lg px-3 py-2 bg-neutral-800/80 text-white">
             <div className="text-sm">
               <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
               Processing your query...
             </div>
           </div>
         </div>
       )}
       {messages.length === 0 && !isLoading && initialMessage && (
         <div className="flex justify-start">
           <div className="max-w-[80%] rounded-lg px-3 py-2 bg-neutral-800/80 text-white">
             <div className="text-sm whitespace-pre-wrap">
               {initialMessage}
             </div>
           </div>
         </div>
       )}
       {messages.map((message, msgIndex) => (
         <div
           key={message.id}
           className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
         >
           <div
             className={`max-w-[80%] rounded-lg px-3 py-2 ${
               message.role === 'user'
                 ? 'bg-primary text-primary-foreground'
                 : 'bg-neutral-800/80 text-white'
             }`}
           >
             <div className="text-sm whitespace-pre-wrap">
                {(message as any).parts?.map((part: any, index: number) => {
                   if (part.type === 'text') {
                      return <span key={index}>{part.text}</span>;
                   }
                   return null;
                })}
             </div>
           </div>
         </div>
       ))}

       {/* Error Display */}
       {error && (
         <div className="flex justify-center">
           <div className="max-w-[80%] rounded-lg px-3 py-2 bg-red-900/20 border border-red-500/30 text-red-400">
             <div className="text-sm">
               {error.message?.includes('No AI model selected') ||
                error.message?.includes('NO_MODEL_SELECTED')
                 ? '⚠️ Please select a chat model from the model switcher above.'
                 : `Error: ${error.message || 'Something went wrong'}`}
             </div>
           </div>
         </div>
       )}

       <div ref={messagesEndRef} />
     </div>

     {/* Input Area - Fixed at bottom */}
     <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-white/10 bg-neutral-900/60 backdrop-blur-sm">
       <form onSubmit={handleFormSubmit} className="relative">
         <Input
           type="text"
           value={input}
           onChange={(e) => setInput(e.target.value)}
           placeholder={modelSelected ? "Ask a follow-up question..." : "Select a chat model first..."}
           disabled={!modelSelected}
           className="h-10 rounded-md bg-neutral-800/80 pr-12 text-sm focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
         />
         <Button
           type="submit"
           size="icon"
           className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-md bg-primary/20 text-primary-foreground hover:bg-primary/30 disabled:opacity-50"
           disabled={!input.trim() || !modelSelected}
         >
           <ArrowUp className="h-4 w-4" />
         </Button>
       </form>
     </div>
   </div>
 );
}