import { SynthesisResult } from '../synthesizer/synthesizer';
import { RetrievedData } from '../retriever/retriever';

export interface UiIntent {
  type: string;
  panel: string;
  props: any;
}

export class UiIntentBuilder {
  build(synthesis: SynthesisResult, data: RetrievedData): UiIntent[] {
    const intents: UiIntent[] = [];

    // Answer panel
    intents.push({
      type: 'OPEN_PANEL',
      panel: 'ANSWER',
      props: {
        title: 'Search Results',
        html: synthesis.html,
        citations: synthesis.citations,
      },
    });

    // Sources panel
    if (synthesis.citations.length > 0) {
      intents.push({
        type: 'OPEN_PANEL',
        panel: 'SOURCES',
        props: {
          sources: synthesis.citations,
        },
      });
    }

    // Images panel if available
    if (data.images && data.images.length > 0) {
      intents.push({
        type: 'OPEN_PANEL',
        panel: 'IMAGES',
        props: {
          images: data.images,
        },
      });
    }

    return intents;
  }

  buildShop(synthesis: SynthesisResult, data: RetrievedData): UiIntent[] {
    const intents: UiIntent[] = [];

    // Shopping panel
    if (synthesis.items && synthesis.items.length > 0) {
      intents.push({
        type: 'OPEN_PANEL',
        panel: 'SHOPPING',
        props: {
          title: 'Shopping Results',
          offers: synthesis.items,
        },
      });
    }

    return intents;
  }
}