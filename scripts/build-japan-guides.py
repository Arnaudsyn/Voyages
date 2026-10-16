#!/usr/bin/env python3
"""Render the curated French destination data as static, Kyoto-style pages."""
import json
import re
import unicodedata
from html import escape as e
from pathlib import Path
from urllib.parse import urlencode

ROOT = Path(__file__).resolve().parents[1]
GUIDES = json.loads((ROOT / 'data/japan-guides.json').read_text())
NAMES = {g['slug']: g['name'] for g in GUIDES} | {'kyoto': 'Kyoto'}
TEMPLATE = (ROOT / 'templates/city-guide.html').read_text()

def slug(text):
    return re.sub(r'[^a-z0-9]+', '-', unicodedata.normalize('NFKD', text).encode('ascii','ignore').decode().lower()).strip('-')

def external(url, label, css='site-link'):
    return f'<a class="{css}" href="{e(url, quote=True)}" target="_blank" rel="noopener">{e(label)} ↗</a>'

def map_url(p, city):
    return p.get('mapsUrl') or ('https://www.google.com/maps/search/?' + urlencode({'api':1, 'query':p['name']+' '+city}))

def card(p, city, index):
    pid = f"lieu-{index}-{slug(p['name'])}"
    p['id'] = pid
    pin = 'lat' in p
    actions = (f'<button class="map-link" type="button" data-focus="{pid}">Voir sur la carte</button>' if pin else '')
    actions += external(map_url(p, city), 'Google Maps', 'google-map-link') if not any(t in p['status'] for t in ['confirmer', 'préciser', 'identifier', 'choisir']) else ''
    if p.get('source'): actions += external(p['source'], 'En savoir plus')
    return f'''<article class="place" id="{pid}" data-place="{pid}">
      <div class="place-title"><span class="emoji">{e(p['emoji'])}</span><h3>{e(p['name'])}</h3></div>
      <div class="meta"><span class="tag untested">{e(p['status'])}</span></div>
      <p>{e(p['text'])}</p><div class="actions">{actions}</div>
    </article>'''

def section(sid, kicker, title, body):
    return f'<section id="{sid}"><div class="section-head"><div class="section-kicker">{e(kicker)}</div><h2>{e(title)}</h2></div>{body}</section>'

for g in GUIDES:
    all_places = g['places'] + g['hotels']
    rendered = [card(p, g['name'], i+1) for i,p in enumerate(all_places)]
    visits = ''.join(rendered[:len(g['places'])])
    hotels = ''.join(rendered[len(g['places']):])
    nav = '<a href="../../">← Tous les guides</a><a href="../">🇯🇵 Japon</a>'
    items = [('transport','🚆 Se déplacer'),('hotels','🏨 Où dormir'),('visites','📍 Nos repères'),('itineraire','🌿 Prendre son temps'),('a-completer','🧭 À compléter')]
    nav += ''.join(f'<a href="#{sid}">{e(label)}</a>' for sid,label in items)
    hero = f'''<header class="hero"><div class="eyebrow">{e(g['region'])} · {e(g['duration'])} · Première version</div>
      <h1>{e(g['name'])},<br>notre petit guide !</h1><p class="lead">{e(g['intro'])}</p>
      <div class="legend"><span class="pill">📍 Les repères de nos carnets</span><span class="pill">🧭 Des pistes à explorer</span><span class="pill">✍️ Nos avis à compléter</span></div></header>
      <div class="toc"><h2>Menu rapide</h2><div class="toc-links">{''.join(f'<a href="#{sid}">{e(label)}</a>' for sid,label in items)}</div></div>'''
    body = hero
    body += section('transport','Le trajet fait partie du séjour','Se déplacer',f'<article class="mini-card"><p>{e(g["transport"])}</p><a href="../transports/">Trains, IC Cards et passes au Japon →</a></article>')
    body += section('hotels','Choisir sa base','Où dormir',f'<p class="section-intro">{e(g["sleep"])}</p>'+('<div class="places">'+hotels+'</div>' if hotels else '<p>Les éventuelles adresses de ryokan sont présentées avec les repères ci-dessous.</p>' if any(p['kind']=='hotel' for p in g['places']) else ''))
    body += section('visites','Les lieux à garder sous le coude','Nos repères',f'<div class="places">{visits}</div>')
    body += section('itineraire','Un rythme, pas une course','Comment organiser l’étape','<article class="mini-card"><ol>'+''.join('<li>'+e(p)+'</li>' for p in g['plan'])+'</ol><p>Une trame indicative à adapter à la météo, aux transports et aux réservations.</p></article>')
    body += section('a-completer','Le carnet reste ouvert','Ce qu’on aimerait encore préciser',f'<article class="notice"><p>{e(g["gaps"])}</p><p>Cette première version rassemble nos notes et des repères de préparation. Une adresse enregistrée n’implique pas un avis de séjour ; on garde les coups de cœur pour les retours réellement documentés.</p></article>')
    if g['related']:
        links = ''.join(f'<a class="site-link" href="../{e(s)}/">{e(NAMES[s])} →</a>' for s in g['related'])
        body += section('autour','Poursuivre le voyage','À combiner avec',f'<div class="actions">{links}</div>')
    if g['sources']:
        body += section('sources','Pour préparer concrètement','Liens utiles', '<div class="actions">'+''.join(external(url,label) for label,url in g['sources'])+'</div>')
    body += '<footer class="footer"><p>Première rédaction · octobre 2026. Les durées proposées sont indicatives ; vérifier horaires, accès et tarifs auprès des lieux avant le départ.</p><a href="../">← Tous nos guides du Japon</a></footer>'
    page = TEMPLATE
    page = re.sub(r'<meta name="description"[^>]*>',f'<meta name="description" content="{e(g["name"],quote=True)} : nos repères, hébergements notés, carte et conseils pour préparer l’étape.">',page)
    page = re.sub(r'<title>.*?</title>',f'<title>{e(g["name"])} — notre petit guide</title>',page)
    page = page.replace('FLAG CITY', '🇯🇵 '+e(g['name']))
    page = re.sub(r'(<nav class="nav"[^>]*>).*?(</nav>)',lambda m:m[1]+nav+m[2],page,flags=re.S)
    page = re.sub(r'(<div class="content">).*?(\n  </div>\n\n  <aside)',lambda m:m[1]+body+m[2],page,flags=re.S)
    page = page.replace('<strong>CITY</strong><span>Les lieux du guide</span>',f'<strong>{e(g["name"])}</strong><span>{"Les repères du guide" if any("lat" in p for p in all_places) else "Le secteur · adresses à localiser"}</span>')
    pins = [{k:p[k] for k in ['id','name','lat','lng','emoji','kind','mapsUrl'] if k in p} for p in all_places if 'lat' in p]
    # Keep search links tied to the real place names, especially for regional pages.
    for pin,p in zip(pins,[p for p in all_places if 'lat' in p]): pin.setdefault('mapsUrl',map_url(p,g['name']))
    data = 'window.GUIDE_CENTER = '+json.dumps(g['center'])+';\nwindow.GUIDE_ZOOM = 12;\nwindow.GUIDE_PLACES = '+json.dumps(pins,ensure_ascii=False,indent=2)+';\nwindow.GUIDE_PHOTOS = {};'
    page = re.sub(r'window.GUIDE_CENTER = .*?window.GUIDE_PHOTOS = \{\};',lambda m:data,page,flags=re.S)
    # guide.js adds map searches to ordinary cards. Ambiguous names must stay unlinked.
    for p in all_places:
        if any(t in p['status'] for t in ['confirmer','préciser','identifier','choisir']):
            page = page.replace(f'id="{p["id"]}" data-place="{p["id"]}"',f'id="{p["id"]}" data-place="{p["id"]}" data-map-search="false"')
    if not pins:
        page = page.replace('<main class="layout">', '<main class="layout layout-text">')
        page = page.replace('<aside class="map-panel"', '<aside hidden class="map-panel"')
    path = ROOT/'japon'/g['slug']/'index.html'
    path.parent.mkdir(exist_ok=True)
    page = page.replace('</section><section', '</section>\n\n    <section').replace('</article><article', '</article>\n    <article')
    path.write_text(page+'\n')

REGIONS = [
    ('kanto','Kantō et Fuji · Tokyo et les détours',['tokyo','hakone','fujiyoshida','omiya','nasu']),
    ('tokai','Tōkai · thé, côte et Ghibli',['shizuoka','nagoya']),
    ('kansai','Kansai · villes, côte et bains',['kyoto','osaka','nara','himeji','sakai','arima-onsen','kinosaki-onsen','ine']),
    ('nagano','Nagano · les onsen et le Nakasendō',['shibu-onsen','bessho-onsen','nozawa-onsen','nakasendo']),
    ('gunma','Gunma · les parenthèses thermales',['kusatsu-onsen','shima-onsen','hoshi-onsen']),
    ('hokuriku','Hokuriku et Gifu · jardins et villages',['kanazawa','takayama','shirakawa-go']),
    ('tohoku','Tōhoku et Niigata · ryokans et grands détours',['fukushima','aizu','ginzan-onsen','kamasaki-onsen','minamisanriku','sukayu-onsen','murakami']),
    ('setouchi','Chūgoku et Shikoku · d’une rive à l’autre',['okayama','kurashiki','hiroshima','miyajima','matsuyama']),
    ('kyushu','Kyūshū · les bains et la forêt',['beppu','yufuin','kurokawa-onsen','takachiho','kagoshima','yakushima']),
    ('hokkaido','Hokkaidō · choisir sa boucle',['hokkaido'])]
BY_SLUG = {g['slug']:g for g in GUIDES}
BY_SLUG['kyoto'] = dict(name='Kyoto',duration='2 à 6 jours',intro='Le guide de référence : quartiers, temples, expériences, bonnes adresses et retours personnels.',region='Kansai')
hub = ROOT/'japon/index.html'
old = hub.read_text()
if '<!-- JAPAN_DESTINATIONS -->' in old:
    prefix = old.split('<!-- JAPAN_DESTINATIONS -->')[0]
else:
    prefix = old[:old.index('  <section class="section">',old.index('</section>')+10)]
navigation = '<section class="section"><div class="section-head"><div class="section-kicker">Nos guides</div><h2>Villes & régions</h2><p class="section-intro">44 guides et premières pistes, regroupés pour construire son voyage. Kyoto garde ses retours détaillés ; les autres carnets s’enrichissent avec nos adresses et nos prochains avis.</p></div><div class="meta">'+''.join(f'<a class="pill" href="#{sid}">{e(title.split(" · ")[0])}</a>' for sid,title,_ in REGIONS)+'</div></section>'
sections = ''
for sid,title,slugs in REGIONS:
    cards=''
    for s in slugs:
        g=BY_SLUG[s]
        summary = g['intro'].split('. ')[0].rstrip('.')+'.'
        cards += f'<a class="card" href="{s}/"><div class="kicker">{e(g["region"])}</div><h3>{e(g["name"])}</h3><p>{e(summary)}</p><span class="duration">{e(g["duration"])}</span><span class="cta">{"Ouvrir le guide" if s=="kyoto" else "Ouvrir le carnet"} →</span></a>'
    sections+=f'<section class="section" id="{sid}"><div class="section-head"><h2>{e(title)}</h2></div><div class="grid three">{cards}</div></section>\n\n'
hub.write_text(prefix+'<!-- JAPAN_DESTINATIONS -->\n'+navigation+sections+'<footer class="footer">Une collection personnelle qui se complète voyage après voyage. <a href="../">← Tous les pays</a></footer>\n</main>\n</body></html>\n')
print(f'Rendered {len(GUIDES)} destination pages and the Japan hub.')
