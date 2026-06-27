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
3. **Kontakt-/Mandantenformular** — verschickt jede Anfrage **direkt per E-Mail** an `kanzlei@steuer-recht-celik.de` über eine **eigene Serverless-Funktion** (`netlify/functions/contact.js`) mit SMTP-Versand über das Kanzlei-Postfach. **Kein Netlify Forms, kein Drittanbieter.** Hochgeladene Dokumente werden als echte E-Mail-Anhänge mitgeschickt. Antwort-an ist die E-Mail des Absenders. Datenschutzerklärung sollte den Hoster (Netlify) als Auftragsverarbeiter nennen.
5. **OpenStreetMap-Embeds** — datenschutzfreundlich (kein Cookie-Banner nötig). Falls Google Maps gewünscht: Cookie-Consent-Banner notwendig.

---

## Deployment auf Netlify (mit Mail-Funktion)

Das Kontaktformular nutzt eine **Serverless-Funktion** (`netlify/functions/contact.js`).
Funktionen brauchen einen Build/Bundling-Schritt — **reines Drag-and-Drop reicht NICHT**.
Empfohlen: **GitHub + Netlify** (wie dnmarketing.de) mit automatischem Deploy.

### Schritt 1 — Repo zu GitHub
```bash
git add -A && git commit -m "Kontaktformular: SMTP-Mailversand via Netlify-Funktion"
git push    # in ein GitHub-Repo
```

### Schritt 2 — Netlify mit dem Repo verbinden
Netlify → **Add new project → Import from GitHub** → das Repo wählen.
Build-Einstellungen (kommen automatisch aus `netlify.toml`):
- **Build command:** *(leer)*
- **Publish directory:** `.`
- **Functions directory:** `netlify/functions`

Netlify installiert dann automatisch die npm-Abhängigkeiten (nodemailer, busboy)
und bundlet daraus die Funktion.

### Schritt 3 — SMTP-Zugangsdaten als Environment-Variablen setzen (PFLICHT)
Netlify → Site → **Project configuration → Environment variables** → folgende anlegen
(Werte aus dem Strato-Postfach, **niemals in den Code committen**):

| Variable    | Wert (Beispiel Strato)                  |
|-------------|------------------------------------------|
| `SMTP_HOST` | `smtp.strato.de`                         |
| `SMTP_PORT` | `465`                                     |
| `SMTP_USER` | `kanzlei@steuer-recht-celik.de`          |
| `SMTP_PASS` | *(Passwort des Postfachs)*                |
| `MAIL_TO`   | `kanzlei@steuer-recht-celik.de` (optional)|
| `MAIL_CC`   | `contact@dnmarketing.de` (optional)       |

Nach dem Setzen einmal **neu deployen** (Deploys → Trigger deploy), damit die
Variablen greifen.

### Schritt 4 — Testen
Formular auf der `*.netlify.app`-URL ausfüllen (inkl. Datei) und absenden →
Weiterleitung auf `danke.html` + Mail im Kanzlei-Postfach.

### Lokal testen (optional)
```bash
npm install
npm i -g netlify-cli   # einmalig
netlify dev            # startet Seite + Funktion lokal, .env für SMTP_* nutzen
```

---

## Was nach Deploy zu machen ist

1. **Backup der alten Site** (steuer-recht-celik.de) per FTP von Strato ziehen, bevor du die Domain umstellst
2. **SMTP-Env-Variablen gesetzt?** (siehe oben, Schritt 3) — sonst kommt keine Mail an
3. **Domain umstellen:** in Netlify `steuer-recht-celik.de` als Custom Domain hinzufügen, im **Strato-DNS** A-Record `@` → `75.2.60.5` und CNAME `www` → `<site>.netlify.app`. **MX-Einträge (Postfach!) NICHT anfassen.**
4. **Datenschutz-Anpassungen** (Netlify als Auftragsverarbeiter nennen)
5. **Suchmaschinen-Indexierung** — `robots.txt` und `sitemap.xml` ergänzen (kann auch nachgereicht werden)

---

## Browser-Support

Chrome, Safari, Firefox (jeweils aktuelle Versionen). `backdrop-filter` mit `-webkit-` Prefix für Safari. Print-Stylesheet vorhanden.

## Custom-Cursor

Aktiv ab 1024px Breite und nur mit Pointer-Geräten (Maus/Trackpad). Auf Touch-Geräten automatisch deaktiviert.
