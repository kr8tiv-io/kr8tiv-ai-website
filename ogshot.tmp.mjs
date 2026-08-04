import { chromium } from "@playwright/test"
import path from "node:path"
const dir = process.argv[2]
const b = await chromium.launch({ headless: true })
const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
await p.goto("file:///" + path.join(dir, "og-card.html").replace(/\\/g, "/"))
await p.waitForTimeout(2500)
await p.screenshot({ path: path.join(dir, "og-card.png") })
await b.close()
console.log("ok")