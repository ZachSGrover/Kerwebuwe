#!/usr/bin/env python3
"""Erzeugt die suchmaschinen- und KI-lesbaren Dateien der Website.

Aus js/reden.js werden gebaut:
  kerwereden/index.html     Übersicht aller Kerwereden
  kerwereden/JAHR.html      eine Seite pro Rede (reiner Text, ohne JavaScript lesbar)
  sitemap.xml               Liste aller Seiten für Suchmaschinen
  llms.txt                  Kurzfassung der Website für KI-Assistenten

Aufruf (im Projektordner):  python3 tools/build_seo.py
Nach jeder neuen Kerwerede oder einer neuen Domain erneut ausführen.
"""
import datetime
import html
import json
import os
import re

# Adresse der Website – bei eigener Domain hier ändern (mit / am Ende)
# und denselben Wert in index.html (canonical, og:, JSON-LD) und robots.txt eintragen.
SITE = "https://zachsgrover.github.io/Kerwebuwe/"

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def load_reden():
    src = open(os.path.join(ROOT, "js", "reden.js"), encoding="utf8").read()
    reden = json.loads(re.search(r"const REDEN = (\{.*?\n\});", src, re.S).group(1))
    rpdf = json.loads(re.search(r"const RPDF = (\{.*?\n\});", src, re.S).group(1))
    return reden, rpdf


def blocks_of(text):
    text = text.replace("\f", "\n\n").replace("\r", "")
    for b in re.split(r"\n[ \t]*\n", text):
        lines = [l.strip() for l in b.split("\n") if l.strip()]
        if lines:
            yield lines


def stanzas(text):
    """Rede als HTML: Vorwort als Fließtext, danach die Rede in Versen.

    Jede Rede beginnt mit einem hochdeutschen Vorwort (Zeilenumbrüche stammen nur
    vom PDF-Layout -> Absätze zusammenfügen). Ab "Oileidung" folgt die gereimte
    Rede -> Zeilenumbrüche der Verse bleiben erhalten.
    """
    m = re.search(r"^\s*Oileidung\s*$", text, re.M)
    vorwort, rede = (text[:m.start()], text[m.start():]) if m else ("", text)
    out = []
    for lines in blocks_of(vorwort):
        if sum(len(l) for l in lines) / len(lines) > 45:
            out.append('<p class="prosa">' + html.escape(" ".join(lines)) + "</p>")
        else:
            out.append('<p class="prosa">' + "<br>\n".join(html.escape(l) for l in lines) + "</p>")
    if m:
        out.append('<hr class="rsep">')
    for lines in blocks_of(rede):
        if len(lines) == 1 and len(lines[0]) < 40 and not re.search(r"[.,!?;:]$", lines[0]):
            out.append('<h2 class="rh2">' + html.escape(lines[0]) + "</h2>")
        else:
            out.append('<p class="vers">' + "<br>\n".join(html.escape(l) for l in lines) + "</p>")
    return "\n".join(out)


def page(title, description, canonical, body, depth=1, extra_head=""):
    up = "../" * depth
    return f"""<!DOCTYPE html>
<html lang="de"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(title)}</title>
<meta name="description" content="{html.escape(description)}">
<link rel="canonical" href="{canonical}">
<meta name="theme-color" content="#0E2C54">
<meta property="og:type" content="article">
<meta property="og:locale" content="de_DE">
<meta property="og:site_name" content="Deidesheimer Kerwebuwe">
<meta property="og:title" content="{html.escape(title)}">
<meta property="og:description" content="{html.escape(description)}">
<meta property="og:url" content="{canonical}">
<meta property="og:image" content="{SITE}assets/img/hero.jpg">
<link rel="icon" href="{up}assets/img/favicon.png">
<link rel="stylesheet" href="{up}css/fonts.css">
<link rel="stylesheet" href="{up}css/rede.css">
{extra_head}</head>
<body>
<header class="rh"><a class="rbrand" href="{up}"><img src="{up}assets/img/logo.png" alt="Wappen der Deidesheimer Kerwebuwe"><span>Deidesheimer Kerwebuwe</span></a></header>
<main class="rmain">
{body}
</main>
<footer class="rf"><a href="{up}">Deidesheimer Kerwebuwe · Startseite</a> · <a href="{up}#kontakt">Kontakt</a> · <a href="https://instagram.com/deidesheimer_kerwebuwe">Instagram</a></footer>
</body></html>
"""


def build():
    reden, rpdf = load_reden()
    years = sorted(reden, key=int)
    os.makedirs(os.path.join(ROOT, "kerwereden"), exist_ok=True)

    for i, y in enumerate(years):
        prev_y = years[i - 1] if i > 0 else None
        next_y = years[i + 1] if i + 1 < len(years) else None
        url = f"{SITE}kerwereden/{y}.html"
        pdf = rpdf.get(y)
        nav = '<nav class="rnav">' + (
            f'<a href="{prev_y}.html">← Kerwerede {prev_y}</a>' if prev_y else "<span></span>") + \
            '<a href="./">Alle Jahrgänge</a>' + (
            f'<a href="{next_y}.html">Kerwerede {next_y} →</a>' if next_y else "<span></span>") + "</nav>"
        ld = {"@context": "https://schema.org", "@type": "CreativeWork",
              "name": f"Deidesheimer Kerwerede {y}", "inLanguage": "de", "datePublished": y,
              "genre": "Kerwerede", "url": url,
              "about": "Deidesheimer Weinkerwe",
              "author": {"@type": "Organization", "name": "Deidesheimer Kerwebuwe", "url": SITE},
              "isPartOf": {"@type": "CollectionPage", "name": "Die Kerwereden der Deidesheimer Kerwebuwe",
                           "url": SITE + "kerwereden/"}}
        if pdf:
            ld["associatedMedia"] = {"@type": "MediaObject", "encodingFormat": "application/pdf",
                                     "contentUrl": SITE + pdf}
        body = f"""<div class="reye">Kerwerede · Deidesheimer Weinkerwe</div>
<h1>Deidesheimer Kerwerede {y}</h1>
<p class="rlead">Die Kerwerede {y} der Deidesheimer Kerwebuwe, gehalten zur Eröffnung der Deidesheimer Weinkerwe.</p>
{f'<a class="rpdf" href="../{pdf}" download="Kerwerede_{y}.pdf">Original als PDF herunterladen ↓</a>' if pdf else ''}
{nav}
<article class="rtext">
{stanzas(reden[y])}
</article>
{nav}"""
        extra = '<script type="application/ld+json">\n' + json.dumps(ld, ensure_ascii=False, indent=1) + "\n</script>\n"
        open(os.path.join(ROOT, "kerwereden", f"{y}.html"), "w", encoding="utf8").write(
            page(f"Kerwerede {y} · Deidesheimer Kerwebuwe",
                 f"Der vollständige Text der Deidesheimer Kerwerede {y}, gehalten von den Deidesheimer Kerwebuwe zur Eröffnung der Weinkerwe in Deidesheim.",
                 url, body, extra_head=extra))

    items = "\n".join(
        f'<li><a href="{y}.html"><span class="ry">{y}</span><span>Kerwerede {y}</span></a></li>'
        for y in reversed(years))
    body = f"""<div class="reye">Archiv</div>
<h1>Die Kerwereden der Deidesheimer Kerwebuwe</h1>
<p class="rlead">Jahr für Jahr halten die Deidesheimer Kerwebuwe zur Eröffnung der Deidesheimer Weinkerwe die Kerwerede –
ein gereimter Rückblick auf das Jahr in Deidesheim. Hier stehen alle bisher erfassten Reden im vollen Wortlaut.</p>
<ul class="rlist">
{items}
</ul>"""
    open(os.path.join(ROOT, "kerwereden", "index.html"), "w", encoding="utf8").write(
        page("Kerwereden · Deidesheimer Kerwebuwe",
             "Alle Kerwereden der Deidesheimer Kerwebuwe im vollen Wortlaut – gehalten zur Eröffnung der Deidesheimer Weinkerwe.",
             SITE + "kerwereden/", body))

    today = datetime.date.today().isoformat()
    urls = [SITE, SITE + "kerwereden/"] + [f"{SITE}kerwereden/{y}.html" for y in reversed(years)]
    sm = ['<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    sm += [f"  <url><loc>{u}</loc><lastmod>{today}</lastmod></url>" for u in urls]
    sm.append("</urlset>")
    open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf8").write("\n".join(sm) + "\n")

    llms = open(os.path.join(ROOT, "tools", "llms-template.md"), encoding="utf8").read()
    llms = llms.replace("{SITE}", SITE).replace("{REDEN}", "\n".join(
        f"- [Kerwerede {y}]({SITE}kerwereden/{y}.html)" for y in reversed(years)))
    open(os.path.join(ROOT, "llms.txt"), "w", encoding="utf8").write(llms)
    print(f"ok: {len(years)} Kerwereden, {len(urls)} URLs in sitemap.xml, llms.txt")


if __name__ == "__main__":
    build()
