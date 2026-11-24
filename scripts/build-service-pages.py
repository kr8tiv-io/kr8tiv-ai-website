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
LASTMOD = '2026-11-23'

# Offer kinds: fixed, from, range (with max), monthly. 'proposed': True marks
# a price Matt has not approved yet (listed in docs/PRICES-FOR-REVIEW.md).
TIERS = [
    ('start', 'Start here', 'Small, fixed-price ways to find out what AI can do for you.'),
    ('build', 'Build', 'Software you own, built around how you work.'),
    ('premium', 'Premium', 'Bigger, specialized work for companies ready to change how the whole place runs.'),
]

SERVICES = [
    {
        'slug': 'ai-consulting', 'tier': 'start', 'card_price': 'Starts with the $495 audit',
        'name': 'AI Consulting',
        'service_type': 'AI consulting for small businesses',
        'title': 'AI Consulting for Small Businesses in Edmonton | kr8tiv AI',
        'description': 'AI consulting for Edmonton and Alberta small businesses: what to automate, what to keep human, which old apps to retire, and a plan you can act on.',
        'eyebrow': 'AI consulting · Edmonton, Alberta and across Canada',
        'h1': 'Bring your business into the AI age. Gently.',
        'lede': 'Everyone says you need AI. Fewer people can tell you what for. We look at how your business actually runs, then tell you what can be automated, what should stay human, and which old apps you can finally stop paying for. Straight answers, including "you do not need us for this one."',
        'kicker_line': 'We nerd out on the tools so you do not have to.',
        'offers': [],
        'price_note': 'Consulting starts with the AI Ops Audit ($495). Ongoing advice is quoted to the scope, or rolled into Fractional CTO.',
        'sections': [
            ('What we look at', 'cards', [
                ('What can be automated', 'The repeated, rule-based jobs that eat your evenings: quotes, receipts, follow-ups, reminders and reports.'),
                ('What should stay human', 'The calls, the judgment, the handshake, and anything that moves money. AI preps it. A person decides.'),
                ('Old apps worth retiring', 'The subscriptions you pay for, half use and quietly resent. Sometimes building your own is the cheaper move.'),
                ('Where your data lives', 'Who can see what, what should never go into an AI tool, and how Alberta PIPA fits in.'),
                ('What your people need to learn', 'The gap between "we bought it" and "we use it" is usually training, not software.'),
            ]),
            ('How it goes', 'ticks', [
                ('Listen first', 'we learn how the business runs before anyone says the word "agent."'),
                ('A written plan', 'what to do, in what order, what it costs, and what to skip.'),
                ('No dependency games', 'we set it up, train your people to run it, and stay on only if you want us to.'),
                ('Honest scope', 'if a twenty dollar app already does the job, we will say so.'),
            ]),
        ],
        'faqs': [
            ('What does an AI consultant actually do for a small business?', 'Finds the work AI can take off your plate, tells you what it costs and what to leave alone, and then helps you build it or hands you a plan to build it yourself.'),
            ('Where do we start?', 'With the AI Ops Audit: one week, $495, and a written plan you keep whoever builds it.'),
            ('Will you tell us to buy a pile of new software?', 'Usually the opposite. Most of the time we connect what you have, retire what you do not need, and build the missing piece.'),
            ('Do you consult outside Edmonton?', 'Yes. We are based in Edmonton, work in person across Alberta, and work remotely with businesses anywhere in Canada.'),
            ('What does AI consulting cost?', 'The AI Ops Audit is $495. Ongoing consulting is quoted to the scope. Fractional CTO is $5,000 a month for the build months.'),
        ],
        'related': ['ai-audit', 'fractional-cto'],
    },
    {
        'slug': 'ai-audit', 'tier': 'start', 'card_price': '$495',
        'name': 'AI Ops Audit',
        'service_type': 'AI readiness audit and automation plan',
        'title': 'AI Audit for Edmonton Small Businesses | kr8tiv AI',
        'description': 'A one-week AI overview of your company: where the hours go, what AI should take over and what it costs. $495, credited toward builds of $1,000 or more.',
        'eyebrow': 'AI Ops Audit · Edmonton, Alberta',
        'h1': 'An X-ray for your back office.',
        'lede': 'One week inside your operation, mapping where the hours actually go. Then a written plan: what AI should take over, what should stay exactly as it is, and what each piece costs. Nobody gets a ninety-slide deck. You get a plan you can read over one coffee.',
        'offers': [{'name': 'AI Ops Audit', 'price': 495, 'what': 'A week mapping where your hours go, plus a written plan.'}],
        'price_note': 'Credited toward any build of $1,000 or more. The plan is yours whoever builds it.',
        'sections': [
            ('What you get', 'cards', [
                ('A time map', 'Where the week\'s hours go, by person and by task.'),
                ('The automation shortlist', 'The jobs worth handing to software first, ranked by the hours they give back.'),
                ('The keep-human list', 'What stays with people, and why.'),
                ('A tool review', 'What you pay for, what you use, and what talks to what.'),
                ('A costed plan', 'A fixed price for each piece, so you can say yes to one and no to the rest.'),
            ]),
            ('How the week runs', 'ticks', [
                ('Talk to the people doing the work', 'not just the org chart.'),
                ('Watch the real workflow', 'the spreadsheets, the inbox and the truck.'),
                ('Write it down', 'a plan in plain words, with prices.'),
                ('Walk you through it', 'and answer the awkward questions.'),
            ]),
        ],
        'proof': True,
        'faqs': [
            ('What is an AI audit?', 'A week spent mapping how your business runs, followed by a written plan of what AI should take over, what should stay human, and what each piece costs.'),
            ('How long does it take?', 'About a week, depending on how many people and tools are involved.'),
            ('Is the $495 credited toward a build?', 'Yes. It is credited toward any build of $1,000 or more.'),
            ('Do we have to build with you afterwards?', 'No. The plan is yours whoever builds it.'),
            ('Can you audit a business outside Edmonton?', 'Yes. We work in person across Alberta and remotely across Canada.'),
        ],
        'related': ['ai-consulting', 'automations'],
    },
    {
        'slug': 'ai-training', 'tier': 'start', 'card_price': '$1,000 per group session',
        'name': 'AI Training & Courses',
        'service_type': 'AI training for teams and individuals',
        'title': 'AI Training & Courses in Edmonton and Across Canada | kr8tiv AI',
        'description': 'AI training for teams and individuals in Edmonton, Alberta and across Canada. Hands-on group sessions at $1,000, built on the tools you already use.',
        'eyebrow': 'AI training · Edmonton, Alberta and across Canada',
        'h1': 'We teach your people AI. Nobody falls asleep.',
        'lede': 'Hands-on AI training for teams and individuals who want to use it properly: what it is brilliant at, where it confidently makes things up, and how to put it to work on the jobs your people already do. In person around Edmonton and Alberta, live online across Canada.',
        'offers': [{'name': 'Group training session', 'price': 1000, 'what': 'One hands-on session for your team, built around your business and your tools.'}],
        'price_note': 'Individual coaching is quoted to what you want to learn. Multi-session courses are quoted to group size and schedule.',
        'sections': [
            ('What your people learn', 'cards', [
                ('What AI is actually good at', 'Drafting, summarizing, sorting and checking. Where it saves hours, and where it costs you if nobody reads the output.'),
                ('Why it makes things up', 'AI guesses when it has no facts to work from. We show your people how to give it the facts, so the answers sound like your business.'),
                ('Your data, handled properly', 'What should and should not go into an AI tool, and how privacy rules like Alberta PIPA apply to customer information.'),
                ('The tools you already pay for', 'We train on the AI tools you already have, not a shiny new subscription.'),
                ('One task, automated', 'Every session ends with a real, repeated task from your own week turned into a working workflow.'),
            ]),
            ('Who it is for', 'ticks', [
                ('Teams', 'owners, office staff, crews and managers. No coding.'),
                ('Individuals', 'one-on-one coaching for the person who wants to be the AI person in the room.'),
                ('In person', 'at your office, shop or boardroom in Edmonton and across Alberta.'),
                ('Live online', 'the same hands-on work for teams anywhere in Canada.'),
            ]),
        ],
        'faqs': [
            ('Do you only train in Edmonton?', 'No. We are based in Edmonton and train in person across Alberta. Sessions and courses also run live online for teams anywhere in Canada.'),
            ('Do you train individuals as well as companies?', 'Yes. Group sessions are for teams. Individual coaching is one-on-one and quoted to what you want to learn.'),
            ('Does my team need to be technical?', 'No. If someone can send an email, they can follow along.'),
            ('Can the training use our own company information?', 'Yes. Pair it with a Company Brain and your people practice on your real processes, prices and documents.'),
            ('How is this different from Corporate Training Systems?', 'A session teaches the people in the room. Corporate Training Systems builds the whole program, so the next hundred hires learn it too.'),
            ('What does it cost?', 'A group training session is $1,000. Individual coaching and multi-session courses are quoted.'),
        ],
        'related': ['corporate-training', 'company-brain'],
    },
    {
        'slug': 'automations', 'tier': 'start', 'card_price': 'From $250',
        'name': 'AI Automations',
        'service_type': 'AI business process automation',
        'title': 'AI Automation for Small Businesses in Edmonton | kr8tiv AI',
        'description': 'AI automations for Edmonton small businesses: receipts filed from a photo, same-day quotes with margin checks, dispatch, a 6:30 AM digest. From $250.',
        'eyebrow': 'AI automations · Edmonton, Alberta',
        'h1': 'The busywork, done before you ask.',
        'lede': 'We build AI automations that take the repeated admin off your plate: the receipts, the quotes, the follow-ups and the morning check of what is on fire. They run on the tools you already use, and they keep running when nobody remembers to ask.',
        'kicker_line': 'Your part is a photo and a yes.',
        'offers': [{'name': 'Single automation', 'price': 250, 'kind': 'from', 'what': 'One job, automated and running on your tools.'}],
        'price_note': 'Bigger builds are scoped in the AI Ops Audit ($495) and quoted as a fixed price.',
        'sections': [
            ('Automations we build', 'cards', [
                ('Receipt pipeline', 'A photo of a receipt becomes a filed, categorized expense row. No typing, no shoebox.'),
                ('Quoting with a margin check', 'Measurements go in, a branded quote comes out, checked against your real costs before it is sent.'),
                ('Dispatch tracking', 'Every job moves from lead to booked to done to invoiced, with the paperwork attached at each step.'),
                ('6:30 AM digest', 'Today\'s jobs, overdue follow-ups, expiring quotes and quiet leads, delivered before the coffee is.'),
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
        'related': ['company-brain', 'custom-business-app'],
    },
    {
        'slug': 'company-brain', 'tier': 'start', 'card_price': '$1,000',
        'name': 'Company Brain',
        'service_type': 'Company knowledge base and source of truth',
        'title': 'Company Brain for Edmonton Small Businesses | kr8tiv AI',
        'description': 'Stop running the company from memory. A Company Brain puts sales, ops, money, crew and marketing in one place your team and AI both use. $1,000.',
        'eyebrow': 'Company Brain · Edmonton, Alberta',
        'h1': 'Stop running the company from memory.',
        'lede': 'Most companies run on memory. The pricing lives in one person\'s head, the process lives in another\'s, and the brand voice changes depending on who\'s typing. A company brain is one organized home for all of it: your processes, prices, voice and templates.',
        'kicker_line': 'One brain. Every department. Zero "ask the boss."',
        'offers': [{'name': 'Company Brain', 'price': 1000, 'what': 'Sales, ops, finance, field and marketing in one brain your team and AI both use.'}],
        'price_note': 'One-time build. You own it.',
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
        'related': ['corporate-training', 'custom-business-app'],
    },
    {
        'slug': 'custom-business-app', 'tier': 'build', 'card_price': 'From $3,000',
        'name': 'Custom Business App',
        'service_type': 'Custom business software development',
        'title': 'Custom Business App Development in Edmonton | kr8tiv AI',
        'description': 'Retire the apps you rent and run the business from one screen you own. Custom business apps for Edmonton small businesses, from $3,000.',
        'eyebrow': 'Custom Business App · Edmonton, Alberta',
        'h1': 'Fire your old apps. Build the one you actually need.',
        'lede': 'Most small businesses rent a stack of apps that each do a slice of the job, and none of them talk to each other. A custom business app does the whole job your way: quoting, jobs, CRM, inventory, ordering and the dashboard, built around how you work and owned by you.',
        'offers': [
            {'name': 'Custom Business App', 'price': 3000, 'what': 'The full command centre, built for your trade, your rates and your team.'},
            {'name': 'Brain + Business App', 'price': 3750, 'what': 'Company Brain plus a Custom Business App. Saves $250 on buying both separately.'},
        ],
        'price_note': 'One-time build. You own the code.',
        'sections': [
            ('What goes in it', 'cards', [
                ('Owner dashboard', 'The numbers, the jobs and what needs attention, on one screen.'),
                ('Quoting engine', 'Your rates and margins built in, so every quote is priced the same way.'),
                ('CRM', 'Customers, leads and history in one place, instead of the CRM you rent and resent.'),
                ('Inventory and ordering', 'What you have, what is running low, and what is on order.'),
                ('Crew on their phones', 'Photos, receipts, hours and safety forms from the job site.'),
                ('AI doing the admin', 'Prices quotes, files receipts and writes the morning report. A person approves anything that moves money.'),
            ]),
            ('Exhibit A: Evolve', 'para', [
                'Evolve is a business app we built for Evolve Eco Blasting, an Edmonton crew with no office staff: a field app, one workbook, an AI that prices quotes and files receipts, and a dashboard for the owner. It is the proof, not the template. Yours gets built around your business.',
            ]),
        ],
        'proof': True,
        'links': [('See Evolve running live', 'https://www.evolvedmcp.cloud/'), ('Read the Evolve Eco Blasting case study', '../../work/evolve/')],
        'faqs': [
            ('Why build our own app instead of buying software?', 'Rented software makes you work its way, charges every month, and still needs three other apps beside it. A custom app works your way, and you own it.'),
            ('Is a custom business app the same as Evolve?', 'No. Evolve is one app we built, for Evolve Eco Blasting. Your app is built for your business. Evolve just proves the approach works on a real crew.'),
            ('Will we lose our data from the old apps?', 'No. We move what matters into the new app before anything gets cancelled.'),
            ('How is AI used in the app?', 'It does the admin between the jobs: pricing quotes, filing receipts and writing the morning report. A person approves anything that moves money.'),
            ('What does a custom business app cost?', '$3,000, one time. With a Company Brain it is $3,750 as Brain + Business App.'),
        ],
        'related': ['company-brain', 'tool-integration'],
    },
    {
        'slug': 'corporate-training', 'tier': 'premium', 'card_price': 'From $7,500',
        'name': 'Corporate Training Systems',
        'service_type': 'Corporate AI training program design and delivery',
        'title': 'Corporate AI Training Systems, Edmonton and Canada | kr8tiv AI',
        'description': 'Corporate AI training systems for Alberta and Canadian organizations: a full program with role-based tracks, your own playbook, and onboarding built in.',
        'eyebrow': 'Corporate Training Systems · Edmonton, Alberta and across Canada',
        'h1': 'Training that keeps working after we leave the room.',
        'lede': 'A session teaches the people in the room. A training system teaches the next hundred. We build your organization\'s AI program: role-based tracks, exercises from your own work, a library people actually open, and onboarding that does not depend on who has time that week.',
        'offers': [{'name': 'Corporate Training System', 'price': 7500, 'kind': 'from', 'proposed': True, 'what': 'A full AI training program, designed and delivered for your organization.'}],
        'price_note': 'Scaled to headcount, departments and locations. Quoted in writing after a scoping call.',
        'sections': [
            ('What gets built', 'cards', [
                ('Role-based tracks', 'Different lessons for the front desk, the field, finance and leadership, because they use AI for different things.'),
                ('Your work as the homework', 'Exercises built on your real processes, so practice turns straight into output.'),
                ('A library people open', 'Short guides, prompts and checklists, in one place and kept current.'),
                ('Onboarding built in', 'New hires learn the way your company uses AI in week one, not by accident in month six.'),
                ('Policy and guardrails', 'What goes into AI tools, what never does, and who signs off. Written for humans, checked against Alberta PIPA.'),
                ('Train the trainers', 'Your own people learn to run the program, so it does not need us forever.'),
            ]),
            ('Who it is for', 'ticks', [
                ('Organizations with several teams', 'or several locations, where one session is not enough.'),
                ('In person', 'in Edmonton and across Alberta.'),
                ('Live online', 'for teams anywhere in Canada.'),
                ('Built on your Company Brain', 'so the training and the AI tools use the same facts.'),
            ]),
        ],
        'faqs': [
            ('How is this different from a training session?', 'A session teaches the people in the room. Corporate Training Systems builds the program, the materials and the onboarding, so new people learn it too.'),
            ('Do you deliver across Canada?', 'Yes. In person in Edmonton and Alberta, and live online anywhere in Canada.'),
            ('Can it use our own policies and processes?', 'Yes. The exercises and the library are built on your real work, ideally from your Company Brain.'),
            ('How long does it take to build?', 'It depends on headcount and departments. You get a timeline with the written quote.'),
            ('What does a corporate training system cost?', 'From $7,500, scaled to headcount, departments and locations, and quoted in writing.'),
        ],
        'related': ['ai-training', 'company-brain'],
    },
    {
        'slug': 'tool-integration', 'tier': 'premium', 'card_price': 'From $5,000',
        'name': 'Tool Selection & Integration',
        'service_type': 'Business software selection and integration',
        'title': 'Business Tool Selection & Integration in Edmonton | kr8tiv AI',
        'description': 'We help Alberta and Canadian companies choose the right tools, retire the wrong ones, and wire the rest together so they work as one system.',
        'eyebrow': 'Tool Selection & Integration · Edmonton, Alberta and across Canada',
        'h1': 'All your tools, pulling in the same direction.',
        'lede': 'Somewhere in your company there is a tool nobody uses, two tools doing the same job, and one spreadsheet holding the whole thing together with hope. We pick the right stack with you, retire the dead weight, and connect what stays, so every job, customer and number is typed once and shows up everywhere it should.',
        'offers': [{'name': 'Tool Selection & Integration', 'price': 5000, 'kind': 'from', 'proposed': True, 'what': 'Stack review, tool selection, and the integrations that make it one system.'}],
        'price_note': 'Scaled to the number of tools, teams and locations. A single small connection is scoped in the AI Ops Audit ($495) instead.',
        'sections': [
            ('Selection first', 'cards', [
                ('Stack inventory', 'Everything you pay for, who uses it, and what it actually does.'),
                ('Needs before features', 'What each team has to get done, before anyone watches a sales demo.'),
                ('Tested on your work', 'We try the candidates on your real jobs and tell you which one wins and why.'),
                ('Retire the dead weight', 'Cancel what overlaps, after the data is safely out.'),
            ]),
            ('Then make them work together', 'cards', [
                ('Spreadsheets and drive', 'One workbook becomes the source of truth, with folders that mirror it.'),
                ('Email and calendar', 'Bookings, confirmations and reminders flow from the job record, not from memory.'),
                ('Quoting and invoicing', 'A quote becomes a job, the job becomes an invoice, without retyping.'),
                ('Field and office', 'What the crew captures on a phone lands in the office tools the same day.'),
                ('AI on top', 'With the data in one place, AI assistants and automations can finally read it.'),
            ]),
            ('The rules we build by', 'ticks', [
                ('No rip and replace for its own sake', 'we keep what works.'),
                ('One source of truth', 'every number has one home, and everything else reads from it.'),
                ('You own it', 'your accounts, your data, and the source code we wrote.'),
                ('Vendor-neutral', 'we do not get paid by the software we recommend.'),
            ]),
        ],
        'faqs': [
            ('Which tools can you connect?', 'Most of the everyday ones: spreadsheets, cloud drives, email, calendars, forms and business apps with an API. We confirm the exact list during selection.'),
            ('Do you get commissions from the tools you recommend?', 'No. We recommend what fits your work, and we tell you why.'),
            ('Will we lose our data or history?', 'No. Data moves before anything is cancelled, and it stays in your own accounts.'),
            ('Why not just buy one all-in-one app?', 'Sometimes that is the answer, and we will say so. Often the better move is keeping the tools your team knows and connecting them, or building the missing piece.'),
            ('What does it cost?', 'From $5,000, scaled to the number of tools, teams and locations. A single small connection is scoped in the AI Ops Audit ($495) instead.'),
        ],
        'related': ['custom-business-app', 'fractional-cto'],
    },
    {
        'slug': 'fractional-cto', 'tier': 'premium', 'card_price': '$5,000 / month',
        'name': 'Fractional CTO',
        'service_type': 'Fractional CTO and AI operations',
        'title': 'Fractional CTO and AI Ops for Edmonton Businesses | kr8tiv AI',
        'description': 'A fractional CTO for Alberta small and mid-sized businesses: tech decisions, builds and AI operations, without a full-time hire. $5,000 a month to start.',
        'eyebrow': 'Fractional CTO · Edmonton, Alberta and across Canada',
        'h1': 'A CTO, minus the corner office.',
        'lede': 'You need someone who owns the tech decisions, but not necessarily a full-time salary for it. Fractional AI Ops puts a senior builder in your corner for the months it matters: sourcing, ordering, inventory, quotes, intake, POS and CRM, rebuilt and run as one system.',
        'offers': [
            {'name': 'Fractional AI Ops, build months', 'price': 5000, 'kind': 'monthly', 'what': 'Up to 80 hours a month. Two-month minimum.'},
            {'name': 'Fractional AI Ops, after launch', 'price': 3950, 'kind': 'monthly', 'what': 'Up to 60 hours a month.'},
        ],
        'price_note': "Two build months at $5,000, then $3,950 a month. After the minimum, 30 days' notice to stop.",
        'sections': [
            ('What a fractional CTO covers', 'cards', [
                ('Tech decisions', 'What to buy, build, keep or kill, with the reasons written down.'),
                ('Vendor wrangling', 'We sit through the software sales calls so you do not have to.'),
                ('Builds, not just advice', 'Brain, apps, automations and integrations, actually built.'),
                ('AI operations', 'The agents, the rules and the money gates, kept running and kept honest.'),
                ('Your people, trained', 'So the knowledge stays in the building when the engagement ends.'),
            ]),
            ('How it works', 'ticks', [
                ('Two build months', 'up to 80 hours each.'),
                ('Then run mode', 'up to 60 hours a month at $3,950.'),
                ('No lock-in', "30 days' notice after the two-month minimum."),
                ('You own everything', 'the code, the accounts and the documentation.'),
            ]),
        ],
        'faqs': [
            ('What is a fractional CTO?', 'A senior technology lead you share part-time. You get the decisions, the builds and the accountability without hiring for it full time.'),
            ('Who is it for?', 'Small and mid-sized businesses that have outgrown duct-taped tools but do not need a full-time technology executive.'),
            ('What does it cost?', 'Two build months at $5,000 a month for up to 80 hours each, then $3,950 a month for up to 60 hours.'),
            ('Can we stop?', "Yes. After the two-month minimum, give 30 days' notice."),
            ('How is it different from a Full Business Overhaul?', 'An overhaul is a fixed-price project. Fractional CTO is an ongoing monthly role. Plenty of companies do one, then the other.'),
        ],
        'related': ['business-overhaul', 'ai-consulting'],
    },
    {
        'slug': 'business-overhaul', 'tier': 'premium', 'card_price': '$10,000 to $20,000',
        'name': 'Full Business Overhaul',
        'service_type': 'Full AI business systems overhaul',
        'title': 'Full AI Business Overhaul for Edmonton Companies | kr8tiv AI',
        'description': 'A full AI business overhaul for Edmonton and Alberta companies: brain, apps, automations, tools and training rebuilt as one system. $10,000 to $20,000.',
        'eyebrow': 'Full Business Overhaul · Edmonton, Alberta and across Canada',
        'h1': 'The whole back office. Rebuilt. On purpose.',
        'lede': 'For the business that has outgrown sticky notes, group chats and the one spreadsheet everybody is scared to touch. We rebuild how the whole company runs: the brain, the apps, the automations, the tools and the training, designed together so they work as one system instead of a pile of fixes.',
        'kicker_line': 'Insane ambition. Educated execution. Fixed price.',
        'offers': [{'name': 'Full Business Overhaul', 'price': 10000, 'max': 20000, 'kind': 'range', 'what': 'Everything rebuilt as one system, priced to the size of your business.'}],
        'price_note': 'A fixed price between $10,000 and $20,000, set after the AI Ops Audit, depending on the scale of the business.',
        'sections': [
            ('What gets rebuilt', 'cards', [
                ('Company Brain', 'Every process, price and document in one place.'),
                ('Custom Business App', 'One screen to run the business, owned by you.'),
                ('Automations', 'Receipts, quotes, follow-ups and the morning digest, handled.'),
                ('Tool selection and integration', 'The right stack, connected, with the dead weight cancelled.'),
                ('Team training', 'Your people learn to run all of it.'),
                ('Gates and policies', 'Who approves what, and what AI never does alone.'),
            ]),
            ('How it runs', 'ticks', [
                ('Audit first', 'the $495 audit sets the scope and the fixed price.'),
                ('Built in phases', 'so the business keeps running while we work.'),
                ('Trained, then handed over', 'your people run it, and we stay on only if you want us to.'),
                ('You own it', 'the code, the accounts and the documentation.'),
            ]),
        ],
        'proof': True,
        'faqs': [
            ('What is included in a full business overhaul?', 'A Company Brain, a Custom Business App, automations, tool selection and integration, team training and the approval gates, designed and built together.'),
            ('How is the price set?', 'After the AI Ops Audit. It lands between $10,000 and $20,000 depending on the size of the business, and it is fixed before we start.'),
            ('How long does it take?', 'It depends on the scale. You get a phased timeline with the fixed price.'),
            ('Will the business keep running during the overhaul?', 'Yes. It is built in phases so the day-to-day keeps moving.'),
            ('Do you work outside Edmonton?', 'Yes. In person across Alberta and remotely across Canada.'),
        ],
        'related': ['fractional-cto', 'custom-business-app'],
    },
]
BY_SLUG = {s['slug']: s for s in SERVICES}
SUPPORT_PLAN = {'name': 'AI Support Plan', 'price': 750, 'proposed': True,
                'what': 'Monitoring, fixes, tool updates and small changes to what we built, plus a monthly check-in.'}


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


def price_text(o):
    kind = o.get('kind', 'fixed')
    if kind == 'from':
        return f'From {money(o["price"])}'
    if kind == 'range':
        return f'{money(o["price"])} to {money(o["max"])}'
    if kind == 'monthly':
        return f'{money(o["price"])} / mo'
    return money(o['price'])


def price_block(s):
    rows = []
    for o in s['offers']:
        rows.append(f'''            <div class="price">
              <p class="price-name">{E(o["name"])}</p>
              <p class="price-amount">{price_text(o)} <small>CAD</small></p>
              <p>{E(o["what"])}</p>
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
        kind = o.get('kind', 'fixed')
        spec = {'@type': 'UnitPriceSpecification' if kind == 'monthly' else 'PriceSpecification', 'priceCurrency': 'CAD'}
        offer = {'@type': 'Offer', 'name': o['name'], 'description': o['what'], 'priceCurrency': 'CAD'}
        if kind == 'from':
            spec['minPrice'] = o['price']
        elif kind == 'range':
            spec['minPrice'] = o['price']; spec['maxPrice'] = o['max']
        else:
            spec['price'] = o['price']; offer['price'] = o['price']
            if kind == 'monthly':
                spec['unitText'] = 'MONTH'; spec['billingDuration'] = 'P1M'
        offer['priceSpecification'] = spec
        offers.append(offer)
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
    title = 'AI Services for Small Businesses in Edmonton, Alberta | kr8tiv AI'
    description = ('AI consulting, training, automations, company brains, custom business apps and tool '
                   'integration for small businesses in Edmonton, Alberta and Canada.')
    schema = {'@context': 'https://schema.org', '@graph': [
        {'@type': 'ItemList', 'name': 'kr8tiv AI services', 'itemListElement': [
            {'@type': 'ListItem', 'position': i, 'url': f'{SITE}/services/{s["slug"]}/', 'name': s['name']}
            for i, s in enumerate(SERVICES, 1)]},
        crumbs([('Home', f'{SITE}/'), ('Services', url)])]}
    bands = []
    for key, label, blurb in TIERS:
        cards = []
        for s in SERVICES:
            if s['tier'] != key:
                continue
            cards.append(f"""            <li class="card">
              <p class="step">{E(s["card_price"])}</p>
              <h3><a href="{s["slug"]}/">{E(s["name"])}</a></h3>
              <p>{E(s["description"])}</p>
            </li>""")
        bands.append(f"""      <section class="band">
        <div class="wrap">
          <p class="kicker">{E(label)}</p>
          <h2>{E(blurb)}</h2>
          <ul class="cards">
{chr(10).join(cards)}
          </ul>
        </div>
      </section>
""")
    sp = SUPPORT_PLAN
    body = f"""    <main id="main">
      <section class="hero">
        <div class="wrap">
          <p class="eyebrow">AI consulting · Edmonton, Alberta and across Canada</p>
          <h1>We help bring your business into the AI age.</h1>
          <p class="lede">
            kr8tiv AI is an AI consulting company in Edmonton. We work out what can be automated, build
            the software you wish you had instead of renting five apps that do not talk to each other,
            and teach your people to run it. Insane ideas, educated execution, and an honest answer when
            you do not need us.
          </p>
          <p class="kicker-line">Small businesses first. Big ambitions welcome.</p>
          <div class="hero-actions">
            <a class="btn" href="../start/">Book an AI Ops Audit &rarr;</a>
            <a class="btn btn--ghost" href="tel:+17809155471">780-915-5471</a>
          </div>
        </div>
      </section>

{''.join(bands)}
      <section class="band">
        <div class="wrap">
          <p class="kicker">Proof</p>
          <h2>One thing we built: Evolve.</h2>
          <p>Evolve is the business app we built for Evolve Eco Blasting, an Edmonton crew with no office staff. Receipts, quotes, dispatch and the 6:30 AM digest run on the spreadsheet and drive they already owned. It is one example of the work, not the whole menu.</p>
          <div class="hero-actions">
            <a class="btn btn--ghost" href="../work/evolve/">Read the case study &rarr;</a>
          </div>
        </div>
      </section>

      <section class="band">
        <div class="wrap">
          <h2>How every engagement runs</h2>
          <ol class="timeline">
            <li>
              <span class="when">Week 1 · AI Ops Audit ($495)</span>
              <p>We sit inside your operation and map where the hours go. You get a written plan of what AI would take off your plate and what it costs, and you keep it either way.</p>
            </li>
            <li>
              <span class="when">Build · fixed price</span>
              <p>Training, a company brain, automations, apps or the whole overhaul, built on the tools that earn their place. You know the price before we start.</p>
            </li>
            <li>
              <span class="when">Keep it running · {E(sp["name"])} (from {money(sp["price"])} / mo)</span>
              <p>{E(sp["what"])} Month to month, and you keep the source code.</p>
            </li>
          </ol>
        </div>
      </section>
    </main>"""
    return head(title, description, url, 1, schema) + topbar(1, 'services') + body + foot(1)


def llms_services():
    lines = []
    for s in SERVICES:
        prices = '; '.join(f'{o["name"]}: {price_text(o)} CAD{" a month" if o.get("kind") == "monthly" else ""}'.replace(' / mo CAD a month', ' CAD a month')
                           for o in s['offers'])
        extra = f' {prices}.' if prices else ''
        lines.append(f'- {s["name"]}: {SITE}/services/{s["slug"]}/ {s["description"]}{extra} {s["price_note"]}')
    sp = SUPPORT_PLAN
    lines.append(f'- {sp["name"]}: {sp["what"]} From {money(sp["price"])} CAD a month.')
    return '\n'.join(lines)


def update_llms():
    path = ROOT / 'public' / 'llms.txt'
    txt = path.read_text(encoding='utf-8')
    a = txt.index('## Services\n') + len('## Services\n')
    b = txt.index('\n## ', a)
    path.write_text(txt[:a] + '\n' + llms_services() + '\n' + txt[b:], encoding='utf-8')


def update_sitemap():
    path = ROOT / 'public' / 'sitemap.xml'
    txt = path.read_text(encoding='utf-8')
    import re
    txt = re.sub(r'  <url>\n    <loc>https://kr8tiv\.ai/services/[^<]+/</loc>.*?</url>\n', '', txt, flags=re.S)
    entries = ''.join(f"""  <url>
    <loc>{SITE}/services/{s["slug"]}/</loc>
    <lastmod>{LASTMOD}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
""" for s in SERVICES)
    marker = f'  <url>\n    <loc>{SITE}/services/</loc>'
    i = txt.index(marker); j = txt.index('</url>\n', i) + len('</url>\n')
    path.write_text(txt[:j] + entries + txt[j:], encoding='utf-8')


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    keep = {s['slug'] for s in SERVICES}
    for d in OUT.iterdir():
        if d.is_dir() and d.name not in keep:
            for f in d.iterdir():
                f.unlink()
            d.rmdir()
    (OUT / 'index.html').write_text(hub_page(), encoding='utf-8')
    for s in SERVICES:
        d = OUT / s['slug']
        d.mkdir(parents=True, exist_ok=True)
        (d / 'index.html').write_text(service_page(s), encoding='utf-8')
    update_llms()
    update_sitemap()
    print(f'wrote {1 + len(SERVICES)} pages under public/services/, updated llms.txt and sitemap.xml')


if __name__ == '__main__':
    main()
