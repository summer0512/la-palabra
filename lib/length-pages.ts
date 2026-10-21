import type { AccentMode, WordLength } from "@/lib/words";

export const WORD_LENGTH_VARIANTS: WordLength[] = [3, 4, 5, 6, 7, 8, 9, 10, 11];

export const formatLengthLabel = (length: WordLength) => `${length} letras`;

const accentModeSuffix = (accentMode: AccentMode): string =>
  accentMode === "accented" ? "-con-acentos" : "";

const accentModeLabel = (accentMode: AccentMode): string =>
  accentMode === "accented" ? "con acentos" : "sin acentos";

export const getGameSlug = (length: WordLength, accentMode: AccentMode = "plain") =>
  `palabra-${length}-letras${accentModeSuffix(accentMode)}`;

export const getGamePath = (length: WordLength, accentMode: AccentMode = "plain") =>
  `/${getGameSlug(length, accentMode)}`;

export const getFinderSlug = (length: WordLength) => `buscador-palabra-${length}-letras`;
export const getFinderPath = (length: WordLength) => `/${getFinderSlug(length)}`;

export const getGuideSlug = (length: WordLength) => `guia-palabra-${length}-letras`;
export const getGuidePath = (length: WordLength) => `/${getGuideSlug(length)}`;

const buildTitle = (lengthLabel: string, accentMode: AccentMode) =>
  `Palabra de ${lengthLabel} ${accentModeLabel(accentMode)} | La Palabra del Día`;

const buildDescription = (lengthLabel: string, accentMode: AccentMode) =>
  accentMode === "accented"
    ? `Juega la versión con acentos de ${lengthLabel} con modo diario, modo infinito y desafíos personalizados con tildes y diéresis.`
    : `Juega la versión sin acentos de ${lengthLabel} con modo diario, modo infinito y desafíos personalizados sin diacríticos.`;

export const getGameCopy = (length: WordLength, accentMode: AccentMode = "plain") => {
  const label = formatLengthLabel(length);
  const accentLabel = accentModeLabel(accentMode);
  return {
    title: buildTitle(label, accentMode),
    description: buildDescription(label, accentMode),
    keywords: [
      `palabra ${label} ${accentLabel}`,
      `wordle ${label} ${accentLabel}`,
      `juego palabras ${label} ${accentLabel}`,
      `la palabra del día ${label} ${accentLabel}`,
    ],
    heading: `Juego de palabras de ${label} ${accentLabel}`,
    subheading:
      accentMode === "accented"
        ? `Adivina palabras de ${label} con acentos en modo diario, infinito y desafíos personalizados.`
        : `Adivina palabras de ${label} sin acentos en modo diario, infinito y desafíos personalizados.`,
  };
};

export const getFinderCopy = (length: WordLength, totalWords?: number) => {
  const label = formatLengthLabel(length);
  const total = totalWords ? new Intl.NumberFormat("es-ES").format(totalWords) : null;
  return {
    title: `Buscador de palabras de ${label} | La Palabra del Día`,
    description: `Filtra y encuentra palabras de ${label} para Wordle y juegos similares. Compatibles con modo acentuado y sin acentos.`,
    keywords: [
      `buscador palabras ${label}`,
      `lista palabras ${label}`,
      `ayuda wordle ${label}`,
      `resolver palabra ${label}`,
    ],
    heading: `Buscador de palabras de ${label}`,
    subheading: total
      ? `Explora ${total} opciones de ${label} para inspirar tus jugadas.`
      : `Explora miles de palabras de ${label} para tus partidas diarias.`,
  };
};

export const getLengthLandingEntries = () =>
  WORD_LENGTH_VARIANTS.map((length) => ({
    length,
    gamePath: getGamePath(length, "plain"),
    accentedGamePath: getGamePath(length, "accented"),
    finderPath: getFinderPath(length),
  }));
