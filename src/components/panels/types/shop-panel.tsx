"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PanelComponentProps, BasePanelConfig } from '../panel-registry';

interface ShopItem {
  name: string;
  price: number;
  url: string;
}

interface ShopPanelProps extends PanelComponentProps {
  config: BasePanelConfig & {
    type: 'SHOPPING';
    props: {
      offers: ShopItem[];
    };
  };
}
export function ShopPanel({ config }: ShopPanelProps) {
  const { title } = config;
  const { offers } = config.props;

  // Safety check for offers
  if (!offers || !Array.isArray(offers)) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <p className="text-muted-foreground">No offers available</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {offers.map((item, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{item.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold text-green-600 mb-2">${item.price.toFixed(2)}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(item.url, '_blank')}
                className="w-full"
              >
                View Source
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}