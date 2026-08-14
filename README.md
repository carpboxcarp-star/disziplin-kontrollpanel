# Disziplin-Kontrollpanel

Next.js (App Router) + Supabase Web-App für tägliches Habit-, Fitness-, Business- und
Finanz-Tracking. Läuft dauerhaft im Chrome-Kiosk-Modus auf einem Wandgerät und synchron
per Login auf dem Handy — beide Geräte teilen denselben Supabase-Account und sehen
Änderungen in Echtzeit.

## 1. Supabase-Projekt einrichten

1. Auf [supabase.com](https://supabase.com) einloggen/registrieren und **New Project**
   anlegen (Region z.B. Frankfurt für niedrige Latenz aus Deutschland).
2. Warten, bis das Projekt bereitsteht (ca. 2 Minuten).
3. **Database → Extensions**: `pg_cron` aktivieren (suchen, Toggle einschalten). Das wird
   für den automatischen Mitternachts-Abschluss der Tage benötigt.
4. **SQL Editor → New query**: den kompletten Inhalt von [`supabase/schema.sql`](./supabase/schema.sql)
   einfügen und ausführen (**Run**). Das legt alle Tabellen, Policies, Funktionen, den
   `pg_cron`-Job und den festen Push/Pull/Legs-Übungsplan an.
   - Falls der `pg_cron`-Teil am Ende einen Fehler wirft ("extension not found"), Schritt 3
     nochmal prüfen und nur den `select cron.schedule(...)`-Block am Ende erneut ausführen.
   - **Bereits ein Projekt eingerichtet?** Zusätzlich einmalig alle Dateien in
     [`supabase/migrations/`](./supabase/migrations/) der Reihe nach im SQL-Editor ausführen
     (`0001_...` automatischer Gamble-Ersparnis-Abzug + automatisches Abhaken des
     Protein-Habits, `0002_...` PIN-geschützte Tagesentsperrung, `0003_...` Umbenennung
     "Kein Gamblen" → "Daily Check" + Rest-Day-Funktion, `0004_...` manuelles Vor-/
     Zurückschalten des Trainingstags — in einem frischen `schema.sql`-Lauf ist das alles
     bereits enthalten).
5. **Authentication → Sign In / Providers → Email**: sicherstellen, dass Email-Login aktiv ist
   (deckt sowohl Magic Link als auch Email/Passwort ab — beide Login-Arten stehen auf der
   `/login`-Seite als Umschalter zur Verfügung). Unter **Authentication → Email Templates**
   können der Magic-Link-Text sowie die "Reset Password"-Mail angepasst werden.
6. **Authentication → URL Configuration**:
   - *Site URL*: die spätere Vercel-URL eintragen (z.B. `https://disziplin-kontrollpanel.vercel.app`)
   - *Redirect URLs*: zusätzlich `http://localhost:3000/auth/callback` für lokale Entwicklung
     sowie `https://<deine-vercel-url>/auth/callback` eintragen.
7. **Project Settings → API**: `Project URL` und `anon public` Key kopieren — werden im
   nächsten Schritt gebraucht.

## 2. Lokale Einrichtung

```bash
npm install
cp .env.example .env.local
```

`.env.local` ausfüllen:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Dann lokal starten:

```bash
npm run dev
```

Unter `http://localhost:3000` öffnen, mit der eigenen E-Mail-Adresse per Magic Link einloggen
(Link kommt per Mail — beim ersten Login werden automatisch Standard-Habits, Punktwerte und
ein leerer Stundenplan für den Account angelegt).

## 3. Deployment auf Vercel

1. Repository zu GitHub pushen (oder direkt via `vercel` CLI deployen).
2. Auf [vercel.com](https://vercel.com) **New Project** → Repository auswählen.
3. Environment Variables setzen (gleiche Werte wie in `.env.local`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deployen. Danach in Supabase unter **Authentication → URL Configuration** die
   *Site URL* und *Redirect URLs* auf die finale Vercel-Domain aktualisieren (siehe Schritt 1.6).

Sowohl das Wandgerät (Kiosk) als auch das Handy rufen anschließend dieselbe Vercel-URL auf
und loggen sich mit demselben Account ein — alle Daten synchronisieren sich in Echtzeit über
Supabase Realtime.

## 4. Windows-Kiosk-Setup (Wandgerät)

### Chrome im Kiosk-Modus starten

Verknüpfung anlegen, die Chrome im Vollbild-Kiosk-Modus direkt mit der App-URL startet:

1. Rechtsklick auf dem Desktop → **Neu → Verknüpfung**
2. Als Pfad eingeben (Pfad zu `chrome.exe` ggf. anpassen):

   ```
   "C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk "https://<deine-vercel-url>" --kiosk-printing --noerrdialogs --disable-session-crashed-bubble --disable-infobars
   ```

3. Verknüpfung benennen, z.B. `Disziplin-Kontrollpanel`.
4. Mit dem Touchscreen einmal einloggen (Magic Link auf dem Handy öffnen, das leitet dann im
   Browser auf dem Handy weiter — der Login-Status wird als Cookie/Session auf dem Kiosk-Gerät
   selbst benötigt, d.h. die Magic-Link-Mail auf dem **Kiosk-Gerät** öffnen, z.B. indem man sich
   dort kurz aus dem Kiosk-Modus per `Alt+F4` herausbewegt oder die Mail über ein zweites Gerät
   im selben Chrome-Profil synchronisiert). Danach bleibt die Session dauerhaft aktiv.
   Kiosk-Modus beenden: `Alt+F4`.

### Autostart einrichten

1. `Win + R` → `shell:startup` → Enter (öffnet den Autostart-Ordner des aktuellen Nutzers).
2. Die eben erstellte Verknüpfung per Kopieren/Einfügen dort hineinlegen.
3. Neustart testen — Chrome sollte automatisch im Kiosk-Modus mit der App starten.

### Energieoptionen: Bildschirm nie ausschalten

1. **Einstellungen → System → Netzbetrieb & Akku** (oder `powercfg.cpl` über `Win + R`).
2. **Bildschirm ausschalten** und **Energiesparmodus** jeweils auf **Nie** setzen
   (sowohl im Akku- als auch im Netzbetrieb, falls vorhanden).
3. Optional zusätzlich in der Windows-Anzeigesperre unter **Einstellungen → Konten →
   Anmeldeoptionen** die Bildschirmsperre deaktivieren.

Die App setzt zusätzlich beim Laden `navigator.wakeLock` (falls vom Browser unterstützt) als
zweite Absicherung gegen das Einschlafen des Bildschirms während des Kiosk-Betriebs.

## Technischer Überblick

- **Frontend**: Next.js 16 (App Router, TypeScript, Tailwind CSS v4), Google Fonts
  IBM Plex Mono + Barlow Condensed.
- **Backend**: Supabase (Postgres, Auth mit Magic Link, Realtime).
- **Sync**: `lib/context/DashboardContext.tsx` lädt alle Tabellen des eingeloggten Users und
  hält sie per Supabase Realtime (`postgres_changes`) synchron — jede Änderung auf einem
  Gerät erscheint sofort auf dem anderen.
- **Mitternachts-Reset**: Ein `pg_cron`-Job (`supabase/schema.sql`, alle 15 Minuten) schließt
  automatisch abgelaufene, nicht manuell abgeschlossene Tage ab (Streak-Auswertung inklusive)
  — Zeitzone `Europe/Berlin`, DST-sicher. Der "Tag abschließen"-Button ruft dieselbe Logik
  manuell per RPC (`close_day`) auf.
- **Push/Pull/Legs-Rotation**: rotiert nicht nach Kalendertag, sondern nach dem zuletzt
  abgeschlossenen Trainingstag (`split_rotation_state`), damit Ruhetage den Rhythmus nicht
  verschieben. Wird automatisch vorangetrieben, sobald "Training absolviert" auf dem
  Heute-Tab abgehakt wird.

## Datenbankschema

Das komplette SQL-Schema (Tabellen, Row-Level-Security-Policies, Funktionen, Trigger,
`pg_cron`-Job, Seed-Daten für den Trainingsplan) liegt in [`supabase/schema.sql`](./supabase/schema.sql)
und ist einmalig im Supabase SQL-Editor auszuführen (siehe Schritt 1.4).
