# Kanzlei Celik — Website (v2 · Multi-Page)

Multi-Page-Website für die Rechtsanwaltskanzlei Celik (Heilbronn · Siegen).
Schwerpunkte: Unternehmenssteuerrecht und Insolvenzrecht.

## Struktur

```
celik-website/
├── index.html                       # Startseite (Hero + Schwerpunkte + Mandant + Standorte-Vorschau)
├── unternehmenssteuerrecht.html     # Schwerpunkt 1 (6 Leistungsfelder, Arbeitsweise, Hinweis)
├── insolvenzrecht.html              # Schwerpunkt 2 (6 Leistungsfelder, Zeitachse, Hinweis)
├── kanzlei.html                     # Über die Kanzlei + Philosophie + Standort-Texte
├── team.html                        # 9 Teammitglieder
├── kontakt.html                     # Beide Standorte mit OpenStreetMap, Kontaktformular
├── impressum.html                   # § 5 TMG, mit Platzhaltern
├── datenschutz.html                 # Standard-Gerüst, mit Platzhaltern + TODO-Hinweis
├── assets/
│   ├── style.css                    # Komplettes Design-System
│   ├── script.js                    # Cursor, Reveal, Parallax, Dropdown, Mobile-Slide-In
│   ├── seyhmus-hero.jpg             # Hero-Portrait (1274×1356)
│   ├── logo.png                     # Original-Logo
│   └── team/                        # 9 Avatare (150×150)
│       ├── seyhmus.jpg, guenes.jpg, arina.jpg, valentina.jpg, ljudmila.jpg,
│       ├── laura.jpg, krystyna.jpg, melina.jpg, berfin.jpg
└── README.md
```

## Lokal öffnen

```bash
open index.html
```

Kein Build-Step. Reines HTML/CSS/JS. Fonts werden von Google Fonts geladen.

---

## Was der Kunde noch ergänzen muss — `[KUNDE FÜLLT EIN]`-Markierungen

Im HTML mit gelb-umrahmtem Badge sichtbar markiert. Schnell finden mit:

```bash
grep -rn "KUNDE FÜLLT EIN" *.html
```

**Inhaltliche Lücken:**

| Seite                | Was fehlt                                                              |
|----------------------|------------------------------------------------------------------------|
| `kanzlei.html`       | Gründungsjahr, Meilensteine, Auszeichnungen, Lehrtätigkeit             |
| `team.html`          | Werdegang Seyhmus Celik (Studium, Zulassungsjahr, Stationen)           |
| `team.html`          | Werdegang Selahattin Eyyüp Günes (Studium, Zulassungsjahr, Stationen)  |
| `impressum.html`     | Zuständige Rechtsanwaltskammer (vermutlich Stuttgart oder Hamm)        |
| `impressum.html`     | Berufshaftpflichtversicherung (Name, Anschrift, Geltungsraum)          |
| `datenschutz.html`   | Server-Logfile-Speicherdauer, Hosting-Anbieter, Aufsichtsbehörde, etc. |

---

## Was vor Live-Schaltung rechtlich geprüft werden muss

1. **Datenschutzerklärung** — der aktuelle Text ist ein Standard-Gerüst. Anwaltskanzleien haben besondere Anforderungen (Mandatsdaten, Schweigepflicht, Auftragsverarbeitung des Hosters). Empfehlung: durch eRecht24-Generator oder einen IT-Anwalt prüfen lassen.
2. **Impressum** — auf Vollständigkeit prüfen, insbesondere Berufshaftpflichtversicherung und Kammerzuordnung.
3. **Mandanten-Upload-Formular** — derzeit Frontend-Mock. Bevor live gehen: Backend-Endpoint anlegen (z.B. Netlify Forms mit File-Uploads, oder eigener PHP/Node-Endpoint mit verschlüsselter Speicherung). Datenschutzrechtlich besonders sensibel.
4. **Kontaktformular** — derselbe Punkt. Aktuell zeigt es nur einen Erfolgs-Toast.
5. **OpenStreetMap-Embeds** — datenschutzfreundlich (kein Cookie-Banner nötig). Falls Google Maps gewünscht: Cookie-Consent-Banner notwendig.

---

## Deployment auf Netlify

### Variante 1 — Drag-and-Drop (am einfachsten)

1. Auf https://app.netlify.com/drop gehen
2. Den kompletten Ordner `celik-website/` ins Browserfenster ziehen
3. Netlify gibt eine URL aus (`xyz.netlify.app`)
4. Custom Domain `steuer-recht-celik.de` unter Settings → Domain management hinzufügen
5. DNS auf Netlify umstellen (oder CNAME setzen, je nach DNS-Provider)

### Variante 2 — via CLI

```bash
npm i -g netlify-cli
cd ~/Desktop/celik-website
netlify deploy --prod --dir .
```

(Vorher `netlify login` falls noch nicht authentifiziert.)

### Variante 3 — Git-Push (für späteren Workflow)

Repo auf GitHub anlegen, im Netlify-Dashboard mit Repo verbinden, automatisches Deploy bei jedem Push.

---

## Was nach Deploy zu machen ist

1. **Backup der alten Site** (steuer-recht-celik.de) per FTP ziehen, bevor du die Domain umstellst
2. **Formulare verbinden** — entweder Netlify Forms aktivieren (in HTML `data-netlify="true"` ergänzen, dann läuft Submit gegen Netlify-Backend) oder eigenen Endpoint
3. **Datenschutz-Anpassungen**, sobald Hosting-Anbieter klar (steht ja erst nach Deploy fest)
4. **Suchmaschinen-Indexierung** — `robots.txt` und `sitemap.xml` ergänzen (kann auch nachgereicht werden)

---

## Browser-Support

Chrome, Safari, Firefox (jeweils aktuelle Versionen). `backdrop-filter` mit `-webkit-` Prefix für Safari. Print-Stylesheet vorhanden.

## Custom-Cursor

Aktiv ab 1024px Breite und nur mit Pointer-Geräten (Maus/Trackpad). Auf Touch-Geräten automatisch deaktiviert.
