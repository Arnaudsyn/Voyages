#!/usr/bin/env python3
"""Check local navigation and the generated card/map contract without network access."""
import json
import re
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]

class Page(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.path, self.ids, self.links, self.focus, self.cards = path, [], [], [], []
        self.feed(path.read_text())
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if a.get('id'): self.ids.append(a['id'])
        if tag in ('a','link','script','img'):
            value=a.get('href') if tag in ('a','link') else a.get('src')
            if value: self.links.append(value)
        if 'data-focus' in a: self.focus.append(a['data-focus'])
        if tag=='article' and 'place' in a.get('class','').split(): self.cards.append(a.get('id'))

pages={p.resolve():Page(p) for p in ROOT.rglob('*.html') if 'templates' not in p.relative_to(ROOT).parts}
errors=[]
for path,p in pages.items():
    errors += [f'{path.relative_to(ROOT)}: duplicate id {i}' for i,n in Counter(p.ids).items() if n>1]
    for link in p.links:
        u=urlsplit(link)
        if u.scheme or u.netloc: continue
        dest=(path.parent/unquote(u.path)).resolve() if u.path else path
        if dest.is_dir(): dest=dest/'index.html'
        if not dest.is_file(): errors.append(f'{path.relative_to(ROOT)}: missing {link}')
        elif u.fragment and dest in pages and unquote(u.fragment) not in pages[dest].ids:
            errors.append(f'{path.relative_to(ROOT)}: missing anchor {link}')

guides=json.loads((ROOT/'data/japan-guides.json').read_text())
pin_count=0
for g in guides:
    path=(ROOT/'japon'/g['slug']/'index.html').resolve()
    text=path.read_text()
    page=pages[path]
    pins=json.loads(re.search(r'window.GUIDE_PLACES = (\[.*?\]);',text,re.S)[1])
    pin_count+=len(pins)
    pin_ids=[p['id'] for p in pins]
    if len(pin_ids)!=len(set(pin_ids)): errors.append(g['slug']+': duplicate map id')
    if set(page.focus)!=set(pin_ids): errors.append(g['slug']+': buttons and map pins disagree')
    for pin in pins:
        if pin['id'] not in page.cards: errors.append(g['slug']+': pin without card')
        if not (20<pin['lat']<47 and 122<pin['lng']<155): errors.append(g['slug']+': coordinate outside Japan')
    if re.search(r'FLAG |COUNTRY|CITY|EDITORIAL INTRO|\[0,0\]',text): errors.append(g['slug']+': template placeholder')
    if re.search(r'Login ID|Password:|Reservation Number|Code d.authentification|Numéro de réservation',text,re.I): errors.append(g['slug']+': private booking detail')
    for p in g['places']+g['hotels']:
        if 'mapsUrl' in p and urlsplit(p['mapsUrl']).netloc not in ('maps.app.goo.gl','maps.google.com','www.google.com'):
            errors.append(g['slug']+': unexpected maps host')

hub=pages[(ROOT/'japon/index.html').resolve()]
for g in guides:
    if g['slug']+'/' not in hub.links: errors.append(g['slug']+': absent from Japan hub')
from country_map import read_pins
country=json.loads((ROOT/'data/japan-map.json').read_text())
expected={p.parent.name+'/'+pin['id'] for p in (ROOT/'japon').glob('*/index.html') for pin in read_pins(p.read_text())}
if {p['id'] for p in country} != expected: errors.append('Country map does not cover every city-map pin')
if len(country)!=len({p['id'] for p in country}): errors.append('Country map: duplicate id')
for point in country:
    u=urlsplit(point['url'])
    target=(ROOT/'japon'/u.path/'index.html').resolve()
    if target not in pages or u.fragment not in pages[target].cards:
        errors.append('Country map: missing destination card '+point['url'])
    if point['category'] not in ('visit','hotel','food','onsen'): errors.append('Country map: unknown category')
    if not (20<point['lat']<47 and 122<point['lng']<155): errors.append('Country map: invalid coordinate')
hub_text=(ROOT/'japon/index.html').read_text()
if not (hub_text.index('les autres carnets s’enrichissent avec nos adresses et nos prochains avis.</p>') < hub_text.index('id="countryMapBlock"') < hub_text.index('href="#kanto"')):
    errors.append('Country map must follow the guide introduction and precede regional navigation')
if errors: raise SystemExit('\n'.join(errors))
print(f'PASS: {len(pages)} HTML pages; {len(guides)} new guides; {pin_count} city pins; {len(country)} country pins; links, anchors, card controls and source hygiene.')
