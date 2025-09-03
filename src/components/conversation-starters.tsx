"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import React from 'react';

const starters = [
  { title: "Trending in Aus", query: "What are the trending topics in Australia today?", hint: "news social" },
  { title: "Sports Pulse", query: "Latest Australian sports news", hint: "stadium sport" },
  { title: "Set the Record Straight", query: "Fact-check common Australian myths", hint: "library book" },
  { title: "Market Movers", query: "What's happening in the Australian stock market?", hint: "city skyscraper" },
];

type StarterCardProps = {
  title: string;
  query: string;
  hint: string;
  onQuery: (query: string) => void;
};

function StarterCard({ title, query, hint, onQuery }: StarterCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { currentTarget: card } = e;
    const { left, top, width, height } = card.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / 20;
    const y = (e.clientY - top - height / 2) / 20;
    card.style.transform = `perspective(1000px) rotateY(${x}deg) rotateX(${-y}deg) scale3d(1.05, 1.05, 1.05)`;
  };
  
  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'perspective(1000px) rotateY(0) rotateX(0) scale3d(1, 1, 1)';
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => onQuery(query)}
      className="p-1 cursor-pointer transition-transform duration-300 ease-out"
      style={{ transformStyle: "preserve-3d" }}
    >
      <Card className="group relative h-48 w-full overflow-hidden rounded-xl border-2 border-transparent bg-neutral-900 transition-all hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20">
        <CardContent className="relative z-10 flex h-full flex-col justify-end p-4">
          <h3 className="font-headline text-lg font-bold text-white">{title}</h3>
        </CardContent>
        <Image
          src={`https://picsum.photos/400/300?random=${Buffer.from(hint).toString('hex')}`}
          alt={title}
          fill
          width={400}
          height={300}
          className="object-cover opacity-20 transition-opacity group-hover:opacity-30"
          data-ai-hint={hint}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </Card>
    </div>
  );
}

type ConversationStartersProps = {
  onQuery: (query: string) => void;
};

export function ConversationStarters({ onQuery }: ConversationStartersProps) {
  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      className="w-full"
    >
      <CarouselContent>
        {starters.map((starter) => (
          <CarouselItem key={starter.title} className="md:basis-1/2 lg:basis-1/3">
            <StarterCard {...starter} onQuery={onQuery} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="ml-12 text-white" />
      <CarouselNext className="mr-12 text-white" />
    </Carousel>
  );
}
