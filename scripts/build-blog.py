#!/usr/bin/env python3
"""Writes the Field Notes blog under public/blog/ from content/blog/*.md.

Each article is a markdown file with YAML front matter (same fields as the
drafts in drafts/field-notes/). Only files with `draft: false` are published.
Output is plain static HTML (no JS, crawlable), plus the AI-readable layer:
  public/blog/index.html            blog index
  public/blog/<slug>/index.html     article (Article + FAQPage + BreadcrumbList)
  public/blog/<slug>.md             markdown mirror of the visible text
  public/blog.md                    markdown mirror of the index
  public/llms.txt                   Field Notes block between BLOG markers
  public/llms-full.txt              llms.txt plus every article's summary + FAQ
  public/sitemap.xml                blog URLs between BLOG markers
Run:  python3 scripts/build-blog.py   then   python3 scripts/check-content.py
Needs: python3 with markdown and PyYAML."""
import html, json, pathlib, re, sys

import markdown
import yaml

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / 'content' / 'blog'
PUB = ROOT / 'public'
OUT = PUB / 'blog'
SITE = 'https://kr8tiv.ai'
ORG_ID = f'{SITE}/#organization'
AUTHOR = {'@type': 'Person', '@id': 'https://kr8tiv.io/#matt', 'name': 'Matt Haynes',
          'url': 'https://www.linkedin.com/in/matthaynes88/', 'jobTitle': 'Founder, KR8TIV AI'}
PUBLISHER = {'@type': 'Organization', '@id': ORG_ID, 'name': 'KR8TIV AI', 'url': f'{SITE}/',
             'logo': {'@type': 'ImageObject', 'url': f'{SITE}/images/kr8tiv-logo.png'},
             'sameAs': ['https://www.linkedin.com/company/kr8tivai', 'https://github.com/kr8tiv-ai', 'https://www.facebook.com/people/Kr8tiv-AI/61588252989738/']}
BLOG_NAME = 'Field Notes'
BLOG_TITLE = 'Field Notes: AI for Edmonton Small Businesses | KR8TIV AI'
BLOG_DESC = ('Plain-language field notes on AI for small businesses in Edmonton and Alberta: '
             'what AI can do, what it cannot, and how to put it to work without replacing people.')
E = html.escape
MONTHS = 'January February March April May June July August September October November December'.split()


def nice_date(iso):
    y, m, d = (int(x) for x in iso.split('-'))
    return f'{MONTHS[m - 1]} {d}, {y}'


def load_posts():
    posts = []
    for f in sorted(SRC.glob('*.md')):
        raw = f.read_text(encoding='utf-8')
        m = re.match(r'^---\n(.*?)\n---\n(.*)$', raw, re.S)
        if not m:
            sys.exit(f'{f}: missing front matter')
        meta = yaml.safe_load(m.group(1))
        if meta.get('draft', True):
            continue
        meta['body'] = m.group(2).strip() + '\n'
        meta['url'] = f'{SITE}/blog/{meta["slug"]}/'
        posts.append(meta)
    posts.sort(key=lambda p: str(p['publish_date']), reverse=True)
    return posts


def absolutize(md_text):
    """Relative links (../../services/x/) become absolute for the .md mirror."""
    return re.sub(r'\]\((?:\.\./)+', f']({SITE}/', md_text)


def render_body(post):
    md = markdown.Markdown(extensions=['tables', 'toc', 'sane_lists'],
                           extension_configs={'toc': {'toc_depth': '2'}})
    body = md.convert(post['body'])
    toc = [(t['id'], t['name']) for t in md.toc_tokens]
    body = body.replace('<table>', '<div class="table-wrap"><table>').replace('</table>', '</table></div>')
    # External links open in a new tab.
    body = re.sub(r'<a href="(https?://[^"]+)">', r'<a href="\1" target="_blank" rel="noopener">', body)
    # FAQ goes under the "Frequently asked questions" heading.
    faq = ['<div class="faq">']
    for item in post.get('faqs', []):
        faq += ['  <details>', f'    <summary>{E(item["q"])}</summary>', f'    <p>{E(item["a"])}</p>', '  </details>']
    faq.append('</div>')
    body = re.sub(r'(<h2 id="frequently-asked-questions">.*?</h2>)', lambda m: m.group(1) + '\n' + '\n'.join(faq), body, count=1)
    # Sources list gets its own class.
    body = body.replace('<h2 id="sources">Sources</h2>\n<ol>', '<h2 id="sources">Sources</h2>\n<ol class="sources-list">')
    return body, toc


def head(title, description, canonical, depth, schema, og_type='website', og_image=None, og_alt=None, extra=''):
    up = '../' * depth
    img = og_image or f'{SITE}/og-card.png'
    alt = f'\n    <meta property="og:image:alt" content="{E(og_alt)}" />' if og_alt else ''
    return f'''<!DOCTYPE html>
<html lang="en-CA">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <link rel="icon" type="image/png" href="{up}favicon.png" />

    <title>{E(title)}</title>
    <meta name="description" content="{E(description)}" />
    <link rel="canonical" href="{canonical}" />
    <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1" />
    <meta name="theme-color" content="#050510" />
    <meta name="author" content="Matt Haynes" />

    <meta property="og:type" content="{og_type}" />
    <meta property="og:title" content="{E(title)}" />
    <meta property="og:description" content="{E(description)}" />
    <meta property="og:url" content="{canonical}" />
    <meta property="og:image" content="{img}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />{alt}
    <meta property="og:site_name" content="KR8TIV AI" />
    <meta property="og:locale" content="en_CA" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="{E(title)}" />
    <meta name="twitter:description" content="{E(description)}" />
    <meta name="twitter:image" content="{img}" />
{extra}
    <script type="application/ld+json">
{json.dumps(schema, indent=2, ensure_ascii=False)}
    </script>

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700&family=Inter:wght@300;400;500&family=JetBrains+Mono:wght@400;500&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="{up}styles/page.css" />
    <link rel="stylesheet" href="{up}styles/blog.css" />
  </head>
  <body>
    <a class="skip" href="#main">Skip to content</a>
'''


def topbar(depth):
    up = '../' * depth
    return f'''
    <header class="topbar">
      <div class="wrap">
        <a class="brand" href="{up}">kr8tiv AI <span>Back offices, automated</span></a>
        <nav class="topnav" aria-label="Primary">
          <a href="{up}">Home</a>
          <a href="{up}services/">Services</a>
          <a href="{up}work/evolve/">Case study</a>
          <a aria-current="page" href="{up}blog/">Field Notes</a>
          <a class="btn btn--sm" href="{up}start/">Book audit</a>
        </nav>
      </div>
    </header>
'''


def foot(depth):
    up = '../' * depth
    return f'''
    <section class="cta">
      <div class="wrap">
        <h2>Give your people their evenings back.</h2>
        <p>
          KR8TIV AI is an AI consulting and training company in Edmonton. We start by mapping where
          the hours actually go, then build the automations and <a href="{up}services/ai-training/">train your team</a> to run
          them. Your people stay. The paperwork leaves.
        </p>
        <div class="hero-actions">
          <a class="btn" href="{up}start/">Book an AI Ops Audit &rarr;</a>
          <a class="btn btn--ghost" href="{up}services/ai-consulting/">AI consulting in Edmonton</a>
        </div>
      </div>
    </section>

    <footer>
      <div class="wrap">
        <nav class="footlinks" aria-label="Footer">
          <a href="{up}">Home</a>
          <a href="{up}services/">Services</a>
          <a href="{up}work/evolve/">Case study</a>
          <a href="{up}blog/">Field Notes</a>
          <a href="mailto:hello@kr8tiv.ai">hello@kr8tiv.ai</a>
          <a href="https://www.linkedin.com/company/kr8tivai" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href="https://github.com/kr8tiv-ai" target="_blank" rel="me noopener">GitHub</a>
          <a href="https://www.facebook.com/people/Kr8tiv-AI/61588252989738/" target="_blank" rel="me noopener">Facebook</a>
          <a href="https://kr8tiv.io" target="_blank" rel="noopener noreferrer">kr8tiv.io design studio</a>
        </nav>
        <p class="legal">
          &copy; 2026 kr8tiv AI · Edmonton, Alberta &rarr; everywhere<br />
          <a href="tel:+17809155471">780-915-5471</a> &middot;
          <a href="mailto:hello@kr8tiv.ai">hello@kr8tiv.ai</a>
        </p>
      </div>
    </footer>
  </body>
</html>
'''


def crumbs(items):
    return {'@type': 'BreadcrumbList', 'itemListElement': [
        {'@type': 'ListItem', 'position': i, 'name': n, 'item': u} for i, (n, u) in enumerate(items, 1)]}


def picture(base, alt, depth, eager):
    """base is a site path without size/extension, e.g. /blog/images/ai-enabler-hero."""
    up = '../' * depth
    rel = up + base.lstrip('/')
    load = 'fetchpriority="high" loading="eager"' if eager else 'loading="lazy"'
    srcset = lambda ext: f'{rel}-768.{ext} 768w, {rel}-1280.{ext} 1280w'
    return f'''<picture>
            <source type="image/avif" srcset="{srcset('avif')}" sizes="(min-width: 1100px) 1088px, 100vw" />
            <source type="image/webp" srcset="{srcset('webp')}" sizes="(min-width: 1100px) 1088px, 100vw" />
            <img src="{rel}-1280.jpg" srcset="{srcset('jpg')}" sizes="(min-width: 1100px) 1088px, 100vw" width="1280" height="720" alt="{E(alt)}" {load} decoding="async" />
          </picture>'''


def hero_video(post, depth):
    """Optional looping hero. The <picture> stays the real image (LCP, SEO, no-JS, reduced motion);
    the video only loads and plays when motion is allowed, then fades in over the picture."""
    base = post.get('hero_video')
    if not base:
        return ''
    rel = '../' * depth + base.lstrip('/')
    return f'''
            <video class="hero-video" muted loop playsinline preload="none" aria-hidden="true" tabindex="-1" width="1280" height="720" data-webm="{rel}.webm" data-mp4="{rel}.mp4"></video>
            <script>
              (function () {{
                var v = document.currentScript.previousElementSibling, f = v.parentNode;
                var still = window.matchMedia('(prefers-reduced-motion: reduce)');
                var c = navigator.connection;
                if (still.matches || (c && c.saveData) || !v.canPlayType) return;
                var src = v.canPlayType('video/webm; codecs="vp9"') ? v.dataset.webm : v.dataset.mp4;
                v.addEventListener('playing', function () {{ f.classList.add('is-playing'); }}, {{ once: true }});
                var go = function () {{ if (!v.src) v.src = src; var p = v.play(); if (p && p.catch) p.catch(function () {{}}); }};
                if ('IntersectionObserver' in window) {{
                  new IntersectionObserver(function (es) {{
                    es.forEach(function (e) {{ if (e.isIntersecting) go(); else if (v.src) v.pause(); }});
                  }}).observe(f);
                }} else {{ go(); }}
                still.addEventListener && still.addEventListener('change', function (e) {{
                  if (e.matches) {{ v.pause(); f.classList.remove('is-playing'); }}
                }});
              }})();
            </script>'''


def article_page(post):
    url = post['url']
    body, toc = render_body(post)
    hero_jpg = f'{SITE}{post["hero_image"]}-1280.jpg'
    og = f'{SITE}{post["og_image"]}'
    words = len(re.sub(r'<[^>]+>', ' ', body).split())
    schema = {'@context': 'https://schema.org', '@graph': [
        {'@type': 'Article', '@id': f'{url}#article', 'headline': post['title'],
         'description': post['meta_description'], 'url': url,
         'mainEntityOfPage': {'@type': 'WebPage', '@id': url},
         'image': [hero_jpg, og], 'datePublished': str(post['publish_date']),
         'dateModified': str(post['updated']), 'author': AUTHOR, 'publisher': PUBLISHER,
         'inLanguage': 'en-CA', 'wordCount': words, 'articleSection': BLOG_NAME,
         'keywords': ', '.join(post.get('keywords') or post.get('tags', [])),
         'about': [{'@type': 'Thing', 'name': 'Artificial intelligence in small business'}],
         'spatialCoverage': {'@type': 'City', 'name': 'Edmonton', 'containedInPlace': {'@type': 'State', 'name': 'Alberta'}},
         'isPartOf': {'@type': 'Blog', '@id': f'{SITE}/blog/#blog', 'name': BLOG_NAME}},
        {'@type': 'FAQPage', '@id': f'{url}#faq', 'mainEntity': [
            {'@type': 'Question', 'name': i['q'], 'acceptedAnswer': {'@type': 'Answer', 'text': i['a']}}
            for i in post.get('faqs', [])]},
        crumbs([('Home', f'{SITE}/'), (BLOG_NAME, f'{SITE}/blog/'), (post['title'], url)])]}
    extra = (f'    <meta property="article:published_time" content="{post["publish_date"]}" />\n'
             f'    <meta property="article:modified_time" content="{post["updated"]}" />\n'
             f'    <meta property="article:author" content="Matt Haynes" />\n'
             f'    <link rel="alternate" type="text/markdown" title="Plain-text version of this page" href="../{post["slug"]}.md" />\n'
             f'    <link rel="preload" as="image" type="image/avif" imagesrcset="../images/{pathlib.Path(post["hero_image"]).name}-768.avif 768w, ../images/{pathlib.Path(post["hero_image"]).name}-1280.avif 1280w" imagesizes="(min-width: 1100px) 1088px, 100vw" />\n')
    summary = '\n'.join(f'            <li>{E(s)}</li>' for s in post['summary'])
    toc_html = '\n'.join(f'              <li><a href="#{i}">{E(n)}</a></li>' for i, n in toc)
    page = [head(post['seo_title'], post['meta_description'], url, 2, schema, 'article', og, post['hero_alt'], extra),
            '    <div class="progress" aria-hidden="true"></div>', topbar(2), f'''    <main id="main">
      <article>
        <header class="post-hero">
          <div class="wrap">
            <nav aria-label="Breadcrumb" class="eyebrow"><a href="../../">Home</a> / <a href="../">{BLOG_NAME}</a> / Edmonton, Alberta</nav>
            <h1>{E(post["title"])}</h1>
            <p class="lede">{E(post["excerpt"])}</p>
            <p class="byline">By <a href="https://www.linkedin.com/in/matthaynes88/" target="_blank" rel="noopener">Matt Haynes</a>, founder of KR8TIV AI · <time datetime="{post["publish_date"]}">{nice_date(str(post["publish_date"]))}</time> · {post.get("read_minutes", max(1, round(words / 230)))} min read</p>
            <figure class="hero-figure">
          {picture(post["hero_image"], post["hero_alt"], 2, True)}{hero_video(post, 2)}
            </figure>
            <section class="answer" aria-labelledby="short-answer">
              <h2 id="short-answer">The short answer</h2>
              <ul>
{summary}
              </ul>
            </section>
          </div>
        </header>
        <div class="wrap post-layout">
          <div class="prose">
{body}
          </div>
          <aside class="toc" aria-label="On this page">
            <p>On this page</p>
            <ol>
{toc_html}
            </ol>
          </aside>
        </div>
      </article>
    </main>''', foot(2)]
    return '\n'.join(page)


def index_page(posts):
    url = f'{SITE}/blog/'
    schema = {'@context': 'https://schema.org', '@graph': [
        {'@type': 'Blog', '@id': f'{url}#blog', 'name': BLOG_NAME, 'url': url, 'description': BLOG_DESC,
         'inLanguage': 'en-CA', 'publisher': PUBLISHER,
         'blogPost': [{'@type': 'BlogPosting', 'headline': p['title'], 'url': p['url'],
                       'datePublished': str(p['publish_date']), 'author': {'@id': AUTHOR['@id']}} for p in posts]},
        crumbs([('Home', f'{SITE}/'), (BLOG_NAME, url)])]}
    cards = []
    for p in posts:
        cards.append(f'''            <li class="card post-card">
              <a href="{p["slug"]}/" tabindex="-1" aria-hidden="true">{picture(p["hero_image"], "", 1, False)}</a>
              <p class="meta"><time datetime="{p["publish_date"]}">{nice_date(str(p["publish_date"]))}</time> · {p.get("read_minutes", "")} min read</p>
              <h3><a href="{p["slug"]}/">{E(p["title"])}</a></h3>
              <p>{E(p["excerpt"])}</p>
            </li>''')
    extra = '    <link rel="alternate" type="text/markdown" title="Plain-text version of this page" href="../blog.md" />\n'
    body = f'''    <main id="main">
      <section class="hero">
        <div class="wrap">
          <p class="eyebrow">{BLOG_NAME} · Edmonton, Alberta</p>
          <h1>Field Notes on AI for businesses that do real work.</h1>
          <p class="lede">What AI can do for a small business, what it can't, and how to put it to work without replacing the people who make the business good. Written in Edmonton, with sources, by Matt Haynes, who builds this stuff for real crews.</p>
        </div>
      </section>
      <section class="band">
        <div class="wrap">
          <h2>Latest</h2>
          <ul class="cards post-cards">
{chr(10).join(cards)}
          </ul>
        </div>
      </section>
    </main>'''
    return head(BLOG_TITLE, BLOG_DESC, url, 1, schema, extra=extra) + topbar(1) + body + foot(1)


def mirror(post):
    lines = [f'# {post["title"]}', '',
             f'This is a plain-text version of {post["url"]}. The HTML page is the source of truth.', '',
             f'- Author: Matt Haynes, founder of KR8TIV AI (Edmonton, Alberta)',
             f'- Published: {nice_date(str(post["publish_date"]))}. Updated: {nice_date(str(post["updated"]))}.',
             f'- Blog: {SITE}/blog/', '', post['excerpt'], '', '## The short answer', '']
    lines += [f'- {s}' for s in post['summary']]
    body = absolutize(post['body'])
    faq = '\n'.join(f'### {i["q"]}\n\n{i["a"]}\n' for i in post.get('faqs', []))
    body = body.replace('## Frequently asked questions\n', '## Frequently asked questions\n\n' + faq, 1)
    return '\n'.join(lines) + '\n\n' + body


def index_mirror(posts):
    out = [f'# {BLOG_NAME} | KR8TIV AI', '',
           f'This is a plain-text version of {SITE}/blog/. The HTML page is the source of truth. Each article also has a plain-text version at the same address ending in .md.', '',
           BLOG_DESC, '', '## Articles', '']
    for p in posts:
        out.append(f'- [{p["title"]}]({p["url"]}) ({nice_date(str(p["publish_date"]))}). {p["excerpt"]} Plain text: {SITE}/blog/{p["slug"]}.md')
    out += ['', '## Contact', '', '- Website: https://kr8tiv.ai/', '- Phone: (780) 915-5471', '- Email: hello@kr8tiv.ai', '- Intake: https://kr8tiv.ai/start/', '']
    return '\n'.join(out)


def replace_block(path, start, end, block, anchor_before=None):
    text = path.read_text(encoding='utf-8')
    pat = re.compile(re.escape(start) + r'.*?' + re.escape(end), re.S)
    new = f'{start}\n{block}\n{end}'
    if pat.search(text):
        text = pat.sub(lambda m: new, text)
    elif anchor_before and anchor_before in text:
        text = text.replace(anchor_before, new + '\n\n' + anchor_before, 1)
    else:
        text = text.rstrip('\n') + '\n\n' + new + '\n'
    path.write_text(text, encoding='utf-8')


def llms_block(posts):
    out = ['## Field Notes (blog)', '', f'- Index: {SITE}/blog/ (plain text: {SITE}/blog.md)']
    for p in posts:
        out.append(f'- [{p["title"]}]({p["url"]}): {p["meta_description"]} Plain text: {SITE}/blog/{p["slug"]}.md')
    return '\n'.join(out)


def llms_full(posts):
    base = (PUB / 'llms.txt').read_text(encoding='utf-8')
    base = re.sub(r'^# kr8tiv AI', '# kr8tiv AI (full)', base, count=1, flags=re.M)
    out = [base.rstrip('\n'), '', '## Field Notes in detail', '',
           'Summaries and answers from each published article. The article pages are the source of truth.']
    for p in posts:
        out += ['', f'### {p["title"]}', '', f'URL: {p["url"]}', f'Plain text: {SITE}/blog/{p["slug"]}.md',
                f'Author: Matt Haynes. Published {nice_date(str(p["publish_date"]))}.', '', 'Short answer:']
        out += [f'- {s}' for s in p['summary']]
        out += ['', 'Questions answered:']
        out += [f'- {i["q"]} {i["a"]}' for i in p.get('faqs', [])]
    return '\n'.join(out) + '\n'


def sitemap_block(posts):
    def u(loc, mod, freq, pri):
        return (f'  <url>\n    <loc>{loc}</loc>\n    <lastmod>{mod}</lastmod>\n'
                f'    <changefreq>{freq}</changefreq>\n    <priority>{pri}</priority>\n  </url>')
    newest = max(str(p['updated']) for p in posts)
    return '\n'.join([u(f'{SITE}/blog/', newest, 'weekly', '0.7')] +
                     [u(p['url'], str(p['updated']), 'monthly', '0.7') for p in posts])


def main():
    posts = load_posts()
    if not posts:
        sys.exit('no published posts in content/blog/')
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / 'index.html').write_text(index_page(posts), encoding='utf-8')
    for p in posts:
        d = OUT / p['slug']
        d.mkdir(parents=True, exist_ok=True)
        (d / 'index.html').write_text(article_page(p), encoding='utf-8')
        (OUT / f'{p["slug"]}.md').write_text(mirror(p), encoding='utf-8')
    (PUB / 'blog.md').write_text(index_mirror(posts), encoding='utf-8')
    replace_block(PUB / 'llms.txt', '<!-- BLOG:START (generated by scripts/build-blog.py) -->', '<!-- BLOG:END -->',
                  llms_block(posts), anchor_before='## Links')
    (PUB / 'llms-full.txt').write_text(llms_full(posts), encoding='utf-8')
    replace_block(PUB / 'sitemap.xml', '  <!-- BLOG:START (generated by scripts/build-blog.py) -->', '  <!-- BLOG:END -->',
                  sitemap_block(posts), anchor_before='</urlset>')
    print(f'wrote blog index + {len(posts)} article(s) under public/blog/')


if __name__ == '__main__':
    main()
