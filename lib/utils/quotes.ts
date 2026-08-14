const QUOTES: string[] = [
  "Disziplin ist die Brücke zwischen Zielen und Erfolg.",
  "Motivation bringt dich in Gang. Disziplin hält dich in Bewegung.",
  "Du wirst nicht jeden Tag motiviert sein — deshalb musst du diszipliniert sein.",
  "Der Schmerz der Disziplin wiegt weniger als der Schmerz des Bedauerns.",
  "Kleine tägliche Verbesserungen sind der Schlüssel zu langfristig überwältigenden Ergebnissen.",
  "Erfolg ist die Summe kleiner Anstrengungen, jeden Tag wiederholt.",
  "Was heute schwer ist, macht dich morgen stark.",
  "Du musst nicht großartig sein, um zu beginnen. Aber du musst beginnen, um großartig zu sein.",
  "Konsequenz schlägt Intensität — jeden Tag.",
  "Zeig auf, arbeite hart, bleib fokussiert. Der Rest ergibt sich.",
  "Champions werden gemacht, wenn niemand hinschaut.",
  "Dein Körper kann fast alles. Es ist dein Kopf, den du überzeugen musst.",
  "Kein Regen, keine Blumen.",
  "Die einzige schlechte Trainingseinheit ist die, die nicht stattfindet.",
  "Schmerz ist temporär. Aufgeben dauert für immer.",
  "Du bist stärker als jede Ausrede.",
  "Disziplin heißt, sich selbst zu wählen, was man wirklich will, statt was man jetzt will.",
  "Jeder Tag ist eine neue Chance, besser zu werden als gestern.",
  "Gewohnheiten formen deine Zukunft, nicht einzelne Entscheidungen.",
  "Der Unterschied zwischen wer du bist und wer du sein willst, ist was du tust.",
  "Streaks brechen nicht durch schlechte Tage — sie brechen durch aufgegebene Tage.",
  "Ausreden verbrennen keine Kalorien.",
  "Du wirst es nie bereuen, hart gearbeitet zu haben.",
  "Fokus auf Fortschritt, nicht auf Perfektion.",
  "Die beste Investition ist die in dich selbst.",
  "Wer nicht aufgibt, kann nicht verlieren.",
  "Große Dinge geschehen nicht in der Komfortzone.",
  "Heute hart arbeiten, damit morgen leichter wird.",
  "Erfolg liebt Vorbereitung.",
  "Du hast heute die Wahl: Ausreden oder Ergebnisse.",
  "Der einzige Weg, es zu schaffen, ist, es zu tun.",
  "Disziplin ist Freiheit — sie gibt dir die Kontrolle über dein Leben zurück.",
  "Ein bisschen Fortschritt jeden Tag summiert sich zu großen Ergebnissen.",
  "Sei stärker als deine stärkste Ausrede.",
  "Wenn es leicht wäre, würde es jeder tun.",
];

/** Deterministisch pro Kalendertag ausgewählt, damit der Spruch den ganzen Tag stabil bleibt. */
export function quoteOfTheDay(dateStr: string): string {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) >>> 0;
  }
  return QUOTES[hash % QUOTES.length];
}
