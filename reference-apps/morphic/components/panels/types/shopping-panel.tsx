"use client";

import React, { useEffect, useRef, useState } from 'react';

import { ChevronDown, ChevronRight, ExternalLink, Minus, ShoppingCart, Star, TrendingDown,X } from "lucide-react";

import { ProductResult } from '@/lib/tools/shopping';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

import { BasePanelConfig, PanelComponentProps } from '../panel-registry';

interface ShoppingPanelConfig extends BasePanelConfig {
  type: 'SHOPPING';
  props: {
    title?: string;
    products?: ProductResult[];
    query?: string;
    loading?: boolean;
    error?: string;
  };
}

interface ShoppingPanelProps extends PanelComponentProps<ShoppingPanelConfig> {}

export function ShoppingPanel({
  id,
  config,
  onUpdate,
  onClose,
  onFocus,
  onMinimize,
  onPositionChange,
  onSizeChange
}: ShoppingPanelProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [expandedRetailers, setExpandedRetailers] = useState<Record<string, boolean>>({});
  const panelRef = useRef<HTMLDivElement>(null);
  const offset = useRef({ x: 0, y: 0 });

  const products = config.props.products || [];
  const isLoading = config.props.loading || false;
  const error = config.props.error;

  // Group products by retailer
  const productsByRetailer = products.reduce((acc, product) => {
    const retailer = product.retailer;
    if (!acc[retailer]) {
      acc[retailer] = [];
    }
    acc[retailer].push(product);
    return acc;
  }, {} as Record<string, ProductResult[]>);

  // Sort retailers by best price (lowest first)
  const sortedRetailers = Object.keys(productsByRetailer).sort((a, b) => {
    const aMinPrice = Math.min(...productsByRetailer[a].map(p => p.price));
    const bMinPrice = Math.min(...productsByRetailer[b].map(p => p.price));
    return aMinPrice - bMinPrice;
  });

  const toggleRetailer = (retailer: string) => {
    setExpandedRetailers(prev => ({
      ...prev,
      [retailer]: !prev[retailer]
    }));
  };

  const handleMouseDownDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button, a, img')) return;
    onFocus();
    setIsDragging(true);
    const panelRect = panelRef.current!.getBoundingClientRect();
    offset.current = { x: e.clientX - panelRect.left, y: e.clientY - panelRect.top };
    document.body.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      onPositionChange({ x: e.clientX - offset.current.x, y: e.clientY - offset.current.y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.body.style.cursor = '';
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: currency === 'AUD' ? 'AUD' : 'USD'
    }).format(price);
  };

  const getRetailerColor = (retailer: string) => {
    const colors: Record<string, string> = {
      woolworths: 'bg-green-100 text-green-800',
      coles: 'bg-red-100 text-red-800',
      aldi: 'bg-blue-100 text-blue-800',
      bigw: 'bg-orange-100 text-orange-800',
      'jb hi-fi': 'bg-purple-100 text-purple-800',
      'harvey norman': 'bg-indigo-100 text-indigo-800',
      bestbuy: 'bg-cyan-100 text-cyan-800',
      walmart: 'bg-pink-100 text-pink-800',
      target: 'bg-teal-100 text-teal-800'
    };
    return colors[retailer.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div
      ref={panelRef}
      className="absolute flex flex-col rounded-xl shadow-2xl shadow-black/50 transition-shadow duration-300"
      style={{
        left: `${config.position?.x || 100}px`,
        top: `${config.position?.y || 100}px`,
        width: `${config.size?.width || 700}px`,
        height: `${config.size?.height || 800}px`,
        zIndex: config.zIndex || 1,
        boxShadow: `0 0 20px 0 hsl(var(--primary) / 0.3), 0 25px 50px -12px rgb(0 0 0 / 0.5)`
      }}
      onMouseDown={() => onFocus()}
    >
      <div className="flex-grow rounded-xl border border-primary/30 bg-neutral-900/60 backdrop-blur-xl flex flex-col overflow-hidden">
        <CardHeader
          className="flex-row items-center justify-between p-3 border-b cursor-grab flex-shrink-0"
          onMouseDown={handleMouseDownDrag}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <ShoppingCart className="h-4 w-4 text-primary flex-shrink-0" />
            <p className="font-code text-xs font-medium truncate select-none">
              {config.props.title || config.title || 'Shopping Results'}
            </p>
            {config.props.query && (
              <Badge variant="secondary" className="text-xs">
                {config.props.query}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onMinimize}>
              <Minus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <div className="flex flex-col flex-grow min-h-0 overflow-y-auto">
          {error && (
            <div className="p-4 text-center text-red-400">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Searching for products...</p>
              </div>
            </div>
          )}

          {!isLoading && !error && products.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No products found</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Try searching for a different product
                </p>
              </div>
            </div>
          )}

          {!isLoading && !error && products.length > 0 && (
            <div className="p-4 space-y-3">
              {/* Best Price Summary */}
              <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-lg p-3 border border-green-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-4 w-4 text-green-400" />
                  <span className="text-sm font-medium text-green-400">Best Price Found</span>
                </div>
                <div className="text-lg font-bold text-white">
                  {formatPrice(Math.min(...products.map(p => p.price)), 'AUD')}
                </div>
                <div className="text-xs text-muted-foreground">
                  Across {sortedRetailers.length} retailers
                </div>
              </div>

              {/* Retailer Sections */}
              {sortedRetailers.map((retailer) => {
                const retailerProducts = productsByRetailer[retailer];
                const minPrice = Math.min(...retailerProducts.map(p => p.price));
                const isExpanded = expandedRetailers[retailer] ?? true; // Default expanded

                return (
                  <Collapsible key={retailer} open={isExpanded} onOpenChange={() => toggleRetailer(retailer)}>
                    <Card className="bg-neutral-800/50 border-neutral-700">
                      <CollapsibleTrigger asChild>
                        <CardHeader className="pb-3 cursor-pointer hover:bg-neutral-700/30 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              )}
                              <div>
                                <h3 className="font-medium text-sm">{retailer}</h3>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>{retailerProducts.length} products</span>
                                  <span>•</span>
                                  <span>From {formatPrice(minPrice, 'AUD')}</span>
                                </div>
                              </div>
                            </div>
                            <Badge className={getRetailerColor(retailer)}>
                              {retailer}
                            </Badge>
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            {retailerProducts.map((product, index) => (
                              <div key={index} className="flex gap-3 p-3 bg-neutral-900/50 rounded-lg">
                                {/* Product Image */}
                                <div className="flex-shrink-0">
                                  {product.image ? (
                                    <img
                                      src={product.image}
                                      alt={product.name}
                                      className="w-16 h-16 object-cover rounded bg-neutral-700"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                  ) : (
                                    <div className="w-16 h-16 bg-neutral-700 rounded flex items-center justify-center">
                                      <ShoppingCart className="h-6 w-6 text-neutral-500" />
                                    </div>
                                  )}
                                </div>

                                {/* Product Details */}
                                <div className="flex-grow min-w-0">
                                  <h4 className="font-medium text-sm leading-tight line-clamp-2 mb-1">
                                    {product.name}
                                  </h4>

                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-base font-bold text-primary">
                                      {formatPrice(product.price, product.currency)}
                                    </span>
                                    {!product.availability && (
                                      <Badge variant="destructive" className="text-xs">
                                        Out of Stock
                                      </Badge>
                                    )}
                                  </div>

                                  {product.description && (
                                    <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                                      {product.description}
                                    </p>
                                  )}

                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full text-xs"
                                    onClick={() => window.open(product.url, '_blank')}
                                  >
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    View Product
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}