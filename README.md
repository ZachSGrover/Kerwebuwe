# Deidesheimer Kerwebuwe – Website

Website der Deidesheimer Kerwebuwe (seit 1972). Reines HTML/CSS/JavaScript – kein Build-Schritt nötig.

## Aufbau

```
index.html                 Seitenstruktur (alle Abschnitte)
css/style.css              Grundlayout und Abschnitte
css/enhancements.css       Animationen, Chronik-Filter, PDF-Ansicht, Kerwerede-Fenster
css/theme.css              Dunkles Design (Variante 3 · Immersiv)
js/main.js                 Menü, Kerwerede-Fenster, aktiver Menüpunkt
js/enhancements.js         Instagram-Icon, PDF-Vorschau, Chronik-Filter, Scroll-Effekte, Swipe-to-close
js/reden.js                Texte der Kerwereden + Verweise auf die PDFs
assets/img/                Bilder (Logo, Hero, Galerie, Hintergründe)
assets/kerwereden/         Original-Kerwereden als PDF (kerwerede-JAHR.pdf)
kerwereden/                Kerwereden als eigene Textseiten (generiert, nicht von Hand bearbeiten)
css/rede.css               Design der Kerwereden-Seiten
robots.txt, sitemap.xml    für Suchmaschinen
llms.txt                   Kurzfassung der Website für KI-Assistenten (generiert)
impressum.html             Impressum – Name und Anschrift der verantwortlichen Person hier eintragen
datenschutz.html           Datenschutzerklärung (Abschnitt 2 „Hosting“ bei Anbieterwechsel anpassen)
css/fonts.css, assets/fonts/  Schriften lokal (keine Verbindung zu Google)
vendor/pdfjs/              PDF-Anzeige (pdf.js 3.11.174, Apache 2.0) lokal
tools/build_seo.py         erzeugt kerwereden/, sitemap.xml und llms.txt
tools/llms-template.md     Vorlage für llms.txt (Fakten hier pflegen)
```

## Auffindbarkeit für Google & KI

- Hauptüberschrift, Bildbeschreibungen, strukturierte Daten (schema.org) und Vorschau-Tags für Social Media sind in `index.html` hinterlegt.
- Jede Kerwerede hat eine eigene Textseite unter `kerwereden/JAHR.html`, die auch ohne JavaScript lesbar ist.
- Nach Änderungen an `js/reden.js` oder `tools/llms-template.md`: `python3 tools/build_seo.py` ausführen.
- Bei einer eigenen Domain die Adresse `https://zachsgrover.github.io/Kerwebuwe/` ersetzen in:
  `tools/build_seo.py` (SITE), `index.html` (canonical, og:, JSON-LD) und `robots.txt` – danach das Skript ausführen.

## Ansehen

- **Online:** über GitHub Pages (Settings → Pages → Branch `main`, Ordner `/ (root)`) unter
  https://zachsgrover.github.io/Kerwebuwe/
- **Lokal:** `index.html` im Browser öffnen. Für die PDF-Vorschau im Kerwerede-Fenster einen kleinen
  Webserver starten (Browser blockieren das Laden von PDFs direkt aus Dateien):
  `python3 -m http.server` im Projektordner, dann http://localhost:8000 öffnen.

## Neue Kerwerede hinzufügen

1. PDF als `assets/kerwereden/kerwerede-JAHR.pdf` ablegen.
2. In `js/reden.js` den Text unter `REDEN` und den Pfad unter `RPDF` ergänzen.
3. In `index.html` beim Jahres-Button die Klasse `has` setzen.
4. `python3 tools/build_seo.py` ausführen (erzeugt die Textseite und aktualisiert Sitemap und llms.txt).

## Arbeitsweise

`main` ist der stabile Stand. Verbesserungen werden in eigenen Branches entwickelt und per Pull Request in `main` übernommen.

## Datenschutz & Recht

- Die Website lädt nichts von fremden Servern (keine Google Fonts, kein CDN, keine Cookies, kein Tracking).
- Vor der Veröffentlichung: in `impressum.html` die Platzhalter `[Vor- und Nachname]` und `[Straße und Hausnummer]` ersetzen.
- Wird die Website woanders als bei GitHub Pages gehostet, Abschnitt 2 in `datenschutz.html` anpassen.
