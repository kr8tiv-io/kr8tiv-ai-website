#!/usr/bin/env python3
"""Writes the static service pages under public/services/.

One source for the head, nav, footer, Service + FAQPage + BreadcrumbList
schema, so every service page stays consistent. Prices come only from the
KR8TIV price snapshot in the company brain. Run:
  python3 scripts/build-service-pages.py
Then run the content check: python3 scripts/check-content.py"""
import html, json, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'public' / 'services'
SITE = 'https://kr8tiv.ai'
ORG = {'@id': f'{SITE}/#organization'}
AREA = [
    {'@type': 'City', 'name': 'Edmonton'},
    {'@type': 'State', 'name': 'Alberta'},
    {'@type': 'Country', 'name': 'Canada'},
]
E = html.escape

SERVICES = [
    {
        'slug': 'ai-training',
        'nav': 'AI training',
        'name': 'AI Training & Courses',
        'service_type': 'AI training and courses for organizations',
        'title': 'AI Training & Courses in Edmonton and Across Canada | kr8tiv AI',
        'description': 'We teach your organization about AI. Hands-on AI training and structured courses for small business teams in Edmonton, across Alberta and Canada.',
        'eyebrow': 'AI training · Edmonton, Alberta and across Canada',
        'h1': 'We teach your organization about AI.',
        'lede': 'Hands-on training and structured courses for teams that want to use AI properly: what it is good at, where it makes things up, and how to put it to work on the jobs your people already do. Delivered in Edmonton, across Alberta and online across Canada.',
        'offers': [('AI + marketing systems training', '295', 'One session for you and your team, built around your business.')],
        'price_note': 'Structured multi-session courses are quoted to your group size and schedule after a short call.',
        'sections': [
            ('What your team learns', 'cards', [
                ('What AI is actually good at', 'Drafting, summarizing, sorting and checking. Where it saves hours, and where it costs you if nobody reads the output.'),
                ('Why it makes things up', 'AI guesses when it has no facts to work from. We show your team how to give it the facts, so the answers sound like your business.'),
                ('Your data, handled properly', 'What should and should not go into an AI tool, and how privacy rules like Alberta PIPA apply to customer information.'),
                ('The tools you already pay for', 'We train on the AI tools your team already has, not a new subscription we happen to sell.'),
                ('One task, automated', 'Every course ends with a real, repeated task from your own week turned into a working workflow.'),
            ]),
            ('How it is delivered', 'ticks', [
                ('In person in Edmonton and Alberta', 'at your office, shop or boardroom.'),
                ('Live online across Canada', 'same course, same hands-on work, for teams anywhere in the country.'),
                ('Structured courses', 'a set number of sessions with a plan, homework that is real work, and a written summary your team keeps.'),
                ('Built for non-technical people', 'owners, office staff, crews and managers. No coding.'),
            ]),
        ],
        'faqs': [
            ('Do you only train in Edmonton?', 'No. We are based in Edmonton and train in person across Alberta. Structured courses also run live online for teams anywhere in Canada.'),
            ('Does my team need to be technical?', 'No. The training is built for owners, office staff and field teams. If someone can send an email, they can follow along.'),
            ('Which AI tools do you teach?', 'The ones your organization already uses or plans to use. We build the sessions around your tools and your work, not a generic slide deck.'),
            ('Can the training use our own company information?', 'Yes. Pairing training with a Company Brain means your team practices on your real processes, prices and documents, so what they learn carries straight into the job.'),
            ('What does it cost?', 'A single AI + marketing systems training session is $295. Structured courses are quoted to your group size and number of sessions.'),
        ],
        'related': ['company-brain', 'automations'],
    },
    {
        'slug': 'company-brain',
        'nav': 'Company Brain',
        'name': 'Company Brain',
        'service_type': 'Company knowledge base and AI-ready source of truth',
        'title': 'Company Brain for Edmonton Small Businesses | kr8tiv AI',
        'description': 'Stop running the company from memory. A Company Brain puts sales, ops, money, crew and marketing in one place your team and AI both use. $1,000.',
        'eyebrow': 'Company Brain · Edmonton, Alberta',
        'h1': 'Stop running the company from memory.',
        'lede': 'Most companies run on memory. The pricing lives in one person\'s head, the process lives in another\'s, and the brand voice changes depending on who\'s typing. A company brain is one organized home for all of it: your processes, prices, voice and templates.',
        'offers': [('Company Brain', '1000', 'Sales, ops, finance, field and marketing in one brain your team and AI both use.')],
        'price_note': 'One-time build. You own it.',
        'kicker_line': 'One brain. Every department. Zero "ask the boss."',
        'sections': [
            ('Put a brain on the throne.', 'para', [
                'A Company Brain plugs sales, operations, money, your crew in the field, marketing and every document into one brain. Everybody, and every AI tool, works from the same facts, so nobody texts you at 9 PM asking where the quote template went.',
                'Once it exists, AI has a real baseline to work from, so it stops guessing and starts sounding like you. It works for one person, or a thousand. Same source of truth either way.',
            ]),
            ('What goes in', 'cards', [
                ('Sales', 'Leads, quotes, pricing rules, why you win and why you lose.'),
                ('Operations', 'How every job actually gets done, step by step.'),
                ('Money', 'Price lists, margins, invoices, suppliers and who owes what.'),
                ('Crew + field', 'Safety forms, checklists, equipment and the truck know-how.'),
                ('Marketing', 'Brand voice, photos, reviews and the questions customers ask every week.'),
                ('Docs', 'Warranties, policies, contracts and onboarding.'),
            ]),
            ('Why it matters', 'ticks', [
                ('One source of truth', 'every process, price and document in one place.'),
                ('AI that answers from your facts', 'assistants stop making things up because they finally have something real to read.'),
                ('Gated, not open to everyone', 'the right people can change the right things. A system has gates. A group chat does not.'),
                ('Onboarding gets easier', 'new staff learn from the brain, not from whoever has time that week.'),
            ]),
        ],
        'faqs': [
            ('What is a company brain?', 'One organized home for how your business works: processes, prices, brand voice, templates and documents, structured so both your team and your AI tools can use it.'),
            ('How is it different from a shared drive?', 'A drive stores files. A company brain organizes the knowledge in them by department and decision, keeps it current, and controls who can change what.'),
            ('Will it work with the AI tools we already use?', 'Yes. The point is to give the AI you already use a real baseline to work from, so it answers from your facts instead of guessing.'),
            ('Is it only for big companies?', 'No. It works for one person or a thousand. Small teams feel it first, because so much lives in one or two heads.'),
            ('What does a Company Brain cost?', '$1,000, one time. You own it.'),
        ],
        'related': ['ai-training', 'tool-integration'],
    },
    {
        'slug': 'automations',
        'nav': 'Automations',
        'name': 'AI Automations',
        'service_type': 'AI business process automation',
        'title': 'AI Automation for Small Businesses in Edmonton | kr8tiv AI',
        'description': 'AI automations for Edmonton small businesses: receipts filed from a photo, same-day quotes with margin checks, dispatch, a 6:30 AM digest. From $250.',
        'eyebrow': 'AI automations · Edmonton, Alberta',
        'h1': 'The busywork, done before you ask.',
        'lede': 'We build AI automations that take the repeated admin off your plate: the receipts, the quotes, the follow-ups and the morning check of what is on fire. They run on the tools you already use and they keep running when nobody remembers to ask.',
        'offers': [('Single automation', '250', 'One workflow, built and running on your tools.', True)],
        'price_note': 'Larger builds are scoped in the AI Ops Audit ($495) and quoted as a fixed price.',
        'sections': [
            ('Automations we build', 'cards', [
                ('Receipt pipeline', 'A photo of a receipt becomes a filed, categorized expense row. No typing, no shoebox.'),
                ('Quoting with a margin check', 'Measurements go in, a branded quote comes out, checked against your real costs before it is sent.'),
                ('Dispatch tracking', 'Every job moves from lead to booked to done to invoiced, with the paperwork attached at each step.'),
                ('6:30 AM digest', 'Today\'s jobs, overdue follow-ups, expiring quotes and quiet leads, delivered before the day starts.'),
                ('Watchdogs', 'Standing rules that flag the expensive mistakes: a deposit with no booking, an invoice unpaid past seven days, a finished job never invoiced.'),
            ]),
            ('How we work', 'ticks', [
                ('Start with the audit', 'one week inside your operation, mapping where the hours actually go.'),
                ('Fixed scope, fixed price', 'you know the number before we build.'),
                ('Your tools, your data', 'no migration. The data stays in your own accounts.'),
                ('You keep the source', 'the code for everything we build for you is handed over.'),
            ]),
        ],
        'proof': True,
        'faqs': [
            ('What kind of tasks can be automated?', 'Anything repeated and rule-based: filing receipts, building quotes, chasing invoices, sending reminders, moving data between tools and writing the daily summary.'),
            ('Do we have to switch software?', 'No. We wire automations into the spreadsheets, drive, email and calendar you already use.'),
            ('What does an automation cost?', 'A single automation starts at $250. Bigger builds are scoped in the AI Ops Audit ($495) and quoted as a fixed price.'),
            ('Does anything happen without a person signing off?', 'Anything that moves money waits for a person. The automations prepare the work; you approve what matters.'),
            ('Do you work outside Edmonton?', 'Yes. We are based in Edmonton and work with businesses across Alberta and Canada remotely.'),
        ],
        'related': ['tool-integration', 'evolve'],
    },
    {
        'slug': 'tool-integration',
        'nav': 'Tool integration',
        'name': 'Tool Integration',
        'service_type': 'Business software integration',
        'title': 'Business Tool Integration in Edmonton | kr8tiv AI',
        'description': 'We connect the spreadsheets, drive, email, calendar and apps your Edmonton business already uses, so every tool pulls in the same direction.',
        'eyebrow': 'Tool integration · Edmonton, Alberta',
        'h1': 'All your tools, pulling in the same direction.',
        'lede': 'Most businesses do not need another app. They need the ones they already pay for to talk to each other. We connect your spreadsheets, drive, email, calendar and business apps so the same job, customer and number shows up everywhere it should, typed once.',
        'offers': [],
        'price_note': 'Every integration is scoped in the AI Ops Audit ($495) and built as a fixed price.',
        'sections': [
            ('What we connect', 'cards', [
                ('Spreadsheets and drive', 'One workbook becomes the source of truth, with folders that mirror it.'),
                ('Email and calendar', 'Bookings, confirmations and reminders flow from the job record, not from memory.'),
                ('Quoting and invoicing', 'A quote becomes a job, the job becomes an invoice, without retyping.'),
                ('Field and office', 'What the crew captures on a phone lands in the office tools the same day.'),
                ('AI on top', 'With the data in one place, AI assistants and automations can finally read it.'),
            ]),
            ('The rules we build by', 'ticks', [
                ('No rip and replace', 'we work underneath what you have.'),
                ('One source of truth', 'every number has one home, and everything else reads from it.'),
                ('You own it', 'your accounts, your data, and the source code we wrote.'),
                ('Month to month care', 'when a tool changes, we keep the connections working. No lock-in.'),
            ]),
        ],
        'faqs': [
            ('Which tools can you connect?', 'Most of the everyday ones: spreadsheets, cloud drives, email, calendars, forms and business apps with an API. We confirm the exact list in the audit.'),
            ('Will we lose our data or history?', 'No. Nothing is migrated away. We connect what you have and leave your data in your own accounts.'),
            ('Why not just buy an all-in-one app?', 'Because switching costs a season of disruption, and your team already knows the tools they use. Connecting them is usually faster and cheaper.'),
            ('What does it cost?', 'It depends on how many tools and how much moves between them. Every integration is scoped in the AI Ops Audit ($495) and then built as a fixed price.'),
            ('Do you only work with Edmonton businesses?', 'We are based in Edmonton and work across Alberta and Canada remotely.'),
        ],
        'related': ['automations', 'company-brain'],
    },
    {
        'slug': 'evolve',
        'nav': 'Evolve',
        'name': 'Evolve',
        'service_type': 'Business management system for service companies',
        'title': 'Evolve Business Management System, Built in Edmonton | kr8tiv AI',
        'description': 'Evolve is the business system kr8tiv AI built in Edmonton: quotes, jobs, safety, receipts and invoices on one workbook. A person approves every money step.',
        'eyebrow': 'Evolve · built in Edmonton, Alberta',
        'h1': 'Evolve. Business management in a box.',
        'lede': 'Evolve is the system we built for Evolve Eco Blasting, an Edmonton crew with no office staff, and then made ready for any service business. Quotes, jobs, safety forms, receipts and invoices live in one place, and an AI does the paperwork between the jobs.',
        'offers': [('Custom Business App, modelled on Evolve', '3000', 'Evolve set up for your trade, your rates and your team.')],
        'price_note': 'Pair it with a Company Brain as Brain + Business App for $3,750.',
        'sections': [
            ('Four parts, one sheet', 'cards', [
                ('Field app', 'The crew uses it on their phones: photos, notes, safety forms and check-ins from the job site.'),
                ('Workbook', 'One Google Sheet holds the jobs, quotes, customers and money. Everything else reads from it.'),
                ('AI brain', 'Prices quotes, files receipts, runs dispatch and writes the morning report.'),
                ('Owner dashboard', 'The numbers, the jobs and what needs attention, on one screen.'),
            ]),
            ('Built for any service business', 'ticks', [
                ('Your trade, your rates', 'Evolve installs a rate card and the trade\'s safety hazards for your kind of work.'),
                ('Two human gates, both about money', 'a person approves the quote and a person marks the invoice paid. Everything between runs itself.'),
                ('Safety built in', 'hazard assessments drafted from the job scope and signed off by the crew on site.'),
                ('Proven on a real company', 'it runs Evolve Eco Blasting\'s day, not a demo.'),
            ]),
        ],
        'proof': True,
        'links': [('See Evolve running live', 'https://www.evolvedmcp.cloud/'), ('Read the Evolve Eco Blasting case study', '../../work/evolve/')],
        'faqs': [
            ('What is Evolve?', 'Evolve is a business management system for service companies: quoting, dispatch, safety, receipts and invoicing on one workbook, with an AI doing the admin and a person approving every money step.'),
            ('Is it only for blasting companies?', 'No. It was built for Evolve Eco Blasting, but nothing in it is about blasting. Trade packs set it up for other service businesses in one step.'),
            ('Does it handle payments?', 'No. Evolve never moves money. When a customer pays by e-transfer, cheque, card or cash, a person marks the invoice paid.'),
            ('Do we have to change our tools?', 'No. Evolve runs on a Google Sheet and the drive you already have, plus a phone app for the crew.'),
            ('What does it cost to set up for my business?', 'A custom business app modelled on Evolve is $3,000, one time. With a Company Brain it is $3,750 as Brain + Business App.'),
        ],
        'related': ['automations', 'company-brain'],
    },
]
BY_SLUG = {s['slug']: s for s in SERVICES}


def head(title, description, canonical, depth, schema):
    up = '../' * depth
    return f'''<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <link rel="icon" type="image/png" href="{up}favicon.png" />

    <title>{E(title)}</title>
    <meta name="description" content="{E(description)}" />
    <link rel="canonical" href="{canonical}" />
    <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1" />
    <meta name="theme-color" content="#050510" />

    <meta property="og:type" content="website" />
    <meta property="og:title" content="{E(title)}" />
    <meta property="og:description" content="{E(description)}" />
    <meta property="og:url" content="{canonical}" />
    <meta property="og:image" content="{SITE}/og-card.png" />
    <meta property="og:site_name" content="kr8tiv AI" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="{E(title)}" />
    <meta name="twitter:description" content="{E(description)}" />
    <meta name="twitter:image" content="{SITE}/og-card.png" />

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
  </head>
  <body>
    <a class="skip" href="#main">Skip to content</a>
'''


def topbar(depth, current):
    up = '../' * depth
    svc = 'aria-current="page" ' if current == 'services' else ''
    return f'''
    <header class="topbar">
      <div class="wrap">
        <a class="brand" href="{up}">kr8tiv AI <span>Back offices, automated</span></a>
        <nav class="topnav" aria-label="Primary">
          <a href="{up}">Home</a>
          <a {svc}href="{up}services/">Services</a>
          <a href="{up}work/evolve/">Case study</a>
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
        <h2>Get your evenings back. Start with an audit.</h2>
        <p>
          One week inside your operation, mapping where the hours actually go. You get a written
          plan of what AI would take off your plate and what it costs to build, and you keep the
          plan either way. The AI Ops Audit is $495.
        </p>
        <div class="hero-actions">
          <a class="btn" href="{up}start/">Book an AI Ops Audit &rarr;</a>
          <a class="btn btn--ghost" href="tel:+17809155471">780-915-5471</a>
        </div>
      </div>
    </section>

    <footer>
      <div class="wrap">
        <nav class="footlinks" aria-label="Footer">
          <a href="{up}">Home</a>
          <a href="{up}services/">Services</a>
          <a href="{up}work/evolve/">Case study</a>
          <a href="mailto:hello@kr8tiv.ai">hello@kr8tiv.ai</a>
          <a href="https://www.linkedin.com/company/kr8tivai" target="_blank" rel="noopener noreferrer">LinkedIn</a>
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


def money(amount):
    return f'${int(amount):,}'


def price_block(s):
    rows = []
    for o in s['offers']:
        name, amount, what = o[0], o[1], o[2]
        frm = 'From ' if len(o) > 3 and o[3] else ''
        rows.append(f'''            <div class="price">
              <p class="price-name">{E(name)}</p>
              <p class="price-amount">{frm}{money(amount)} <small>CAD</small></p>
              <p>{E(what)}</p>
            </div>''')
    note = f'\n            <p class="price-note">{E(s["price_note"])}</p>' if s.get('price_note') else ''
    return '\n'.join(rows) + note


def section(title, kind, items):
    out = ['      <section class="band">', '        <div class="wrap">', f'          <h2>{E(title)}</h2>']
    if kind == 'para':
        out += [f'          <p>{E(p)}</p>' for p in items]
    elif kind == 'cards':
        out.append('          <ul class="cards">')
        for i, (h, p) in enumerate(items, 1):
            out += ['            <li class="card">', f'              <p class="step">{i:02d}</p>',
                    f'              <h3>{E(h)}</h3>', f'              <p>{E(p)}</p>', '            </li>']
        out.append('          </ul>')
    elif kind == 'ticks':
        out.append('          <ul class="ticks">')
        out += [f'            <li><strong>{E(h)}</strong>: {E(p)}</li>' for h, p in items]
        out.append('          </ul>')
    out += ['        </div>', '      </section>', '']
    return '\n'.join(out)


def faq_html(faqs):
    out = ['      <section class="band" id="faq">', '        <div class="wrap">',
           '          <p class="kicker">Questions</p>', '          <h2>Frequently asked</h2>', '          <div class="faq">']
    for q, a in faqs:
        out += ['            <details>', f'              <summary>{E(q)}</summary>', f'              <p>{E(a)}</p>', '            </details>']
    out += ['          </div>', '        </div>', '      </section>', '']
    return '\n'.join(out)


def service_schema(s, url):
    svc = {
        '@type': 'Service',
        '@id': f'{url}#service',
        'name': s['name'],
        'serviceType': s['service_type'],
        'description': s['description'],
        'url': url,
        'provider': ORG,
        'areaServed': AREA,
    }
    offers = []
    for o in s['offers']:
        spec = {'@type': 'PriceSpecification', 'priceCurrency': 'CAD'}
        if len(o) > 3 and o[3]:
            spec['minPrice'] = o[1]
        else:
            spec['price'] = o[1]
        offers.append({'@type': 'Offer', 'name': o[0], 'description': o[2], 'priceSpecification': spec,
                       'priceCurrency': 'CAD', **({} if len(o) > 3 and o[3] else {'price': o[1]})})
    if offers:
        svc['offers'] = offers
    return svc


def faq_schema(faqs, url):
    return {'@type': 'FAQPage', '@id': f'{url}#faq', 'mainEntity': [
        {'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': a}} for q, a in faqs]}


def crumbs(items):
    return {'@type': 'BreadcrumbList', 'itemListElement': [
        {'@type': 'ListItem', 'position': i, 'name': n, 'item': u} for i, (n, u) in enumerate(items, 1)]}


def service_page(s):
    url = f'{SITE}/services/{s["slug"]}/'
    schema = {'@context': 'https://schema.org', '@graph': [
        service_schema(s, url), faq_schema(s['faqs'], url),
        crumbs([('Home', f'{SITE}/'), ('Services', f'{SITE}/services/'), (s['name'], url)])]}
    parts = [head(s['title'], s['description'], url, 2, schema), topbar(2, 'services'), '    <main id="main">']
    parts.append(f'''      <section class="hero">
        <div class="wrap">
          <p class="eyebrow">{E(s["eyebrow"])}</p>
          <h1>{E(s["h1"])}</h1>
          <p class="lede">{E(s["lede"])}</p>''')
    if s.get('kicker_line'):
        parts.append(f'          <p class="kicker-line">{E(s["kicker_line"])}</p>')
    parts.append('''          <div class="hero-actions">
            <a class="btn" href="../../start/">Book an AI Ops Audit &rarr;</a>
            <a class="btn btn--ghost" href="tel:+17809155471">780-915-5471</a>
          </div>''')
    if s['offers'] or s.get('price_note'):
        parts.append('          <div class="prices">\n' + price_block(s) + '\n          </div>')
    parts.append('        </div>\n      </section>\n')
    for t, k, items in s['sections']:
        parts.append(section(t, k, items))
    if s.get('proof') or s.get('links'):
        links = s.get('links') or [('Read the Evolve Eco Blasting case study', '../../work/evolve/')]
        li = '\n'.join(f'            <a class="btn btn--ghost" href="{u}"{"" if u.startswith("../") else " target=\"_blank\" rel=\"noopener noreferrer\""}>{E(n)} &rarr;</a>' for n, u in links)
        parts.append(f'''      <section class="band">
        <div class="wrap">
          <p class="kicker">Proof</p>
          <h2>Running at Evolve Eco Blasting.</h2>
          <p>One Edmonton crew, zero office staff. The receipts, quotes, dispatch and the 6:30 AM digest run on the spreadsheet and drive they already owned.</p>
          <div class="hero-actions">
{li}
          </div>
        </div>
      </section>
''')
    parts.append(faq_html(s['faqs']))
    rel = '\n'.join(f'            <li class="card"><h3><a href="../{r}/">{E(BY_SLUG[r]["name"])}</a></h3><p>{E(BY_SLUG[r]["description"])}</p></li>' for r in s['related'])
    parts.append(f'''      <section class="band">
        <div class="wrap">
          <p class="kicker">Related</p>
          <h2>Goes well with</h2>
          <ul class="cards">
{rel}
          </ul>
          <p><a href="../">All services &rarr;</a></p>
        </div>
      </section>
    </main>''')
    parts.append(foot(2))
    return '\n'.join(parts)


def hub_page():
    url = f'{SITE}/services/'
    title = 'AI Services for Small Businesses in Edmonton | kr8tiv AI'
    description = 'AI training, Company Brain builds, automations, tool integration and Evolve, for small businesses in Edmonton, across Alberta and Canada.'
    schema = {'@context': 'https://schema.org', '@graph': [
        {'@type': 'ItemList', 'name': 'kr8tiv AI services', 'itemListElement': [
            {'@type': 'ListItem', 'position': i, 'url': f'{SITE}/services/{s["slug"]}/', 'name': s['name']}
            for i, s in enumerate(SERVICES, 1)]},
        crumbs([('Home', f'{SITE}/'), ('Services', url)])]}
    cards = []
    for s in SERVICES:
        o = s['offers'][0] if s['offers'] else None
        price = ''
        if o:
            frm = 'From ' if len(o) > 3 and o[3] else ''
            price = f'<p class="step">{frm}{money(o[1])} CAD</p>'
        cards.append(f'''            <li class="card">
              {price}
              <h3><a href="{s["slug"]}/">{E(s["name"])}</a></h3>
              <p>{E(s["description"])}</p>
            </li>''')
    body = f'''    <main id="main">
      <section class="hero">
        <div class="wrap">
          <p class="eyebrow">Services · Edmonton, Alberta and across Canada</p>
          <h1>AI that does the work, for businesses that do the work.</h1>
          <p class="lede">
            We are an AI company in Edmonton. We teach teams how to use AI, build the company brain it
            works from, automate the busywork, connect the tools you already pay for, and set up Evolve,
            the business system we built and run with a real Edmonton crew.
          </p>
          <div class="hero-actions">
            <a class="btn" href="../start/">Book an AI Ops Audit &rarr;</a>
            <a class="btn btn--ghost" href="tel:+17809155471">780-915-5471</a>
          </div>
        </div>
      </section>

      <section class="band">
        <div class="wrap">
          <h2>What we do</h2>
          <ul class="cards">
{chr(10).join(cards)}
          </ul>
        </div>
      </section>

      <section class="band">
        <div class="wrap">
          <h2>How every engagement starts</h2>
          <ol class="timeline">
            <li>
              <span class="when">Week 1 · AI Ops Audit ($495)</span>
              <p>We sit inside your operation and map where the hours go. You get a written plan of what AI would take off your plate and what it costs, and you keep it either way.</p>
            </li>
            <li>
              <span class="when">Build · fixed scope</span>
              <p>Training, a company brain, automations or integrations, built on the tools you already use. You know the price before we start.</p>
            </li>
            <li>
              <span class="when">Care · month to month ($250 / mo)</span>
              <p>We keep it tuned and add what the season needs. No lock-in, and you keep the source code.</p>
            </li>
          </ol>
        </div>
      </section>
    </main>'''
    return head(title, description, url, 1, schema) + topbar(1, 'services') + body + foot(1)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / 'index.html').write_text(hub_page(), encoding='utf-8')
    for s in SERVICES:
        d = OUT / s['slug']
        d.mkdir(parents=True, exist_ok=True)
        (d / 'index.html').write_text(service_page(s), encoding='utf-8')
    print(f'wrote {1 + len(SERVICES)} pages under public/services/')


if __name__ == '__main__':
    main()
