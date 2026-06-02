# Downloads · Vorlagen

Hier liegen alle PDFs, die auf `downloads.html` verlinkt sind.

## Aktuelle Vorlagen (Stand: 2026-04-29)

| Dateiname                                           | Kategorie | Anzeige-Name                          |
| --------------------------------------------------- | --------- | ------------------------------------- |
| `kassenaufzeichnung.pdf`                            | FIBU      | Kassenaufzeichnung                    |
| `eigenbeleg.pdf`                                    | FIBU      | Eigenbeleg                            |
| `quittung.pdf`                                      | FIBU      | Quittung                              |
| `stundenzettel.pdf`                                 | LOBU      | Stundenzettel                         |
| `personalfragebogen.pdf`                            | LOBU      | Personalfragebogen                    |
| `antrag-rentenversicherungspflicht-befreiung.pdf`   | LOBU      | Antrag Befreiung Rentenversicherung   |
| `checkliste-einkommensteuererklaerung.pdf`          | ESt       | Checkliste Einkommensteuererklärung   |

## Neue Vorlage hinzufügen

1. **PDF hier ablegen** mit klarem Dateinamen
   – kleinschreibung, Bindestriche statt Leerzeichen, keine Umlaute
   – Beispiel: `vollmacht-steuerangelegenheiten.pdf`

2. **`downloads.html` editieren** (im Repo-Root):
   – einen passenden `<article class="download-card reveal">`-Block
     im richtigen Abschnitt kopieren
   – in der Kopie ersetzen:
     - `data-file="…"`
     - `<span class="download-card__label">…</span>` (Kategorie-Tag)
     - `<h3 class="download-card__title">…</h3>`
     - `<p class="download-card__desc">…</p>`
     - `<span class="download-card__meta">…</span>`
     - im `<a href="assets/downloads/…">` den neuen Dateinamen einsetzen

3. **Datei speichern + Push** (oder zur Agentur senden) — Netlify
   deployed dann automatisch in ~90 Sek.
