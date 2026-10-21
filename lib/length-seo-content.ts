import type { WordLength, WordListStats } from "@/constants/wordlist-metadata";
import { getFinderPath, getGamePath, formatLengthLabel } from "@/lib/length-pages";
import type { AccentMode } from "@/lib/words";

export type LengthPageStats = WordListStats;

export type LengthSeoBulletSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

export type LengthSeoFaq = {
  question: string;
  answer: string;
};

export type LengthExampleStep = {
  word: string;
  caption: string;
};

export type LengthExample = {
  title: string;
  description: string;
  solution: string;
  steps: LengthExampleStep[];
};

export type GuideGroup = {
  title: string;
  words: string[];
  description: string;
};

export type GuideContent = {
  title: string;
  description: string;
  groups: GuideGroup[];
  note?: string;
};

export type GameSeoContent = {
  intro: string;
  keyTakeaways: string[];
  sections: LengthSeoBulletSection[];
  faq: LengthSeoFaq[];
  relatedLinks: Array<{ href: string; label: string; description: string }>;
  example: LengthExample;
  guide: GuideContent;
};

export type FinderSeoContent = {
  intro: string;
  helper: string;
  sections: LengthSeoBulletSection[];
  faq: LengthSeoFaq[];
  highlights: string[];
};

type ContentContext = {
  length: WordLength;
  lengthLabel: string;
  accentMode: AccentMode;
  accentLabel: string;
  accentDescriptor: string;
  finderPath: string;
  accentedGamePath: string;
  plainGamePath: string;
  stats: LengthPageStats;
  formatNumber: (value: number) => string;
};

const getAccentDescriptor = (accentMode: AccentMode) =>
  accentMode === "accented" ? "con acentos" : "sin acentos";

const getAccentLabel = (accentMode: AccentMode) =>
  accentMode === "accented" ? "con acentos" : "sin acentos";

const formatNumberEs = (value: number, formatter: (value: number) => string) =>
  formatter(value);

const buildGameIntro = (context: ContentContext): string => {
  const { lengthLabel, accentDescriptor, accentMode, stats, formatNumber } = context;
  const total = formatNumberEs(stats.unique, formatNumber);
  if (context.length === 3) {
    return `El modo de ${lengthLabel} ${accentDescriptor} es el más veloz de La Palabra del Día. Con ${total} combinaciones reales en español, sirve para calentar antes de partidas largas, practicar reflejos y memorizar sílabas iniciales clave.`;
  }

  if (context.length === 4) {
    return `Las partidas de ${lengthLabel} ${accentDescriptor} son las más veloces de La Palabra del Día. Con solo cuatro posiciones, cada intento aporta información decisiva y el diccionario reduce las posibilidades a ${total} combinaciones reales en español.`;
  }

  if (context.length === 5) {
    return accentMode === "accented"
      ? `La versión ${accentDescriptor} de ${lengthLabel} mantiene el espíritu clásico del juego, pero añade la capa extra de tildes y diéresis. Hay ${total} soluciones posibles, por lo que dominar los patrones con acentos te da una ventaja sobre la mayoría de jugadores.`
      : `Las partidas de ${lengthLabel} son el formato más conocido del juego. Con ${total} opciones en español, es esencial equilibrar vocales y consonantes en los primeros turnos para acelerar tus victorias.`;
  }

  if (context.length === 6) {
    return `Las palabras de ${lengthLabel} ${accentDescriptor} amplían el reto a patrones más largos. En La Palabra del Día analizamos ${total} términos vigentes para este modo, así que conviene dominar combinaciones frecuentes y aprovechar el buscador cuando aparezcan letras repetidas.`;
  }

  if (context.length === 7) {
    return `Si buscas un reto intermedio, las palabras de ${lengthLabel} ${accentDescriptor} ofrecen suficiente complejidad sin volverse abrumadoras. Tu diccionario incluye ${total} términos aceptados, ideales para practicar estrategias de descarte y aprovechar estadísticas avanzadas.`;
  }

  if (context.length === 8) {
    return `Con ${lengthLabel} ${accentDescriptor} damos el salto a expresiones más largas, perfectas para jugadores avanzados. El diccionario de La Palabra del Día filtra ${total} palabras reales en español, lo que obliga a equilibrar letras comunes con consonantes menos vistas.`;
  }

  if (context.length === 9) {
    return `Las partidas de ${lengthLabel} ${accentDescriptor} exigen paciencia y lectura de sílabas completas. El diccionario contiene ${total} opciones reales en español, lo que convierte cada pista en una guía para detectar prefijos y terminaciones dominantes.`;
  }

  if (context.length === 10) {
    return `El modo de ${lengthLabel} ${accentDescriptor} es ideal para quienes disfrutan de palabras largas y estructuras repetidas. Con ${total} opciones disponibles, la clave es combinar apertura agresiva con un análisis de sufijos antes del cuarto intento.`;
  }

  return `Con ${lengthLabel} ${accentDescriptor} entramos al territorio experto. Gestiona ${total} términos extensos, identifica raíces compartidas y usa el buscador como apoyo para confirmar intuiciones complejas.`;
};

type ExampleSeed = {
  solution: string;
  steps: LengthExampleStep[];
};

const exampleSeedsPlain: Record<WordLength, ExampleSeed> = {
  3: {
    solution: "SOL",
    steps: [
      { word: "MAR", caption: "Primer intento: explora consonantes frecuentes." },
      { word: "PAN", caption: "Segundo intento: añade vocal abierta distinta." },
      { word: "SAL", caption: "Tercer intento: confirma la S y la L." },
      { word: "LOS", caption: "Cuarto intento: reordena letras presentes." },
      { word: "SON", caption: "Quinto intento: fija posición de la O." },
      { word: "SOL", caption: "Sexto intento: solución cerrada." },
    ],
  },
  4: {
    solution: "CASA",
    steps: [
      { word: "LUNA", caption: "Primer intento: abre vocales y consonantes suaves." },
      { word: "PISO", caption: "Segundo intento: cambia la combinación de vocales." },
      { word: "CERA", caption: "Tercer intento: confirma la C inicial." },
      { word: "CAMA", caption: "Cuarto intento: prueba consonantes comunes." },
      { word: "CATA", caption: "Quinto intento: valida la A final." },
      { word: "CASA", caption: "Sexto intento: palabra descubierta." },
    ],
  },
  5: {
    solution: "CANTO",
    steps: [
      { word: "SALTO", caption: "Primer intento: combina vocales abiertas." },
      { word: "MUNDO", caption: "Segundo intento: prueba consonantes nasales." },
      { word: "CIELO", caption: "Tercer intento: fija la C y la O." },
      { word: "CAMPO", caption: "Cuarto intento: refuerza la A y la O." },
      { word: "CANTA", caption: "Quinto intento: afina la última vocal." },
      { word: "CANTO", caption: "Sexto intento: solución final." },
    ],
  },
  6: {
    solution: "CARTAS",
    steps: [
      { word: "TIEMPO", caption: "Primer intento: detecta vocales frecuentes." },
      { word: "LADRON", caption: "Segundo intento: prueba consonantes fuertes." },
      { word: "CAMPOS", caption: "Tercer intento: confirma la C inicial." },
      { word: "CARROS", caption: "Cuarto intento: verifica dobles consonantes." },
      { word: "CARTON", caption: "Quinto intento: ajusta el final." },
      { word: "CARTAS", caption: "Sexto intento: palabra resuelta." },
    ],
  },
  7: {
    solution: "PALABRA",
    steps: [
      { word: "TIEMPOS", caption: "Primer intento: cubre vocales y una S final." },
      { word: "CANTARO", caption: "Segundo intento: prueba R y A en posiciones clave." },
      { word: "LAMPARA", caption: "Tercer intento: detecta la A repetida." },
      { word: "PALACIO", caption: "Cuarto intento: fija el inicio PAL-." },
      { word: "PALADAR", caption: "Quinto intento: ajusta consonantes finales." },
      { word: "PALABRA", caption: "Sexto intento: solución definitiva." },
    ],
  },
  8: {
    solution: "PREGUNTA",
    steps: [
      { word: "PALABRAS", caption: "Primer intento: abre vocales y consonantes comunes." },
      { word: "ESTACION", caption: "Segundo intento: confirma la T y la N." },
      { word: "RECUERDO", caption: "Tercer intento: detecta R y E en posiciones nuevas." },
      { word: "PLEGARIA", caption: "Cuarto intento: ubica la P y la G." },
      { word: "PREGUNTO", caption: "Quinto intento: ajusta la última vocal." },
      { word: "PREGUNTA", caption: "Sexto intento: palabra encontrada." },
    ],
  },
  9: {
    solution: "CAMINANDO",
    steps: [
      { word: "HISTORIAS", caption: "Primer intento: mapea vocales abiertas." },
      { word: "PREGUNTAS", caption: "Segundo intento: confirma la N y la T." },
      { word: "MARIPOSAS", caption: "Tercer intento: descarta consonantes repetidas." },
      { word: "CAMINANTE", caption: "Cuarto intento: fija el prefijo CAMI-." },
      { word: "CAMINAMOS", caption: "Quinto intento: ajusta la terminación." },
      { word: "CAMINANDO", caption: "Sexto intento: solución cerrada." },
    ],
  },
  10: {
    solution: "CONTENIDOS",
    steps: [
      { word: "ESTUDIANTE", caption: "Primer intento: cobertura amplia de vocales." },
      { word: "DIFERENTES", caption: "Segundo intento: prueba consonantes dobles." },
      { word: "COMENTARIO", caption: "Tercer intento: confirma la C inicial." },
      { word: "CONTADORES", caption: "Cuarto intento: valida la base CONT-." },
      { word: "CONTENIDAS", caption: "Quinto intento: ajusta la última vocal." },
      { word: "CONTENIDOS", caption: "Sexto intento: palabra final." },
    ],
  },
  11: {
    solution: "ENTRETENIDO",
    steps: [
      { word: "INFORMACION", caption: "Primer intento: descubre vocales abiertas." },
      { word: "APRENDIZAJE", caption: "Segundo intento: testea consonantes variadas." },
      { word: "TRANSFORMAR", caption: "Tercer intento: confirma T y R iniciales." },
      { word: "JUGABILIDAD", caption: "Cuarto intento: reduce consonantes repetidas." },
      { word: "ENTRETENIDA", caption: "Quinto intento: ajusta el género final." },
      { word: "ENTRETENIDO", caption: "Sexto intento: solución correcta." },
    ],
  },
};

const exampleSeedsAccented: Record<WordLength, ExampleSeed> = {
  3: {
    solution: "RÍO",
    steps: [
      { word: "MAR", caption: "Primer intento: prueba vocales abiertas." },
      { word: "SOL", caption: "Segundo intento: descarta consonantes." },
      { word: "RÍA", caption: "Tercer intento: detecta la R inicial." },
      { word: "RIO", caption: "Cuarto intento: prueba la versión sin tilde." },
      { word: "RÍE", caption: "Quinto intento: confirma vocal acentuada." },
      { word: "RÍO", caption: "Sexto intento: solución con tilde." },
    ],
  },
  4: {
    solution: "CAÑA",
    steps: [
      { word: "LUNA", caption: "Primer intento: cobertura de vocales." },
      { word: "PASE", caption: "Segundo intento: cambia consonantes." },
      { word: "CENA", caption: "Tercer intento: fija la C inicial." },
      { word: "CAJA", caption: "Cuarto intento: confirma la A final." },
      { word: "CAÑO", caption: "Quinto intento: introduce la Ñ." },
      { word: "CAÑA", caption: "Sexto intento: solución con Ñ." },
    ],
  },
  5: {
    solution: "AVIÓN",
    steps: [
      { word: "SALTO", caption: "Primer intento: explora consonantes fuertes." },
      { word: "MUNDO", caption: "Segundo intento: añade vocales nuevas." },
      { word: "CIELO", caption: "Tercer intento: confirma la O final." },
      { word: "AVISO", caption: "Cuarto intento: fija la A inicial." },
      { word: "AVION", caption: "Quinto intento: prueba la versión sin tilde." },
      { word: "AVIÓN", caption: "Sexto intento: solución con tilde." },
    ],
  },
  6: {
    solution: "MÚSICA",
    steps: [
      { word: "TIEMPO", caption: "Primer intento: cobertura de vocales." },
      { word: "LADRON", caption: "Segundo intento: cambia consonantes." },
      { word: "CAMINO", caption: "Tercer intento: detecta la M." },
      { word: "MUSICO", caption: "Cuarto intento: sin tilde en la U." },
      { word: "MÚSICO", caption: "Quinto intento: confirma la tilde." },
      { word: "MÚSICA", caption: "Sexto intento: solución final." },
    ],
  },
  7: {
    solution: "CANCIÓN",
    steps: [
      { word: "TIEMPOS", caption: "Primer intento: abre vocales." },
      { word: "LAMPARA", caption: "Segundo intento: detecta A repetida." },
      { word: "CANTARO", caption: "Tercer intento: fija el inicio CAN-." },
      { word: "CANTADO", caption: "Cuarto intento: prueba consonantes finales." },
      { word: "CANCION", caption: "Quinto intento: versión sin tilde." },
      { word: "CANCIÓN", caption: "Sexto intento: solución con tilde." },
    ],
  },
  8: {
    solution: "RELACIÓN",
    steps: [
      { word: "PALABRAS", caption: "Primer intento: mapea vocales." },
      { word: "ESTACION", caption: "Segundo intento: confirma T y N." },
      { word: "RECUERDO", caption: "Tercer intento: ubica la R y la E." },
      { word: "RELATIVO", caption: "Cuarto intento: fija RELA-." },
      { word: "RELACION", caption: "Quinto intento: prueba la versión sin tilde." },
      { word: "RELACIÓN", caption: "Sexto intento: solución con tilde." },
    ],
  },
  9: {
    solution: "EDUCACIÓN",
    steps: [
      { word: "HISTORIAS", caption: "Primer intento: descarta consonantes." },
      { word: "PREGUNTAS", caption: "Segundo intento: prueba la N y la T." },
      { word: "CAMINANDO", caption: "Tercer intento: confirma la O final." },
      { word: "EDUCACION", caption: "Cuarto intento: versión sin tilde." },
      { word: "EDUCADORA", caption: "Quinto intento: ajusta consonantes." },
      { word: "EDUCACIÓN", caption: "Sexto intento: solución con tilde." },
    ],
  },
  10: {
    solution: "APLICACIÓN",
    steps: [
      { word: "ESTUDIANTE", caption: "Primer intento: cobertura amplia." },
      { word: "CONTENIDOS", caption: "Segundo intento: confirma O y N." },
      { word: "COMENTARIO", caption: "Tercer intento: fija la C inicial." },
      { word: "APLICACION", caption: "Cuarto intento: versión sin tilde." },
      { word: "APLICABLES", caption: "Quinto intento: ajusta la última vocal." },
      { word: "APLICACIÓN", caption: "Sexto intento: solución con tilde." },
    ],
  },
  11: {
    solution: "INFORMACIÓN",
    steps: [
      { word: "APRENDIZAJE", caption: "Primer intento: detecta vocales." },
      { word: "ENTRETENIDO", caption: "Segundo intento: prueba consonantes frecuentes." },
      { word: "TRANSFORMAR", caption: "Tercer intento: confirma T y R." },
      { word: "JUGABILIDAD", caption: "Cuarto intento: descarta consonantes." },
      { word: "INFORMACION", caption: "Quinto intento: versión sin tilde." },
      { word: "INFORMACIÓN", caption: "Sexto intento: solución con tilde." },
    ],
  },
};

const buildExampleContent = (context: ContentContext): LengthExample => {
  const { length, lengthLabel, accentDescriptor, accentMode } = context;
  const seed = accentMode === "accented" ? exampleSeedsAccented[length] : exampleSeedsPlain[length];
  const title = `Ejemplo en 6 intentos para ${lengthLabel} ${accentDescriptor}`;
  const description = `Sigue una partida completa de ${lengthLabel} y observa cómo cambian las pistas a lo largo de los seis turnos disponibles.`;
  return {
    title,
    description,
    solution: seed.solution,
    steps: seed.steps,
  };
};

const guideAccentNoteByLength: Partial<Record<WordLength, string>> = {
  3: "En modo con acentos, prueba variantes como RÍO o DÍA para detectar vocales tildadas.",
  4: "Si juegas con acentos, incorpora CAÑA o SÓLO cuando la Ñ o la tilde sean probables.",
  5: "En modo con acentos, combina palabras con tilde como AVIÓN o ÁRBOL para confirmar vocales abiertas.",
  6: "En modo con acentos, alterna variantes como MÚSICA o ÚTILES para identificar tildes.",
  7: "En modo con acentos, usa CANCIÓN o NÁUTICO para fijar vocales tildadas.",
  8: "En modo con acentos, prueba RELACIÓN o EDUCACIÓN cuando sospeches terminaciones -CIÓN.",
  9: "En modo con acentos, EDUCACIÓN ayuda a confirmar tildes en palabras largas.",
  10: "En modo con acentos, APLICACIÓN o DISTRIBUCIÓN ayudan a separar palabras con -CIÓN.",
  11: "En modo con acentos, INFORMACIÓN y COMUNICACIÓN son excelentes para verificar tildes largas.",
};

const guideGroupsPlain: Record<WordLength, GuideGroup[]> = {
  3: [
    {
      title: "Cobertura rápida de vocales",
      words: ["SOL", "MAR", "LUZ"],
      description: "Tres palabras cortas con vocales distintas para abrir el tablero en dos intentos.",
    },
    {
      title: "Consonantes más frecuentes",
      words: ["PAN", "SAL", "RIO"],
      description: "Permiten validar S, L, N y R sin repetir demasiadas letras.",
    },
  ],
  4: [
    {
      title: "Apertura equilibrada",
      words: ["CASA", "LUNA", "PESO", "RUTA"],
      description: "Combinan vocales abiertas y consonantes comunes en solo cuatro casillas.",
    },
    {
      title: "Cobertura de consonantes suaves",
      words: ["CINE", "MESA", "PALO", "NIDO"],
      description: "Útiles para detectar L, N y D sin perder información.",
    },
  ],
  5: [
    {
      title: "Clásicos de 5 letras",
      words: ["AUDIO", "LENTO", "CIELO", "PASTA"],
      description: "Cubren las cinco vocales y consonantes frecuentes en dos turnos.",
    },
    {
      title: "Combinaciones populares",
      words: ["SANTO", "RIEGO", "TRINO", "CALOR"],
      description: "Perfectas para confirmar R, S, T y N antes del tercer intento.",
    },
  ],
  6: [
    {
      title: "Aperturas con vocales fuertes",
      words: ["TIEMPO", "LENTES", "SALTAR"],
      description: "Mezclan vocales variadas y consonantes de uso diario.",
    },
    {
      title: "Cobertura de consonantes dobles",
      words: ["CARTON", "MADERA", "RONDAS"],
      description: "Ideales para validar R, D y M cuando el tablero se cierra.",
    },
  ],
  7: [
    {
      title: "Ritmo equilibrado",
      words: ["PALABRA", "CAMINOS", "VENTANA"],
      description: "Abren el tablero con vocales repetidas y consonantes claras.",
    },
    {
      title: "Alternativas de consonantes",
      words: ["CANTARO", "FORMATO", "SINCERO"],
      description: "Ayudan a confirmar R, N y T en posiciones medias.",
    },
  ],
  8: [
    {
      title: "Cobertura completa",
      words: ["PREGUNTA", "PALABRAS", "ESTACION"],
      description: "Combinan vocales con consonantes de uso frecuente en partidas largas.",
    },
    {
      title: "Consonantes de cierre",
      words: ["RECUERDO", "SERVICIO", "RECORRER"],
      description: "Útiles para confirmar R, C y S cuando ya hay pistas verdes.",
    },
  ],
  9: [
    {
      title: "Aperturas para 9 letras",
      words: ["HISTORIAS", "PREGUNTAS", "MARIPOSAS"],
      description: "Cobren vocales abiertas y consonantes suaves en dos intentos.",
    },
    {
      title: "Estructuras largas",
      words: ["CAMINANDO", "ENCUENTRA", "SOBRESALE"],
      description: "Ayudan a detectar prefijos y sufijos frecuentes.",
    },
  ],
  10: [
    {
      title: "Cobertura amplia",
      words: ["ESTUDIANTE", "CONTENIDOS", "DIFERENTES"],
      description: "Cubren casi todas las vocales y consonantes más usadas.",
    },
    {
      title: "Refuerzo de consonantes",
      words: ["COMENTARIO", "ESTACIONES", "CONTADORES"],
      description: "Sirven para validar letras intermedias cuando el patrón es largo.",
    },
  ],
  11: [
    {
      title: "Aperturas para expertos",
      words: ["INFORMACION", "APRENDIZAJE", "TRANSFORMAR"],
      description: "Detectan vocales y consonantes clave en una sola secuencia.",
    },
    {
      title: "Consonantes de cierre",
      words: ["ENTRETENIDO", "JUGABILIDAD", "HERRAMIENTA"],
      description: "Perfectas para confirmar letras repetidas en palabras largas.",
    },
  ],
};

const guideGroupsAccented: Record<WordLength, GuideGroup[]> = {
  3: [
    {
      title: "Cobertura rápida de vocales",
      words: ["SOL", "MAR", "RÍO"],
      description: "Tres palabras cortas con vocales distintas y una tilde temprana.",
    },
    {
      title: "Consonantes más frecuentes",
      words: ["PAN", "SAL", "LUZ"],
      description: "Permiten validar S, L y N sin perder intentos.",
    },
  ],
  4: [
    {
      title: "Apertura equilibrada",
      words: ["CASA", "LUNA", "PESO", "CAÑA"],
      description: "Incluye la Ñ para detectar acentos tempranos.",
    },
    {
      title: "Cobertura de consonantes suaves",
      words: ["CINE", "MESA", "PALO", "NIDO"],
      description: "Útiles para confirmar L, N y D rápidamente.",
    },
  ],
  5: [
    {
      title: "Clásicos con tilde",
      words: ["AUDIO", "LENTO", "CIELO", "AVIÓN"],
      description: "Mezcla vocales abiertas y una tilde en la O final.",
    },
    {
      title: "Combinaciones populares",
      words: ["SANTO", "RIEGO", "TRINO", "CALOR"],
      description: "Perfectas para confirmar R, S, T y N antes del tercer intento.",
    },
  ],
  6: [
    {
      title: "Aperturas con tilde",
      words: ["TIEMPO", "LENTES", "MÚSICA"],
      description: "Introduce la Ú para detectar acentos tempranos.",
    },
    {
      title: "Cobertura de consonantes dobles",
      words: ["CARTON", "MADERA", "RONDAS"],
      description: "Ideales para validar R, D y M cuando el tablero se cierra.",
    },
  ],
  7: [
    {
      title: "Ritmo equilibrado",
      words: ["PALABRA", "CAMINOS", "CANCIÓN"],
      description: "Combina vocales repetidas con una tilde clave.",
    },
    {
      title: "Alternativas de consonantes",
      words: ["CANTARO", "FORMATO", "SINCERO"],
      description: "Ayudan a confirmar R, N y T en posiciones medias.",
    },
  ],
  8: [
    {
      title: "Cobertura completa",
      words: ["PREGUNTA", "PALABRAS", "RELACIÓN"],
      description: "Introduce la Ó para detectar finales -CIÓN.",
    },
    {
      title: "Consonantes de cierre",
      words: ["RECUERDO", "SERVICIO", "RECORRER"],
      description: "Útiles para confirmar R, C y S cuando ya hay pistas verdes.",
    },
  ],
  9: [
    {
      title: "Aperturas para 9 letras",
      words: ["HISTORIAS", "PREGUNTAS", "EDUCACIÓN"],
      description: "Cubren vocales abiertas e incorporan una tilde clave.",
    },
    {
      title: "Estructuras largas",
      words: ["CAMINANDO", "ENCUENTRA", "SOBRESALE"],
      description: "Ayudan a detectar prefijos y sufijos frecuentes.",
    },
  ],
  10: [
    {
      title: "Cobertura amplia",
      words: ["ESTUDIANTE", "CONTENIDOS", "APLICACIÓN"],
      description: "Cubren vocales y confirman la terminación -CIÓN.",
    },
    {
      title: "Refuerzo de consonantes",
      words: ["COMENTARIO", "ESTACIONES", "CONTADORES"],
      description: "Sirven para validar letras intermedias cuando el patrón es largo.",
    },
  ],
  11: [
    {
      title: "Aperturas para expertos",
      words: ["INFORMACIÓN", "APRENDIZAJE", "TRANSFORMAR"],
      description: "Detectan vocales y consonantes clave con una tilde temprana.",
    },
    {
      title: "Consonantes de cierre",
      words: ["ENTRETENIDO", "JUGABILIDAD", "HERRAMIENTA"],
      description: "Perfectas para confirmar letras repetidas en palabras largas.",
    },
  ],
};

const buildGuideContent = (context: ContentContext): GuideContent => {
  const { length, lengthLabel, accentMode } = context;
  const groups = accentMode === "accented" ? guideGroupsAccented[length] : guideGroupsPlain[length];
  const note = accentMode === "accented" ? guideAccentNoteByLength[length] : undefined;
  return {
    title: `Guía de aperturas para ${lengthLabel}`,
    description: `Combinaciones de palabras iniciales frecuentes para abrir el tablero y cubrir vocales y consonantes comunes en ${lengthLabel}.`,
    groups,
    note,
  };
};

const gameSectionsByLength = (context: ContentContext): LengthSeoBulletSection[] => {
  const { length, lengthLabel, accentDescriptor, finderPath, stats, formatNumber } = context;
  const answers = formatNumberEs(stats.answers, formatNumber);
  const allowed = formatNumberEs(stats.allowed, formatNumber);
  const total = formatNumberEs(stats.unique, formatNumber);
  const genericSections: Partial<Record<WordLength, LengthSeoBulletSection[]>> = {
    3: [
      {
        title: "Calienta en segundos",
        paragraphs: [
          `Ideal para introducir a nuevos jugadores o practicar reflejos. Con ${answers} respuestas oficiales y ${allowed} combinaciones aceptadas, cada intento entrega señales inmediatas.`,
        ],
        bullets: [
          "Empieza con palabras que cubran vocales distintas para obtener pistas rápidas.",
          `Apóyate en el buscador (${finderPath}) para descartar letras antes de agotar turnos.`,
        ],
      },
      {
        title: "Domina las terminaciones",
        paragraphs: [
          "Las palabras cortas suelen terminar en consonantes suaves como L, N o R. Alterna esas letras cuando una vocal quede en amarillo para ubicarla al final.",
        ],
        bullets: [
          "Si no aparecen vocales, prueba Y o Ñ: desbloquean combinaciones exclusivas del español.",
          "Reserva consonantes dobles (LL, RR) para confirmar patrones cuando tengas dos letras en verde.",
        ],
      },
      {
        title: "Entrenamiento exprés",
        paragraphs: [
          "Encadena partidas en modo infinito durante cinco minutos. Cuando consigas marcadores perfectos, crea desafíos personalizados para tus amigos.",
        ],
      },
    ],
    4: [
      {
        title: "¿Cuándo elegir el modo de 4 letras?",
        paragraphs: [
          `Es perfecto para sesiones rápidas, para introducir a nuevos jugadores o cuando quieres entrenar aperturas agresivas. Con ${answers} posibles respuestas diarias y ${allowed} palabras adicionales permitidas, cada turno debe cubrir la mayor variedad posible.`,
        ],
        bullets: [
          "Prioriza palabras con vocales diferentes (A, E, O) para detectar patrones al instante.",
          "Aprovecha letras dobles como LL o RR para confirmar consonantes comunes en español.",
          `Combina el buscador dedicado (${finderPath}) para validar hipótesis antes de gastar intentos.`,
        ],
      },
      {
        title: "Estrategia recomendada",
        paragraphs: [
          "Empieza con palabras equilibradas como “LADO” o “TOMA”. Si no encuentras vocales, introduce Ñ o Y, que aparecen con frecuencia en palabras cortas.",
        ],
        bullets: [
          "Evita repetir consonantes grises salvo que quieras comprobar ubicaciones exactas.",
          "Si tienes dos vocales confirmadas, usa la tercera posición para probar consonantes que formen sílabas comunes.",
        ],
      },
      {
        title: "Entrena con estadísticas",
        paragraphs: [
          "Activa el modo infinito para practicar secuencias de 4 letras sin límite. Cuando domines las aperturas, crea retos personalizados para retar a tus amigos con palabras raras.",
        ],
      },
    ],
    5: [
      {
        title: "Mantén vivas tus rachas",
        paragraphs: [
          `Las ${answers} respuestas posibles se renuevan diariamente y comparten patrones con el Wordle original, pero adaptadas al español. Aprovecha tus estadísticas para identificar letras iniciales más frecuentes.`,
        ],
        bullets: [
          "Usa combinaciones como “AUDIO” o “LENTO” para cubrir vocales y consonantes comunes.",
          "Introducir la letra Ñ en el segundo turno es una gran forma de descartar palabras con digrafos.",
          "Activa el buscador antes del quinto intento para reducir la lista a menos de ${total} opciones.",
        ],
      },
      {
        title: "Acentos y diéresis",
        paragraphs: [
          `En el modo ${accentDescriptor} debes considerar tildes y diéresis. Palabras como “MAÍZ” o “PINGÜE” son válidas, por lo que conviene memorizar posiciones habituales de vocales acentuadas.`,
        ],
        bullets: [
          "Si ves una vocal amarilla, prueba la versión acentuada en la siguiente casilla.",
          "Recuerda que la Ñ se considera distinta a la N, incluso en modo sin acentos.",
        ],
      },
      {
        title: "Apóyate en el buscador",
        paragraphs: [
          `Cuando queden menos de dos intentos, usa el buscador de ${lengthLabel} para filtrar letras obligatorias, posiciones confirmadas y excluir consonantes grises.`,
        ],
      },
    ],
    6: [
      {
        title: "Un formato pensado para jugadores intermedios",
        paragraphs: [
          `Con ${answers} respuestas oficiales y ${allowed} alternativas aceptadas, el modo de ${lengthLabel} exige más planificación. Empieza con palabras que cubran sílabas frecuentes, como “ENTRAS” o “SOLTAR”.`,
        ],
        bullets: [
          "Introduce consonantes líquidas (R, L) junto a vocales para confirmar clústeres comunes.",
          "Si recibes pistas amarillas, reorganiza las letras pensando en prefijos como RE-, DES-, SUB-. ",
        ],
      },
      {
        title: "Gestiona letras repetidas",
        paragraphs: [
          "En palabras largas es habitual encontrar consonantes duplicadas. Si una letra aparece dos veces, confirma su posición alternando combinaciones antes del cuarto intento.",
        ],
        bullets: [
          "Utiliza el buscador para identificar palabras con letras repetidas sin salir del flujo del juego.",
          "En modo con acentos, recuerda que una vocal acentuada cuenta como letra independiente.",
        ],
      },
      {
        title: "Idea de entrenamiento",
        paragraphs: [
          "Alterna entre modo diario y modo infinito para memorizar finales comunes (-CIÓN, -MENT, -IDAD) y detectar patrones en menos de seis intentos.",
        ],
      },
    ],
    7: [
      {
        title: "Ritmo pausado, análisis profundo",
        paragraphs: [
          `El diccionario de ${lengthLabel} ${accentDescriptor} combina ${answers} soluciones con ${allowed} palabras permitidas. Úsalo cuando quieras partidas más largas que te obliguen a pensar en estructuras silábicas.`,
        ],
        bullets: [
          "Empieza con palabras que abran el abanico, como “ENTRADA” o “VENTANA”.",
          "Reserva letras menos comunes (B, H, J) para intentos donde ya tengas 3 o 4 posiciones confirmadas.",
        ],
      },
      {
        title: "Analiza prefijos y sufijos",
        paragraphs: [
          "Con siete letras abundan terminaciones como -CIÓN, -ALES o -MENT. Identifica rápidamente la función de cada sílaba para reducir la lista de opciones.",
        ],
        bullets: [
          "En modo con acentos, revisa la posición de vocales abiertas (Á, É, Ó), suelen aparecer cerca del final.",
          "Si no consigues cerrar la palabra, combina el buscador con desafíos personalizados para practicar.",
        ],
      },
      {
        title: "Cierra partidas con calma",
        paragraphs: [
          "Antes del último intento, repasa el panel de letras descartadas y confirma que no falte ninguna consonante frecuente. Las palabras de siete letras premian la paciencia y el uso inteligente de estadísticas.",
        ],
      },
    ],
    8: [
      {
        title: "El modo favorito para veteranos",
        paragraphs: [
          `Con ${total} palabras validadas, las partidas de ${lengthLabel} ${accentDescriptor} se sienten como resolver un mini crucigrama. Requieren memoria y un buen manejo de sílabas internas.`,
        ],
        bullets: [
          "Abre con palabras largas y equilibradas para revelar vocales y consonantes clave.",
          "Añade letras menos frecuentes (G, H, Y) cuando el patrón ya esté definido.",
        ],
      },
      {
        title: "Patrones a vigilar",
        paragraphs: [
          "Las palabras largas suelen contener prefijos RE-, DES-, INTER- y sufijos -CIÓN, -MENTE. Confirma estas estructuras antes de arriesgarte.",
        ],
        bullets: [
          "Si bloqueas el tablero, usa el buscador para descartar vocales y probar variantes con diéresis.",
          "Genera desafíos personalizados con palabras largas para retar a tu comunidad.",
        ],
      },
      {
        title: "Aprovecha los modos del juego",
        paragraphs: [
          "El modo infinito es excelente para memorizar secuencias de ocho letras. Usa las estadísticas para revisar tu curva de aprendizaje.",
        ],
      },
    ],
    9: [
      {
        title: "Lectura de sílabas completas",
        paragraphs: [
          `Con ${answers} respuestas oficiales y ${allowed} palabras permitidas, cada intento debe cubrir sílabas completas. Las ${lengthLabel} ${accentDescriptor} premian la planificación.`,
        ],
        bullets: [
          "Empieza con palabras que contengan prefijos claros (RE-, DES-, CON-).",
          `Apóyate en el buscador (${finderPath}) cuando tengas más de tres letras confirmadas.`,
        ],
      },
      {
        title: "Prefijos y sufijos dominantes",
        paragraphs: [
          "Busca terminaciones frecuentes como -CIÓN, -MENTO o -AMIENTO. Encajan con gran parte del vocabulario largo en español.",
        ],
        bullets: [
          "Cuando veas dos vocales seguidas, prueba combinaciones IA, IE o IO.",
          "Evita repetir consonantes grises; en palabras largas cada letra descartada vale oro.",
        ],
      },
      {
        title: "Cierre con método",
        paragraphs: [
          "Antes del último intento, escribe en el buscador todas las letras confirmadas y revisa las coincidencias. Reducirás la lista de ${total} opciones a unas pocas palabras reales.",
        ],
      },
    ],
    10: [
      {
        title: "Planificación por bloques",
        paragraphs: [
          `Las palabras de ${lengthLabel} ${accentDescriptor} se resuelven mejor en bloques de 2 o 3 sílabas. El diccionario cuenta con ${total} entradas, así que tu apertura debe ser muy eficiente.`,
        ],
        bullets: [
          "Combina una palabra de vocales abiertas con otra de consonantes fuertes.",
          "Reserva letras raras para el tercer intento si no aparecen pistas verdes.",
        ],
      },
      {
        title: "Detecta terminaciones largas",
        paragraphs: [
          "Sufijos como -DOR, -CIÓN, -ABLE y -MENTE aparecen con frecuencia. Identificar uno temprano reduce decenas de opciones.",
        ],
        bullets: [
          "Si tienes dos vocales verdes, prueba consonantes intermedias como N, L o R.",
          "En modo con acentos, confirma si la vocal final debe llevar tilde antes del sexto intento.",
        ],
      },
      {
        title: "Uso táctico del buscador",
        paragraphs: [
          `En partidas largas, usa el buscador de ${lengthLabel} para cruzar letras obligatorias y excluir consonantes descartadas.`,
        ],
      },
    ],
    11: [
      {
        title: "Mentalidad de palabras largas",
        paragraphs: [
          `Las ${lengthLabel} ${accentDescriptor} requieren paciencia y lectura de patrones. Con ${total} combinaciones oficiales, cada intento debe aportar máximo valor.`,
        ],
        bullets: [
          "Empieza con palabras que contengan vocales variadas y letras como R, N, L.",
          "Si aparece una vocal amarilla, prueba ubicarla en extremos antes de mover el centro.",
        ],
      },
      {
        title: "Raíces compartidas",
        paragraphs: [
          "Muchas palabras de 11 letras comparten raíces latinas. Detecta segmentos como -FORM-, -INFO- o -MENT- para acotar el tablero.",
        ],
        bullets: [
          "No repitas consonantes descartadas; usa el buscador para validar la raíz.",
          "En modo con acentos, confirma la tilde antes de cerrar la palabra.",
        ],
      },
      {
        title: "Práctica avanzada",
        paragraphs: [
          "Juega varias rondas de modo infinito con palabras largas antes de enfrentar el reto diario. Te ayudará a reconocer patrones y evitar bloqueos.",
        ],
      },
    ],
  };

  return genericSections[length] ?? [];
};

const gameFaqByLength = (context: ContentContext): LengthSeoFaq[] => {
  const { length, lengthLabel, accentMode, accentDescriptor, formatNumber, stats } = context;
  const total = formatNumberEs(stats.unique, formatNumber);
  const baseFaq: LengthSeoFaq[] = [
    {
      question: `¿Cuántas palabras válidas existen en el modo de ${lengthLabel}?`,
      answer: `El diccionario de La Palabra del Día incluye ${total} combinaciones filtradas para ${lengthLabel} ${accentDescriptor}. Actualizamos la lista periódicamente para eliminar expresiones obsoletas.`,
    },
    {
      question: "¿Puedo usar el buscador sin arruinar mi partida diaria?",
      answer:
        "Sí. El buscador solo filtra letras y posiciones; la decisión final sigue siendo tuya. Recomendamos utilizarlo a partir del cuarto intento para conservar la emoción del juego.",
    },
    {
      question: "¿Existe modo infinito para practicar?",
      answer:
        "Claro. Activa el modo infinito desde el menú principal para practicar sin límite y registrar tus estadísticas antes de volver al modo diario.",
    },
  ];

  if (accentMode === "accented") {
    baseFaq.splice(1, 0, {
      question: "¿Los acentos cambian la dificultad?",
      answer:
        "Sí. Consideramos vocales acentuadas y diéresis como letras únicas. Aprender dónde suelen aparecer (finales como -IÓN o secuencias como GÜE) es clave para reducir intentos.",
    });
  } else {
    baseFaq.splice(1, 0, {
      question: "¿Qué cambia en el modo sin acentos?",
      answer:
        "Normalizamos las vocales para que coincidencias como “caña” y “cana” se resuelvan con la misma entrada. Aun así, la Ñ y otras letras especiales conservan su identidad.",
    });
  }

  if (length >= 8) {
    baseFaq.push({
      question: "¿Cómo evitar quedarme sin ideas en palabras tan largas?",
      answer:
        "Divide la palabra en bloques lógicos, identifica prefijos frecuentes y utiliza el buscador para confirmar letras obligatorias. También puedes preparar listas de apertura en la guía La Palabra Academy.",
    });
  }

  return baseFaq;
};

const gameLinks = (context: ContentContext): GameSeoContent["relatedLinks"] => {
  const { finderPath, accentedGamePath, plainGamePath, accentMode } = context;
  const links: GameSeoContent["relatedLinks"] = [
    {
      href: finderPath,
      label: "Buscador de palabras",
      description: "Filtra letras obligatorias, posiciones exactas y exclusiones para reducir opciones rápidamente.",
    },
    {
      href: "/guia-palabra",
      label: "Guía La Palabra Academy",
      description: "Aprende aperturas recomendadas, estrategias avanzadas y cómo interpretar tus estadísticas.",
    },
  ];

  if (accentMode === "accented") {
    links.unshift({
      href: plainGamePath,
      label: "Modo sin acentos",
      description: "Alterna con el modo estándar para repasar vocabulario base antes de volver a los acentos.",
    });
  } else {
    links.unshift({
      href: accentedGamePath,
      label: "Modo con acentos",
      description: "Entrena la versión con tildes y diéresis para ampliar tu repertorio de palabras.",
    });
  }

  return links;
};

const gameKeyTakeaways = (context: ContentContext): string[] => {
  const { accentMode, finderPath, lengthLabel } = context;
  const accentMessage =
    accentMode === "accented"
      ? "Memoriza dónde suelen aparecer vocales acentuadas y diéresis para adelantarte a pistas amarillas."
      : "Identifica rápidamente combinaciones con Ñ y digrafos españoles para no perder intentos.";

  return [
    `Selecciona palabras iniciales que cubran la mayor variedad posible de letras en ${lengthLabel}.`,
    accentMessage,
    `Apóyate en el buscador (${finderPath}) y en el modo infinito para mejorar tu promedio de intentos.`,
  ];
};

export const getGameSeoContent = (
  length: WordLength,
  accentMode: AccentMode,
  stats: LengthPageStats,
  formatNumber: (value: number) => string
): GameSeoContent => {
  const lengthLabel = formatLengthLabel(length);
  const accentLabel = getAccentLabel(accentMode);
  const accentDescriptor = getAccentDescriptor(accentMode);
  const finderPath = getFinderPath(length);
  const accentedGamePath = getGamePath(length, "accented");
  const plainGamePath = getGamePath(length, "plain");

  const context: ContentContext = {
    length,
    lengthLabel,
    accentMode,
    accentLabel,
    accentDescriptor,
    finderPath,
    accentedGamePath,
    plainGamePath,
    stats,
    formatNumber,
  };

  return {
    intro: buildGameIntro(context),
    keyTakeaways: gameKeyTakeaways(context),
    sections: gameSectionsByLength(context),
    faq: gameFaqByLength(context),
    relatedLinks: gameLinks(context),
    example: buildExampleContent(context),
    guide: buildGuideContent(context),
  };
};

const finderSectionsByLength = (context: ContentContext): LengthSeoBulletSection[] => {
  const { length, lengthLabel, formatNumber, stats } = context;
  const total = formatNumberEs(stats.unique, formatNumber);
  const answers = formatNumberEs(stats.answers, formatNumber);

  const baseSections: Partial<Record<WordLength, LengthSeoBulletSection[]>> = {
    3: [
      {
        title: "Cierra patrones rápidos",
        paragraphs: [
          `Con ${total} combinaciones posibles, el buscador te deja ver en segundos qué sílabas de ${lengthLabel} siguen vivas.`,
        ],
        bullets: [
          "Coloca primero la vocal verde y mueve la consonante amarilla al final.",
          "Si no hay vocales, prueba Ñ o Y para desbloquear opciones raras.",
        ],
      },
      {
        title: "Evita repeticiones",
        paragraphs: ["En 3 letras, repetir consonantes grises suele costar la partida."],
      },
    ],
    4: [
      {
        title: "Filtra en dos pasos",
        paragraphs: [
          `El modo de ${lengthLabel} se decide rápido. Usa el filtro de posiciones para reducir de ${total} opciones a unas pocas.`,
        ],
        bullets: ["Prueba finales en -A o -O cuando tengas una vocal amarilla."],
      },
      {
        title: "Bloques cortos",
        paragraphs: ["Las combinaciones CV y VC dominan las palabras de cuatro letras."],
      },
    ],
    5: [
      {
        title: "Ajusta la palabra diaria",
        paragraphs: [
          `El buscador replica las ${answers} respuestas oficiales y reduce el ruido cuando ya tienes 2 o 3 letras confirmadas.`,
        ],
        bullets: [
          "Marca Ñ como obligatoria si aparece en amarillo.",
          "Combina posiciones exactas con una sola letra excluida para afinar.",
        ],
      },
      {
        title: "Control de tildes",
        paragraphs: ["Si sospechas de tilde, prueba la vocal acentuada en la posición final."],
      },
    ],
    6: [
      {
        title: "Detecta repeticiones",
        paragraphs: [
          "En seis letras, las duplicaciones aparecen más seguido. Usa posiciones exactas para confirmar dobles.",
        ],
      },
      {
        title: "Finales frecuentes",
        paragraphs: ["Filtra terminaciones como -CIÓN, -MENTO o -IDADES para cerrar la partida."],
      },
    ],
    7: [
      {
        title: "Piensa en sílabas",
        paragraphs: ["Cuando tengas 3 letras verdes, filtra sílabas completas para reducir la lista."],
      },
      {
        title: "Crea tu registro",
        paragraphs: ["Guarda combinaciones útiles; en 7 letras muchas terminaciones se repiten."],
      },
    ],
    8: [
      {
        title: "Recorta el diccionario",
        paragraphs: [
          "Combina letras obligatorias con exclusiones masivas. Prefijos como RE- y DES- ayudan a filtrar.",
        ],
      },
      {
        title: "Revisa sufijos largos",
        paragraphs: ["Prueba -MENTE o -CIÓN si ya tienes vocales verdes en la parte final."],
      },
    ],
    9: [
      {
        title: "Búsqueda por bloques",
        paragraphs: [
          `Con ${total} opciones, filtra primero 2 o 3 letras clave y ajusta posiciones exactas.`,
        ],
      },
      {
        title: "Prefijos dominantes",
        paragraphs: ["Si detectas CON- o DES-, fíjalos antes de probar más letras."],
      },
    ],
    10: [
      {
        title: "Cierra terminaciones largas",
        paragraphs: [
          "Cuando tengas cuatro letras confirmadas, prueba terminaciones como -CIÓN o -ABLE.",
        ],
      },
      {
        title: "Controla duplicados",
        paragraphs: ["Las letras repetidas son comunes; el buscador confirma si una consonante se duplica."],
      },
    ],
    11: [
      {
        title: "Filtra sin perder tiempo",
        paragraphs: [
          `El buscador de ${lengthLabel} reduce cientos de opciones cuando ya tienes 4 letras fijas.`,
        ],
      },
      {
        title: "Raíces compartidas",
        paragraphs: ["Introduce segmentos como -MENT- o -FORM- para detectar raíces repetidas."],
      },
    ],
  };

  return baseSections[length] ?? [];
};

const finderFaqByLength = (context: ContentContext): LengthSeoFaq[] => {
  const { lengthLabel, formatNumber, stats, accentMode, length } = context;
  const total = formatNumberEs(stats.unique, formatNumber);
  const answers = formatNumberEs(stats.answers, formatNumber);

  const lengthSpecific: Record<WordLength, LengthSeoFaq> = {
    3: {
      question: "¿Cuántas opciones reales quedan después del primer intento?",
      answer: "En 3 letras, un buen primer intento reduce la lista a unas pocas sílabas posibles.",
    },
    4: {
      question: "¿Qué final es más común en 4 letras?",
      answer: "Los finales en A u O son frecuentes; pruébalos cuando tengas una vocal amarilla.",
    },
    5: {
      question: "¿Cuándo conviene usar el buscador en 5 letras?",
      answer: "A partir del tercer intento, cuando ya tengas 2 letras confirmadas.",
    },
    6: {
      question: "¿Cómo detectar letras duplicadas?",
      answer: "Introduce la letra como obligatoria y prueba posiciones alternas para confirmar repeticiones.",
    },
    7: {
      question: "¿Es útil filtrar sílabas completas?",
      answer: "Sí. Cuando tienes tres letras en verde, las sílabas reducen la lista muy rápido.",
    },
    8: {
      question: "¿Debo priorizar prefijos o sufijos?",
      answer: "Prefijos como RE- o DES- ayudan al inicio; sufijos largos cierran la palabra.",
    },
    9: {
      question: "¿Qué hago si hay demasiadas opciones?",
      answer: "Ajusta posiciones exactas y excluye una consonante por intento hasta cerrar el patrón.",
    },
    10: {
      question: "¿Las terminaciones largas se repiten?",
      answer: "Sí, -CIÓN y -ABLE son comunes en 10 letras; úsalo para filtrar.",
    },
    11: {
      question: "¿Qué raíz debería probar primero?",
      answer: "Prueba segmentos como -MENT- o -FORM- para eliminar decenas de opciones.",
    },
  };

  const faqs: LengthSeoFaq[] = [
    {
      question: `¿De qué lista se alimenta el buscador de ${lengthLabel}?`,
      answer: `Utiliza la misma base oficial del juego, con ${answers} respuestas y ${total} palabras válidas en total.`,
    },
    {
      question: "¿Puedo combinar filtros por posición y letras obligatorias?",
      answer:
        "Sí. Marca posiciones exactas, añade letras obligatorias y termina excluyendo consonantes descartadas.",
    },
    lengthSpecific[length],
  ];

  if (accentMode === "accented") {
    faqs.splice(1, 0, {
      question: "¿Cómo filtrar palabras con acentos o diéresis?",
      answer:
        "Introduce la vocal acentuada en su posición o añádela como obligatoria. El buscador la trata como letra independiente.",
    });
  }

  return faqs;
};

const finderHighlights = (context: ContentContext): string[] => {
  const { lengthLabel, finderPath, length } = context;
  const highlightsByLength: Record<WordLength, string[]> = {
    3: [
      `Resolución ultra rápida para ${lengthLabel}.`,
      "Ideal para sesiones cortas y entrenamiento de reflejos.",
    ],
    4: [
      `Filtra patrones cortos en ${lengthLabel}.`,
      "Perfecto para partidas relámpago sin perder intentos.",
    ],
    5: [
      `Sincronizado con la modalidad clásica de ${lengthLabel}.`,
      "Reduce opciones cuando ya tienes 2 o 3 pistas sólidas.",
    ],
    6: [
      `Detecta duplicados en ${lengthLabel}.`,
      "Sufijos comunes aparecen rápido al filtrar posiciones.",
    ],
    7: [
      `Pensado para sílabas completas de ${lengthLabel}.`,
      "Ayuda a cerrar patrones largos sin repetir letras.",
    ],
    8: [
      `Optimizado para palabras largas de ${lengthLabel}.`,
      "Útil para prefijos y sufijos extensos.",
    ],
    9: [
      `Reduce bloques grandes en ${lengthLabel}.`,
      "Filtra prefijos antes de probar nuevas letras.",
    ],
    10: [
      `Recorta terminaciones largas en ${lengthLabel}.`,
      "Gestiona letras repetidas con pocos clics.",
    ],
    11: [
      `Acorta listas extensas de ${lengthLabel}.`,
      "Detecta raíces compartidas con precisión.",
    ],
  };

  return [
    `Diccionario oficial para ${lengthLabel}.`,
    ...(highlightsByLength[length] ?? []),
    `Acceso directo a partidas y retos desde ${finderPath}.`,
  ];
};

export const getFinderSeoContent = (
  length: WordLength,
  accentMode: AccentMode,
  stats: LengthPageStats,
  formatNumber: (value: number) => string
): FinderSeoContent => {
  const lengthLabel = formatLengthLabel(length);
  const accentDescriptor = getAccentDescriptor(accentMode);
  const finderPath = getFinderPath(length);
  const accentedGamePath = getGamePath(length, "accented");
  const plainGamePath = getGamePath(length, "plain");

  const context: ContentContext = {
    length,
    lengthLabel,
    accentMode,
    accentLabel: getAccentLabel(accentMode),
    accentDescriptor,
    finderPath,
    accentedGamePath,
    plainGamePath,
    stats,
    formatNumber,
  };

  const total = formatNumberEs(stats.unique, formatNumber);

  const introByLength: Record<WordLength, string> = {
    3: `Filtra palabras de ${lengthLabel} ${accentDescriptor} para resolver partidas en minutos y entrenar reflejos.`,
    4: `El buscador de ${lengthLabel} ${accentDescriptor} te ayuda a cerrar rondas rápidas con pocos clics.`,
    5: `Reduce las ${total} opciones del diccionario oficial y encuentra la palabra de ${lengthLabel} sin gastar intentos.`,
    6: `Ajusta posiciones exactas y letras obligatorias para dominar ${lengthLabel} ${accentDescriptor}.`,
    7: `Usa el buscador de ${lengthLabel} ${accentDescriptor} cuando ya tengas un patrón parcial definido.`,
    8: `En ${lengthLabel} ${accentDescriptor}, el buscador detecta prefijos y sufijos largos en segundos.`,
    9: `Filtra bloques y raíces para acotar las palabras de ${lengthLabel} ${accentDescriptor}.`,
    10: `Combina filtros para cerrar palabras de ${lengthLabel} ${accentDescriptor} antes del último intento.`,
    11: `Reduce listas extensas de ${lengthLabel} ${accentDescriptor} con filtros precisos y rápidos.`,
  };

  const helperByLength: Record<WordLength, string> = {
    3: "Marca una vocal y prueba finales frecuentes para cerrar sílabas.",
    4: "Si hay demasiadas opciones, excluye una consonante por turno.",
    5: "El filtro reconoce Ñ y vocales con tilde sin problemas.",
    6: "Prueba duplicados cuando una letra aparece verde.",
    7: "Filtra sílabas completas cuando tengas tres letras fijas.",
    8: "Combina prefijos y sufijos para reducir listas largas.",
    9: "Ubica prefijos comunes antes de probar letras nuevas.",
    10: "Ajusta terminaciones largas para evitar repetir intentos.",
    11: "Usa raíces compartidas para reducir cientos de opciones.",
  };

  const intro = introByLength[length];
  const helper =
    accentMode === "accented"
      ? `${helperByLength[length]} El buscador reconoce vocales con tilde, diéresis y la letra Ñ.`
      : helperByLength[length];

  return {
    intro,
    helper,
    sections: finderSectionsByLength(context),
    faq: finderFaqByLength(context),
    highlights: finderHighlights(context),
  };
};
