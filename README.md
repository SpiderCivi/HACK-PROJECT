# HACK/PROJECT

**Threat intelligence quotidiana.** Ogni giorno un attacco reale e documentato: origine, catena d'attacco mappata su [MITRE ATT&CK](https://attack.mitre.org/), detection e rimedi.

🔗 **[Leggi il sito →](https://spidercivi.github.io/HACK-PROJECT/)**

---

## Cos'è

Un sito statico generato da file Markdown. Ogni dossier analizza un attacco **realmente avvenuto e pubblicamente documentato**, partendo da fonti primarie (advisory CISA/FBI, report vendor, ricerca open source).

Ogni dossier è pubblicato anche come video verticale su TikTok.

### Linea editoriale

Il contenuto è **difensivo ed educativo**. Descriviamo tattiche e tecniche così come riportate da agenzie e ricercatori — lo stesso livello di dettaglio di un advisory CISA o di un report Talos. Non pubblichiamo codice exploit funzionante, malware, né payload riutilizzabili.

La catena d'attacco raccontata bene insegna più del payload.

---

## Struttura

```
content/articles/     dossier in Markdown (frontmatter YAML + corpo)
scripts/build.py      generatore statico
scripts/daily.py      routine quotidiana (articolo → build → push → video)
site/                 output generato — NON modificare a mano
  index.html
  a/<slug>.html
  data/articles.json
  assets/css|js
```

## Sviluppo locale

```bash
pip install -r requirements.txt
python3 scripts/build.py
python3 -m http.server -d site 8000   # http://localhost:8000
```

## Aggiungere un dossier

Crea `content/articles/AAAA-MM-GG-slug.md`:

```markdown
---
title: "Titolo del dossier"
slug: "slug-url"
date: 2026-07-15
severity: critical | high | medium | low
actor: "Nome gruppo"
aliases: ["alias noti"]
first_seen: "Mese Anno"
targets: ["Regione"]
sectors: ["Settore"]
summary: >-
  Sommario in 2-3 righe.
mitre:
  - id: T1189
    name: "Drive-by Compromise"
    tactic: "Initial Access"
sources:
  - title: "Fonte primaria"
    url: "https://..."
---

## L'origine
## La catena d'attacco
## Detection
## Rimedi
```

Poi `python3 scripts/build.py`. Il campo `slug` determina l'URL; `severity` e `mitre` alimentano scheda attore e chip ATT&CK.

## Credenziali

I segreti stanno in `.env` (gitignorato). Vedi `.env.example` per i campi richiesti.

**Mai committare `.env`.** Se una chiave finisce in un commit, va considerata compromessa e ruotata — riscrivere la history non basta, il valore è già stato distribuito.

## Stack

Nessun framework, nessun build step JS. Python + Markdown → HTML statico. Deploy su GitHub Pages.

---

## Legale

MITRE ATT&CK® è un marchio registrato di The MITRE Corporation. Questo progetto non è affiliato né sponsorizzato da MITRE, CISA o dai vendor citati.

Contenuto pubblicato a scopo informativo e difensivo.
