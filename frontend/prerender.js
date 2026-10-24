// Post-build pre-render for the public marketing routes.
// Serves the freshly built dist with Vite preview, loads each route in a
// headless browser so React + the Seo component run, then saves the fully
// rendered HTML as dist/<route>/index.html. Crawlers and link-preview
// scrapers then get real content + per-page tags without executing JS.
// Vercel serves these static files directly; every other route still falls
// through to the SPA index.html via the existing rewrite.
import { preview } from 'vite'
import puppeteer from 'puppeteer'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'

const ROUTES = ['/home', '/about', '/contact', '/privacy', '/terms']
const PORT = 4188

const server = await preview({ preview: { port: PORT, strictPort: true } })
const base = `http://localhost:${PORT}`
console.log('[prerender] preview server on', base)

const browser = await puppeteer.launch({
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
})

let failed = false
for (const route of ROUTES) {
  const page = await browser.newPage()
  try {
    await page.goto(base + route, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForSelector('#root > *', { timeout: 15000 })
    await new Promise((r) => setTimeout(r, 800)) // let the Seo effect + render settle
    const html = await page.content()
    const outPath = join('dist', route.slice(1), 'index.html')
    mkdirSync(dirname(outPath), { recursive: true })
    writeFileSync(outPath, html)
    console.log(`[prerender] ok  ${route} -> ${outPath} (${html.length} bytes)`)
  } catch (e) {
    console.error(`[prerender] FAIL ${route}: ${e.message}`)
    failed = true
  } finally {
    await page.close()
  }
}

await browser.close()
await server.httpServer.close()
if (failed) { process.exitCode = 1; console.error('[prerender] finished with errors') }
else console.log('[prerender] done')
