"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UiIntentBuilder = void 0;
class UiIntentBuilder {
    build(synthesis, data) {
        const intents = [];
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
}
exports.UiIntentBuilder = UiIntentBuilder;
