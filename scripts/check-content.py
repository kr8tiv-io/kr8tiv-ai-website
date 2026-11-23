#!/usr/bin/env python3
"""Content guard for kr8tiv.ai. Fails the build check if served copy
mentions retired products (KIN, JARVIS), crypto or token wording, off-rule
social channels, star-rating schema, or contains em or en dashes.

kr8tiv.ai has nothing to do with Kin, Jarvis, crypto, tokens or on-chain
payments. Evolved (the Evolve Eco Blasting system) is the only product.
Run: python3 scripts/check-content.py"""
import pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
COPY_FILES = [ROOT / 'index.html', *ROOT.glob('public/**/*.html'), ROOT / 'public/llms.txt',
              ROOT / 'public/sitemap.xml', ROOT / 'public/robots.txt', ROOT / 'src/config/sections.ts']
CODE_FILES = [*ROOT.glob('src/components/**/*.tsx'), ROOT / 'src/App.tsx']

BANNED = [
    (r'\bKIN\b|\bKin\b', 'retired product KIN'),
    (r'\bJARVIS\b|\bJarvis\b', 'retired product JARVIS'),
    (r'meetyourkin', 'Kin link'),
    (r'x\.com/|twitter:site|t\.me/|telegram|whatsapp', 'off-rule social channel'),
    (r'github\.com/kr8tiv-ai/?["\'\s<]', 'GitHub org link (holds unrelated repos)'),
    (r'on-?chain|x402|x ?layer|\bokx\b|testnet|blockchain|crypto(?!graph)|\bnft\b|solana|web3|\bwallet|staking|\bdlmm\b|\$homes|\btokens?\b|stablecoin|usdc',
     'crypto or token wording'),
    (r'AggregateRating|reviewRating', 'star-rating schema'),
    (r'[\u2014\u2013]|&mdash;|&ndash;', 'em or en dash'),
]
COMMENT = re.compile(r'^\s*(//|/\*|\*|\{/\*)')

def lines(path, strip_comments):
    for n, line in enumerate(path.read_text(encoding='utf-8', errors='ignore').splitlines(), 1):
        if strip_comments and COMMENT.match(line):
            continue
        yield n, line

problems = []
for files, strip in ((COPY_FILES, False), (CODE_FILES, True)):
    for f in files:
        if not f.exists():
            continue
        for n, line in lines(f, strip):
            if line.strip().startswith('<!--'):
                continue
            for pat, why in BANNED:
                if re.search(pat, line, re.I if 'KIN' not in pat and 'JARVIS' not in pat else 0):
                    problems.append(f'{f.relative_to(ROOT)}:{n}: {why}: {line.strip()[:120]}')

if problems:
    print('\n'.join(problems))
    print(f'\n{len(problems)} content problem(s).')
    sys.exit(1)
print('content check passed')
