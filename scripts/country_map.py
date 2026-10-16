"""Collect the existing city-map pins, keeping their exact destination-card links."""
import ast
import json
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlencode, urlsplit

ROOT = Path(__file__).resolve().parents[1]

class Cards(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.cards, self.current, self.paragraph = {}, None, False
        self.feed(text)
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'article' and 'place' in a.get('class', '').split():
            self.current = {'text': [], 'mapsUrl': None}
            self.cards[a['id']] = self.current
        if self.current is not None:
            if tag == 'p': self.paragraph = True
            if tag == 'a':
                url = a.get('href', '')
                u = urlsplit(url)
                if u.netloc in ('maps.app.goo.gl', 'maps.google.com') or (u.netloc in ('www.google.com', 'google.com') and u.path.startswith('/maps')):
                    self.current['mapsUrl'] = url
    def handle_endtag(self, tag):
        if tag == 'p':
            if self.current is not None: self.current['text'].append(' ')
            self.paragraph = False
        if tag == 'article': self.current, self.paragraph = None, False
    def handle_data(self, data):
        if self.current is not None and self.paragraph: self.current['text'].append(data)

def read_pins(text):
    match = re.search(r'window\.GUIDE_PLACES\s*=\s*(\[.*?\]);', text, re.S)
    if not match: return []
    try: return json.loads(match[1])
    except json.JSONDecodeError:
        # Kyoto's original data uses JS object keys. Values are strings/numbers;
        # literal_eval reads them without executing the script.
        literal = re.sub(r'([{,])\s*(\w+)\s*:', r"\1'\2':", match[1])
        return ast.literal_eval(literal)

def build():
    names = {g['slug']:g['name'] for g in json.loads((ROOT/'data/japan-guides.json').read_text())}
    names['kyoto'] = 'Kyoto'
    points = []
    for page in sorted((ROOT/'japon').glob('*/index.html')):
        text = page.read_text()
        cards = Cards(text).cards
        city = page.parent.name
        for pin in read_pins(text):
            if pin['id'] not in cards: raise ValueError(f'{city}: pin without card: {pin["id"]}')
            card = cards[pin['id']]
            kind = pin.get('kind', 'visit')
            category = 'hotel' if kind == 'hotel' else 'food' if kind == 'food' else 'onsen' if '♨' in pin.get('emoji', '') else 'visit'
            description = ' '.join(''.join(card['text']).split())
            if len(description) > 240: description = description[:237].rsplit(' ', 1)[0]+'…'
            points.append(dict(id=city+'/'+pin['id'], name=pin['name'], city=names[city], category=category,
                lat=pin['lat'], lng=pin['lng'], emoji=pin.get('emoji', '📍'), description=description,
                url=city+'/#'+pin['id'], mapsUrl=pin.get('mapsUrl') or card['mapsUrl'] or
                'https://www.google.com/maps/search/?'+urlencode({'api':1,'query':f'{pin["lat"]},{pin["lng"]}'})))
    (ROOT/'data/japan-map.json').write_text(json.dumps(points, ensure_ascii=False, indent=2)+'\n')
    print(f'Country map: {len(points)} pins from {len(set(p["city"] for p in points))} guides.')

if __name__ == '__main__': build()
