# Field Notes: go-live checklist (kr8tiv.ai)

Branch: `content/blog-ai-enabler-2026-11-23` (based on `review/services-v2-2026-11-23` at b7744fe). Nothing here is live. Matt reviews first.

## Before merge
1. Matt approves the article text, title, meta description and hero image.
2. Merge `review/services-v2-2026-11-23` first (this branch sits on top of it), or merge this branch, which includes it. If a service slug changes, re-check the article's internal links (`ai-training`, `ai-consulting`, `company-brain`, `automations`, `tool-integration`, `custom-business-app`) and re-run the build script.
3. Set `publish_date` and `updated` in `content/blog/what-ai-can-and-cant-do-for-your-business.md` to the real go-live date, then run:
   - `python3 scripts/build-blog.py`
   - `npm run test:content`
   - `npm ci && npm run build` (then delete `node_modules` and `dist`)
4. Back up the live site (same method as `backups/hostinger-kr8tiv-ai-*`), keep the rollback note.

## Deploy
Merge to `master`; Hostinger auto-publishes. Rollback: `git revert -m 1 <merge sha>` and push.

## After it is live (do not run before)
1. Check these answer 200: `/blog/`, `/blog/what-ai-can-and-cant-do-for-your-business/`, `/blog/what-ai-can-and-cant-do-for-your-business.md` (content-type text/markdown), `/blog.md`, `/llms.txt`, `/llms-full.txt`, `/sitemap.xml`, `/c76645233ae73c7d1d025a8caa968209.txt`, the hero `.avif/.webp/.jpg` files and `/blog/images/ai-enabler-og.jpg`.
2. View source with JavaScript off: the full article text is in the HTML.
3. Google Rich Results Test on the article URL (Article, FAQPage, BreadcrumbList). Note: Google only shows FAQ rich results for some government and health sites, so the FAQ schema helps understanding, not snippets.
4. IndexNow (Bing, Yandex, Seznam, Naver): `scripts/indexnow-ping.sh` (it refuses to run until the key file is live).
5. Google Search Console (kr8tiv.ai property): Sitemaps, resubmit `https://kr8tiv.ai/sitemap.xml`; URL Inspection, request indexing for `/blog/` and the article URL.
6. Bing Webmaster Tools: submit the sitemap if the site is added there.
7. Share preview: paste the article URL into the LinkedIn Post Inspector to load the OG image.

## Still to add after the services branch lands
- A "Field Notes" link in the shared header and footer of the service pages (`scripts/build-service-pages.py` topbar and foot) and in the React nav (`src/components/NavigationBar.tsx`). Left out here so this branch does not collide with the services rewrite. The homepage pre-render list already links to the blog.
