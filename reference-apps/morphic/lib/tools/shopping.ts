import { tool } from 'ai'

// import { Browser, chromium, Page } from 'playwright'
import { shoppingSchema } from '@/lib/schema/shopping'

export interface ProductResult {
  name: string
  price: number
  currency: string
  retailer: string
  url: string
  image?: string
  availability: boolean
  rating?: number
  description?: string
}

export interface ShoppingResults {
  products: ProductResult[]
  query: string
  retailer?: string
  ui_intents?: Array<{
    type: string
    panel: string
    props: any
  }>
}

// Retailer configurations for known sites
const retailerConfigs: Record<string, {
  baseUrl: string
  searchSelector?: string
  productSelectors: {
    container?: string
    name: string
    price: string
    image?: string
    url?: string
    availability?: string
  }
}> = {
  woolworths: {
    baseUrl: 'https://www.woolworths.com.au',
    searchSelector: 'input[placeholder*="search"], [data-testid="search-input"], #search',
    productSelectors: {
      container: '[data-testid="product-tile"], .product-tile, .product-item, [data-product]',
      name: '[data-testid="product-name"], .product-name, .product-title, h3, h4',
      price: '[data-testid="product-price"], .product-price, .price, [data-price]',
      image: '[data-testid="product-image"] img, .product-image img, img',
      url: 'a[data-testid="product-tile-link"], .product-link, a',
      availability: '[data-testid="availability-message"], .availability'
    }
  },
  coles: {
    baseUrl: 'https://www.coles.com.au',
    searchSelector: '#search-input',
    productSelectors: {
      container: '.product-item',
      name: '.product-name',
      price: '.price',
      image: '.product-image img',
      url: '.product-link',
      availability: '.availability'
    }
  },
  aldi: {
    baseUrl: 'https://www.aldi.com.au',
    searchSelector: '#search-input',
    productSelectors: {
      container: '.product-item',
      name: '.product-title',
      price: '.product-price',
      image: '.product-image img',
      url: '.product-link'
    }
  },
  bigw: {
    baseUrl: 'https://www.bigw.com.au',
    searchSelector: '#search-input',
    productSelectors: {
      container: '.product-item',
      name: '.product-name',
      price: '.product-price',
      image: '.product-image img',
      url: '.product-link'
    }
  }
}

/*
class ShoppingScraper {
  private browser: Browser | null = null

  async init() {
    if (!this.browser) {
      this.browser = await chromium.launch({ headless: true })
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
  }

  async scrapeProducts(
    query: string,
    url?: string,
    retailer?: string,
    maxResults: number = 10
  ): Promise<ProductResult[]> {
    await this.init()
    const page = await this.browser!.newPage()

    try {
      let targetUrl = url
      const config = retailer ? retailerConfigs[retailer] : null

      if (!targetUrl && config) {
        targetUrl = config.baseUrl
      } else if (!targetUrl) {
        // Generic search - use a search engine to find retailers
        targetUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}+price+site:woolworths.com.au+OR+site:coles.com.au+OR+site:aldi.com.au`
      }

      console.log(`🌐 Navigating to: ${targetUrl}`)
      await page.goto(targetUrl!, { waitUntil: 'networkidle' })

      // If we have a specific retailer config, use it
      if (config && config.searchSelector) {
        console.log(`🔍 Searching for: ${query}`)
        const searchInput = page.locator(config.searchSelector).first()
        if (await searchInput.isVisible()) {
          await searchInput.fill(query)
          await searchInput.press(query)
          await searchInput.press('Enter')
          await page.waitForLoadState('networkidle')
        }
      }

      // Debug: Log page content
      const pageTitle = await page.title()
      console.log(`📄 Page title: ${pageTitle}`)
      const bodyText = await page.locator('body').textContent()
      console.log(`📝 Page has content: ${bodyText ? bodyText.length : 0} characters`)

      // Extract products using intelligent selectors
      const products = await this.extractProducts(page, config, maxResults)

      return products
    } catch (error) {
      console.error('Scraping error:', error)
      return []
    } finally {
      await page.close()
    }
  }

  private async extractProducts(
    page: Page,
    config: any,
    maxResults: number
  ): Promise<ProductResult[]> {
    const products: ProductResult[] = []

    try {
      // Try retailer-specific selectors first
      if (config?.productSelectors?.container) {
        const containers = page.locator(config.productSelectors.container)
        const count = await containers.count()

        for (let i = 0; i < Math.min(count, maxResults); i++) {
          const container = containers.nth(i)
          const product = await this.extractProductFromContainer(container, config)
          if (product) products.push(product)
        }
      }

      // Fallback to generic selectors if no specific config or no results
      if (products.length === 0) {
        products.push(...await this.extractGenericProducts(page, maxResults))
      }

      return products
    } catch (error) {
      console.error('Product extraction error:', error)
      return []
    }
  }

  private async extractProductFromContainer(
    container: any,
    config: any
  ): Promise<ProductResult | null> {
    try {
      const selectors = config.productSelectors

      const name = await container.locator(selectors.name).first().textContent()
      const priceText = await container.locator(selectors.price).first().textContent()
      const image = selectors.image ? await container.locator(selectors.image).first().getAttribute('src') : undefined
      const url = selectors.url ? await container.locator(selectors.url).first().getAttribute('href') : undefined

      if (!name || !priceText) return null

      const price = this.parsePrice(priceText)
      const fullUrl = url ? (url.startsWith('http') ? url : `${config.baseUrl}${url}`) : config.baseUrl

      return {
        name: name.trim(),
        price,
        currency: 'AUD',
        retailer: config.baseUrl.replace('https://www.', '').replace('https://', '').split('.')[0],
        url: fullUrl,
        image: image || undefined,
        availability: true,
        description: name.trim()
      }
    } catch (error) {
      return null
    }
  }

  private async extractGenericProducts(page: Page, maxResults: number): Promise<ProductResult[]> {
    const products: ProductResult[] = []

    // Generic selectors for common e-commerce patterns
    const genericSelectors = [
      '.product-item, .product-card, .product-tile, [data-product]',
      '.product-name, .product-title, h3, h4',
      '.price, .product-price, [data-price]',
      '.product-image img, img.product-image'
    ]

    try {
      // Look for product containers
      const containers = page.locator(genericSelectors[0])
      const count = await containers.count()

      for (let i = 0; i < Math.min(count, maxResults); i++) {
        const container = containers.nth(i)

        const name = await container.locator(genericSelectors[1]).first().textContent()
        const priceText = await container.locator(genericSelectors[2]).first().textContent()
        const image = await container.locator(genericSelectors[3]).first().getAttribute('src') || undefined

        if (name && priceText) {
          const price = this.parsePrice(priceText)
          products.push({
            name: name.trim(),
            price,
            currency: 'AUD',
            retailer: page.url().replace('https://www.', '').replace('https://', '').split('.')[0],
            url: page.url(),
            image,
            availability: true,
            description: name.trim()
          })
        }
      }
    } catch (error) {
      console.error('Generic extraction error:', error)
    }

    return products
  }

  private parsePrice(priceText: string): number {
    // Extract numeric price from text like "$1.99", "1.99 AUD", etc.
    const match = priceText.match(/\$?(\d+(?:\.\d{2})?)/)
    return match ? parseFloat(match[1]) : 0
  }
}
*/

// Global scraper instance
// const scraper = new ShoppingScraper()

// Cleanup on process exit
// process.on('exit', () => {
//   scraper.close()
// })

export function createShoppingTool(fullModel: string) {
  return tool({
    description: 'Search for products and prices on e-commerce sites',
    parameters: shoppingSchema,
    execute: async ({
      query,
      url,
      max_results = 10,
      retailer
    }) => {
      console.log(`🛒 Shopping search: ${query}, retailer: ${retailer || 'any'}`)

      try {
        // Return comprehensive mock data from multiple retailers
        // This simulates searching across all major retailers
        const retailers = ['Woolworths', 'Coles', 'ALDI', 'BigW', 'JB Hi-Fi', 'Harvey Norman']
        const mockProducts: ProductResult[] = []

        retailers.forEach((retailerName, retailerIndex) => {
          // Create 2-3 products per retailer
          const numProducts = Math.min(3, Math.max(1, max_results - mockProducts.length))
          for (let i = 0; i < numProducts && mockProducts.length < max_results; i++) {
            const price = (800 + (retailerIndex * 50) + (i * 100) + Math.random() * 200).toFixed(2)
            mockProducts.push({
              name: `${query} - ${['Premium', 'Standard', 'Budget'][i] || 'Value'} Model`,
              price: parseFloat(price),
              currency: 'AUD',
              retailer: retailerName,
              url: `https://www.${retailerName.toLowerCase().replace(/\s+/g, '')}.com.au/${query.replace(/\s+/g, '-').toLowerCase()}`,
              image: `https://via.placeholder.com/100x100?text=${retailerName.slice(0, 3)}`,
              availability: Math.random() > 0.2, // 80% availability
              description: `${['High-quality', 'Reliable', 'Affordable'][i] || 'Great value'} ${query} from ${retailerName}`
            })
          }
        })

        const result: ShoppingResults = {
          products: mockProducts,
          query,
          retailer,
          ui_intents: [{
            type: 'OPEN_PANEL',
            panel: 'SHOPPING',
            props: {
              title: `Shopping Results for "${query}"`,
              products: mockProducts,
              query,
              loading: false
            }
          }]
        }

        console.log(`✅ Found ${mockProducts.length} mock products for retailer: ${retailer}`)
        console.log(`📦 Returning result with ui_intents:`, !!result.ui_intents)
        return result
      } catch (error) {
        console.error('Shopping tool error:', error)
        const errorResult = {
          products: [],
          query,
          retailer,
          error: error instanceof Error ? error.message : 'Unknown error',
          ui_intents: [{
            type: 'OPEN_PANEL',
            panel: 'SHOPPING',
            props: {
              title: `Shopping Results for "${query}"`,
              products: [],
              query,
              loading: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            }
          }]
        }
        console.log(`❌ Returning error result with ui_intents:`, !!errorResult.ui_intents)
        return errorResult
      }
    }
  })
}

// Default export for backward compatibility
export const shoppingTool = createShoppingTool('openai:gpt-4o-mini')

export async function searchShopping(
  query: string,
  url?: string,
  maxResults: number = 10,
  retailer?: string
): Promise<ShoppingResults> {
  return shoppingTool.execute(
    {
      query,
      url,
      max_results: maxResults,
      retailer
    },
    {
      toolCallId: 'shopping',
      messages: []
    }
  )
}