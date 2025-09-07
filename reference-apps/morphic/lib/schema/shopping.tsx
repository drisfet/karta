import { z } from 'zod'

export const shoppingSchema = z.object({
  query: z.string().describe('The product or item to search for'),
  url: z.string().optional().describe('Optional specific retailer URL to scrape'),
  max_results: z
    .number()
    .optional()
    .describe('Maximum number of products to return. Default is 10'),
  retailer: z
    .string()
    .optional()
    .describe('Specific retailer to search (woolworths, coles, aldi, bigw, etc.)')
})

export type ShoppingParams = z.infer<typeof shoppingSchema>