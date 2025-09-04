import { FastifyPluginAsync } from 'fastify';
import { chromium } from 'playwright';

const scrapeSchema = {
  type: 'object',
  required: ['data'],
  properties: {
    data: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        required: ['url'],
        properties: {
          url: {
            type: 'string',
            format: 'uri'
          },
          selector: {
            type: 'string'
          }
        }
      }
    }
  }
};

export const scrapeRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post('/scrape', {
    schema: {
      body: scrapeSchema,
    },
    handler: async (request, reply) => {
      const { data } = request.body as { data: Array<{ url: string; selector?: string }> };

      try {
        const results = await Promise.all(
          data.map(async (item) => {
            const browser = await chromium.launch();
            const page = await browser.newPage();
            await page.goto(item.url);
            await page.waitForLoadState('networkidle');

            const title = await page.title();
            const content = item.selector
              ? await page.locator(item.selector).textContent()
              : await page.locator('body').textContent();

            await browser.close();

            return {
              title,
              url: item.url,
              content: content || '',
            };
          })
        );

        reply.send({ results });
      } catch (error) {
        fastify.log.error(error);
        reply.code(500).send({ error: 'Scraping failed' });
      }
    },
  });
};