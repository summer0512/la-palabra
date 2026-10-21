import type { WordLength } from "@/constants/wordlist-metadata";
import { formatLengthLabel, getFinderPath, getGamePath } from "@/lib/length-pages";

export type GuideOpeningGroup = {
  title: string;
  words: string[];
  description: string;
};

export type GuideSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

export type GuideFaq = {
  question: string;
  answer: string;
};

export type LengthGuideContent = {
  title: string;
  description: string;
  openingTitle: string;
  openingIntro: string;
  openingGroups: GuideOpeningGroup[];
  sections: GuideSection[];
  faq: GuideFaq[];
  links: Array<{ href: string; label: string; description: string }>;
};

export const getGuideCopy = (length: WordLength) => {
  const lengthLabel = formatLengthLabel(length);
  return {
    title: `Guia de ${lengthLabel}: estrategias y aperturas | La Palabra del Dia`,
    description: `Consejos practicos para jugar palabras de ${lengthLabel}. Aperturas, lectura del tablero y cierre en 6 intentos.`,
    keywords: [
      `guia palabra ${lengthLabel}`,
      `estrategias ${lengthLabel}`,
      `aperturas ${lengthLabel}`,
      `consejos wordle ${lengthLabel}`,
    ],
    heading: `Guia de palabras de ${lengthLabel}`,
    subheading: `Estrategias claras, aperturas recomendadas y tecnicas de cierre para ${lengthLabel}.`,
  };
};

const openingGroupsByLength: Record<WordLength, GuideOpeningGroup[]> = {
  3: [
    {
      title: "Vocales basicas en dos turnos",
      words: ["SOL", "MAR", "LUZ"],
      description: "Tres palabras cortas para descubrir vocales distintas y consonantes frecuentes.",
    },
    {
      title: "Consonantes de uso diario",
      words: ["PAN", "SAL", "RIO"],
      description: "Confirma S, L, N y R con el menor numero de repeticiones.",
    },
    {
      title: "Cobertura rapida",
      words: ["TAL", "SER", "FIN"],
      description: "Apertura agresiva para detectar patrones de silaba.",
    },
    {
      title: "Tildes y la ene",
      words: ["A\u00d1O", "U\u00d1A", "A\u00daN"],
      description: "En modo sin acentos, compara con ANO, UNA y AUN para detectar letras especiales.",
    },
  ],
  4: [
    {
      title: "Apertura equilibrada",
      words: ["CASA", "LUNA", "PESO", "RUTA"],
      description: "Combina vocales abiertas y consonantes suaves en un solo bloque.",
    },
    {
      title: "Consonantes frecuentes",
      words: ["CINE", "MESA", "PALO", "NIDO"],
      description: "Ideal para fijar L, N y D en posiciones tempranas.",
    },
    {
      title: "Patrones de silaba",
      words: ["FARO", "TREN", "SALA", "VINO"],
      description: "Abre combinaciones CV y VC comunes en cuatro letras.",
    },
    {
      title: "N y tildes",
      words: ["CA\u00d1A", "A\u00d1OS", "R\u00cdAN"],
      description: "En modo sin acentos, compara con CANA, ANOS y RIAN para confirmar letras especiales.",
    },
  ],
  5: [
    {
      title: "Clasicos de 5 letras",
      words: ["AUDIO", "LENTO", "CIELO", "PASTA"],
      description: "Cubren las cinco vocales y consonantes frecuentes en dos intentos.",
    },
    {
      title: "Combinaciones populares",
      words: ["SANTO", "CALOR", "RIEGO", "TRINO"],
      description: "Perfectas para validar R, S, T y N antes del tercer intento.",
    },
    {
      title: "Cobertura de inicio",
      words: ["NORTE", "SALIR", "CAMPO", "VERDE"],
      description: "Abren el tablero con consonantes de uso diario y vocales abiertas.",
    },
    {
      title: "Tildes frecuentes",
      words: ["AVION", "ARBOL", "FACIL", "JAMON"],
      description: "En modo con acentos, compara con AVI\u00d3N, \u00c1RBOL, F\u00c1CIL y JAM\u00d3N.",
    },
  ],
  6: [
    {
      title: "Aperturas con vocales fuertes",
      words: ["TIEMPO", "LENTES", "SALTAR", "CAMINO"],
      description: "Mezclan vocales variadas y consonantes de uso diario.",
    },
    {
      title: "Consonantes de soporte",
      words: ["PLANES", "RONDAS", "CUERDA", "CARTAS"],
      description: "Ayudan a validar R, N y D cuando el patron empieza a cerrarse.",
    },
    {
      title: "Apertura agresiva",
      words: ["GRITOS", "BLOQUE", "FRANCO", "SEGURA"],
      description: "Introduce consonantes fuertes para descartar rapido.",
    },
    {
      title: "Tildes utiles",
      words: ["MUSICA", "UTILES", "ARBITO", "CESPED"],
      description: "En modo con acentos, alterna con M\u00daSICA, \u00daTILES, \u00c1RBITO y C\u00c9SPED.",
    },
  ],
  7: [
    {
      title: "Ritmo equilibrado",
      words: ["PALABRA", "CAMINOS", "VENTANA", "MENSAJE"],
      description: "Apertura con vocales repetidas y consonantes claras.",
    },
    {
      title: "Alternativas de consonantes",
      words: ["CANTARO", "SINCERO", "FORMATO", "PINTURA"],
      description: "Confirma R, N y T en posiciones medias.",
    },
    {
      title: "Estructuras comunes",
      words: ["NATURAL", "VALORES", "CULTIVO", "DOMINGO"],
      description: "Ayudan a detectar terminaciones tipicas en siete letras.",
    },
    {
      title: "Tildes y ene",
      words: ["CANCION", "NAUTICO", "SECCION", "METRICA"],
      description: "En modo con acentos, usa CANCI\u00d3N, N\u00c1UTICO, SECCI\u00d3N y M\u00c9TRICA.",
    },
  ],
  8: [
    {
      title: "Cobertura completa",
      words: ["PREGUNTA", "PALABRAS", "ESTACION", "CARACTER"],
      description: "Combinan vocales con consonantes de uso frecuente en partidas largas.",
    },
    {
      title: "Consonantes de cierre",
      words: ["RECUERDO", "SERVICIO", "VENTANAS", "HISTORIA"],
      description: "Utiles para confirmar R, C y S cuando ya hay pistas verdes.",
    },
    {
      title: "Prefijos comunes",
      words: ["DESCUBRE", "COMIENZO", "REUNIDOS", "COMPARTE"],
      description: "Aperturas que ayudan a detectar prefijos como RE- y COM-.",
    },
    {
      title: "Tildes frecuentes",
      words: ["RELACION", "CONEXION", "DECISION", "CREACION"],
      description: "En modo con acentos, prueba RELACI\u00d3N, CONEXI\u00d3N, DECISI\u00d3N y CREACI\u00d3N.",
    },
  ],
  9: [
    {
      title: "Aperturas para 9 letras",
      words: ["HISTORIAS", "PREGUNTAS", "MARIPOSAS", "CAMINANDO"],
      description: "Cubren vocales abiertas y consonantes suaves en dos intentos.",
    },
    {
      title: "Estructuras largas",
      words: ["DESCUBRIR", "SOBRESALE", "ENCUENTRA", "FINALISTA"],
      description: "Ayudan a detectar prefijos y sufijos frecuentes.",
    },
    {
      title: "Cobertura de medios",
      words: ["SITUACION", "RECUERDOS", "CONVIERTE", "EDIFICIOS"],
      description: "Ideales para probar letras en el centro de la palabra.",
    },
    {
      title: "Tildes estrategicas",
      words: ["EDUCACION", "INSPIRADO", "PROPOSITO", "SENSACION"],
      description: "En modo con acentos, alterna con EDUCACI\u00d3N, PROP\u00d3SITO y SENSACI\u00d3N.",
    },
  ],
  10: [
    {
      title: "Cobertura amplia",
      words: ["ESTUDIANTE", "CONTENIDOS", "DIFERENTES", "TRABAJAMOS"],
      description: "Cubren casi todas las vocales y consonantes mas usadas.",
    },
    {
      title: "Refuerzo de consonantes",
      words: ["COMENTARIO", "ESTACIONES", "CONTADORES", "RELACIONES"],
      description: "Sirven para validar letras intermedias cuando el patron es largo.",
    },
    {
      title: "Bloques de ataque",
      words: ["APROVECHAR", "CONSTRUIDO", "PRESENTADO", "PRONUNCIAR"],
      description: "Aperturas para detectar prefijos y sufijos comunes.",
    },
    {
      title: "Tildes finales",
      words: ["APLICACION", "REPARACION", "PERFECCION"],
      description: "En modo con acentos, usa APLICACI\u00d3N, REPARACI\u00d3N y PERFECCI\u00d3N.",
    },
  ],
  11: [
    {
      title: "Aperturas para expertos",
      words: ["INFORMACION", "APRENDIZAJE", "TRANSFORMAR", "ENTRETENIDO"],
      description: "Detectan vocales y consonantes clave en una sola secuencia.",
    },
    {
      title: "Consonantes de cierre",
      words: ["HERRAMIENTA", "JUGABILIDAD", "PRESUPUESTO", "ORDENADORES"],
      description: "Perfectas para confirmar letras repetidas en palabras largas.",
    },
    {
      title: "Prefijos dominantes",
      words: ["RECONOCERIA", "CONSTRUCTOR", "REPLANTEADO", "ACTUALIZADO"],
      description: "Ayudan a reconocer estructuras con RE-, CON- y -DOR.",
    },
    {
      title: "Tildes extensas",
      words: ["INFORMACION", "DECLARACION", "ORIENTACION"],
      description: "En modo con acentos, alterna con INFORMACI\u00d3N, DECLARACI\u00d3N y ORIENTACI\u00d3N.",
    },
  ],
};

const sectionsByLength: Record<WordLength, GuideSection[]> = {
  3: [
    {
      title: "Ventaja del modo corto",
      paragraphs: [
        "Con 3 letras, cada intento aporta mucha informacion. Prioriza vocales y consonantes comunes para cerrar rapido.",
      ],
      bullets: [
        "Busca estructuras CV o VC en los dos primeros intentos.",
        "Si aparece una vocal amarilla, prueba su posicion final.",
      ],
    },
    {
      title: "Patrones que se repiten",
      paragraphs: [
        "Las terminaciones en L, N y R dominan muchas soluciones cortas.",
        "Tambien aparecen articulos o formas verbales simples; reconoce esas siluetas rapido.",
      ],
      bullets: [
        "Alterna L y R cuando ya tengas una vocal confirmada.",
        "No repitas consonantes descartadas: el margen es minimo.",
      ],
    },
    {
      title: "Cierre en 6 intentos",
      paragraphs: [
        "Si llegas al cuarto intento, cambia a palabras de prueba con letras nuevas.",
      ],
    },
    {
      title: "Errores comunes",
      paragraphs: ["Evita gastar intentos en patrones repetidos cuando el tablero es corto."],
      bullets: [
        "Repetir consonantes grises sin necesidad.",
        "Ignorar la vocal final cuando ya salio amarilla.",
      ],
    },
  ],
  4: [
    {
      title: "Lectura rapida del tablero",
      paragraphs: [
        "En 4 letras, la velocidad manda. Un solo intento puede revelar medio patron.",
      ],
      bullets: [
        "Abre con dos vocales distintas para acelerar la lectura.",
        "Introduce consonantes suaves (L, N, R) en el segundo intento.",
      ],
    },
    {
      title: "Siluetas comunes",
      paragraphs: ["Muchas palabras de cuatro letras terminan en A u O."],
      bullets: ["Si la vocal final sale amarilla, prueba moverla al ultimo lugar."],
    },
    {
      title: "Errores tipicos",
      paragraphs: ["Repetir letras grises es el error mas comun en este formato."],
    },
    {
      title: "Errores comunes",
      paragraphs: ["La clave es abrir letras nuevas y mover las vocales amarillas."],
      bullets: [
        "Usar palabras con letras repetidas demasiado pronto.",
        "No desplazar vocales amarillas a otra posicion.",
      ],
    },
  ],
  5: [
    {
      title: "El formato clasico",
      paragraphs: [
        "Cinco letras es el formato mas jugado. Una apertura equilibrada suele definir la partida.",
      ],
      bullets: [
        "Alterna palabras con muchas vocales y luego consonantes fuertes.",
        "Si aparece la ene, prueba combinaciones con N y \u00d1 por separado.",
      ],
    },
    {
      title: "Control de intentos",
      paragraphs: ["Despues del tercer intento, usa palabras de limpieza para descartar letras."],
      bullets: ["Evita fijarte demasiado en una sola hipotesis si faltan vocales."],
    },
    {
      title: "Cierra con metodo",
      paragraphs: ["En el quinto intento, decide si confirmas posiciones o buscas nuevas letras."],
    },
    {
      title: "Errores comunes",
      paragraphs: ["Cuando el tablero no avanza, el error suele ser insistir en la misma hipotesis."],
      bullets: [
        "Repetir combinaciones parecidas sin nuevas letras.",
        "No probar la \\u00d1 cuando falta una consonante clara.",
      ],
    },
  ],
  6: [
    {
      title: "Pensar en silabas",
      paragraphs: [
        "Seis letras permiten dividir la palabra en bloques. Las silabas comunes aceleran el acierto.",
      ],
      bullets: ["Busca prefijos como RE-, DES- o PRO-."],
    },
    {
      title: "Repeticiones frecuentes",
      paragraphs: ["Las dobles consonantes aparecen mas seguido: LL, RR o NN."],
      bullets: ["Si una letra sale verde, confirma si se repite en otra posicion."],
    },
    {
      title: "Plan de cierre",
      paragraphs: ["Usa el buscador cuando tengas 3 letras fijas para reducir opciones."],
    },
    {
      title: "Errores comunes",
      paragraphs: ["En seis letras, los fallos vienen de no validar duplicados a tiempo."],
      bullets: [
        "No comprobar letras dobles cuando aparece una verde.",
        "Abrir con palabras demasiado parecidas entre si.",
      ],
    },
  ],
  7: [
    {
      title: "Ritmo medio",
      paragraphs: [
        "Siete letras equilibran dificultad y lectura. La paciencia es clave.",
      ],
      bullets: ["Alterna vocales abiertas y cerradas en los dos primeros intentos."],
    },
    {
      title: "Prefijos y sufijos",
      paragraphs: [
        "Empiezan a dominar terminaciones como -MENTE, -ACION o -ARIO.",
        "Una vez detectas una terminacion probable, valida el inicio con letras nuevas.",
      ],
      bullets: ["Si aparece una O amarilla, prueba finales -OR o -ON."],
    },
    {
      title: "Evita bloqueos",
      paragraphs: ["No te aferres a una sola estructura si quedan muchas opciones."],
    },
    {
      title: "Errores comunes",
      paragraphs: ["Las palabras largas exigen flexibilidad y cambios de plan."],
      bullets: [
        "Forzar terminaciones sin pistas claras.",
        "No alternar vocales abiertas y cerradas al inicio.",
      ],
    },
  ],
  8: [
    {
      title: "Palabras largas con sentido",
      paragraphs: [
        "Ocho letras requieren pensar en palabras completas, no solo letras sueltas.",
      ],
      bullets: ["Detecta prefijos como INTER- o SOBRE- si aparecen letras consecutivas."],
    },
    {
      title: "Vocales repetidas",
      paragraphs: ["Las vocales dobles son comunes en palabras largas."],
      bullets: ["Si una vocal aparece amarilla, prueba ubicarla dos veces."],
    },
    {
      title: "Estrategia avanzada",
      paragraphs: ["El modo infinito es ideal para memorizar patrones de ocho letras."],
    },
    {
      title: "Errores comunes",
      paragraphs: ["En 8 letras, el exceso de consonantes raras suele bloquear."],
      bullets: [
        "Repetir letras poco frecuentes sin confirmacion.",
        "Ignorar prefijos y sufijos cuando ya hay vocales verdes.",
      ],
    },
  ],
  9: [
    {
      title: "Bloques de lectura",
      paragraphs: [
        "Divide la palabra en 3 silabas para reducir el ruido. Cada intento debe validar un bloque.",
      ],
      bullets: ["Prefijos como CON- y DES- ayudan a fijar el inicio."],
    },
    {
      title: "Terminaciones dominantes",
      paragraphs: ["Sufijos como -MENTO, -ACION y -AMIENTO son frecuentes."],
      bullets: ["Si tienes dos vocales verdes, prueba consonantes medias como N o R."],
    },
    {
      title: "Cierre tactico",
      paragraphs: ["Antes del sexto intento, usa el buscador para confirmar la opcion real."],
    },
    {
      title: "Errores comunes",
      paragraphs: ["Los fallos mas comunes vienen de no trabajar por bloques."],
      bullets: [
        "Probar letras nuevas demasiado tarde.",
        "No fijar un prefijo cuando ya hay dos letras seguidas.",
      ],
    },
  ],
  10: [
    {
      title: "Planificacion por bloques",
      paragraphs: [
        "En 10 letras, planifica en bloques de 2 o 3 silabas. La apertura debe ser eficiente.",
      ],
      bullets: ["Combina una palabra de vocales con otra de consonantes fuertes."],
    },
    {
      title: "Sufijos y prefijos",
      paragraphs: ["-DOR, -CION, -ABLE y -MENTE se repiten mucho."],
      bullets: ["Si la ultima vocal sale amarilla, prueba primero la version con tilde."],
    },
    {
      title: "No desperdicies intentos",
      paragraphs: ["Evita repetir letras grises. Cada intento debe abrir letras nuevas."],
    },
    {
      title: "Errores comunes",
      paragraphs: ["Las palabras de 10 letras castigan la indecision."],
      bullets: [
        "Repetir letras grises por falta de plan.",
        "No fijar terminaciones largas cuando ya hay pistas verdes.",
      ],
    },
  ],
  11: [
    {
      title: "Mentalidad de palabras largas",
      paragraphs: [
        "Once letras requieren paciencia y lectura de patrones. Un solo error cuesta mucho.",
        "Piensa en la palabra como dos bloques y confirma cada bloque por separado.",
      ],
      bullets: ["Detecta raices como -FORM-, -INFO- o -MENT- para acotar."],
    },
    {
      title: "Repeticiones y dobles",
      paragraphs: ["Las consonantes duplicadas aparecen mas seguido de lo que parece."],
      bullets: ["Si una letra sale verde, confirma si se repite en otra posicion."],
    },
    {
      title: "Cierre con buscador",
      paragraphs: ["Con 4 letras fijas, el buscador reduce la lista a pocas opciones."],
    },
    {
      title: "Errores comunes",
      paragraphs: ["A esta longitud, la estrategia pesa mas que la intuicion."],
      bullets: [
        "No usar el buscador cuando ya hay 4 letras confirmadas.",
        "Ignorar raices compartidas y repetir intentos similares.",
      ],
    },
  ],
};

const faqByLength: Record<WordLength, GuideFaq[]> = {
  3: [
    {
      question: "Cual es la mejor primera palabra para 3 letras?",
      answer: "Elige palabras que cubran vocales distintas, como SOL o MAR, y ajusta segun las pistas.",
    },
    {
      question: "Vale la pena usar la ene?",
      answer: "Si no aparecen vocales en el primer intento, probar \u00d1 puede desbloquear varias opciones.",
    },
    {
      question: "Cuantos intentos deberia necesitar?",
      answer: "Lo habitual es resolver en 3 o 4 intentos si la apertura es buena.",
    },
  ],
  4: [
    {
      question: "Que cambia respecto a 5 letras?",
      answer: "El tablero se cierra mas rapido, asi que cada intento debe cubrir letras nuevas.",
    },
    {
      question: "Debo usar palabras con doble letra?",
      answer: "Solo si ya tienes una consonante confirmada; de lo contrario pierdes cobertura.",
    },
    {
      question: "Como usar el quinto intento?",
      answer: "En 4 letras, intenta cerrar antes del quinto. Si no, usa el buscador para filtrar.",
    },
  ],
  5: [
    {
      question: "Cual es la mejor apertura para 5 letras?",
      answer: "AUDIO, LENTO o CIELO cubren vocales y consonantes comunes en dos turnos.",
    },
    {
      question: "Cuando introducir la letra \u00d1?",
      answer: "Si el segundo intento no revela vocales nuevas, introducir \u00d1 puede ahorrar intentos.",
    },
    {
      question: "Necesito usar el buscador?",
      answer: "No es obligatorio, pero ayuda a reducir opciones cuando llegas al cuarto intento.",
    },
  ],
  6: [
    {
      question: "Como manejar palabras largas con dobles consonantes?",
      answer: "Si una consonante aparece verde, prueba duplicarla en otra posicion antes del cuarto intento.",
    },
    {
      question: "Que prefijos son mas utiles?",
      answer: "RE-, DES- y PRO- aparecen con frecuencia en palabras de seis letras.",
    },
    {
      question: "Cuantas vocales debo probar?",
      answer: "Intenta cubrir al menos 3 vocales en los primeros dos turnos.",
    },
  ],
  7: [
    {
      question: "Hay un patron fijo para 7 letras?",
      answer: "No, pero las terminaciones -MENTE y -ARIO aparecen mas de lo normal.",
    },
    {
      question: "Como evitar estancarme?",
      answer: "Si en el tercer intento solo tienes una letra verde, cambia completamente la apertura.",
    },
    {
      question: "Que hago con vocales amarillas?",
      answer: "Prueba moverlas a extremos, porque en siete letras suele haber vocales abiertas al final.",
    },
  ],
  8: [
    {
      question: "Son mas dificiles las palabras de 8 letras?",
      answer: "Si, porque hay mas combinaciones. Por eso conviene abrir con palabras largas y equilibradas.",
    },
    {
      question: "Cuando debo usar el modo infinito?",
      answer: "Antes de la palabra diaria, para practicar patrones de ocho letras sin presion.",
    },
    {
      question: "Como detectar prefijos?",
      answer: "Si las dos primeras letras salen verdes, prueba prefijos comunes como RE- o IN-.",
    },
  ],
  9: [
    {
      question: "Que estrategia funciona mejor en 9 letras?",
      answer: "Pensar en bloques silabicos y confirmar prefijos o sufijos antes del cuarto intento.",
    },
    {
      question: "Como uso el buscador sin arruinar la partida?",
      answer: "Utilizalo solo cuando tengas 3 letras fijas y quieras reducir posibilidades.",
    },
    {
      question: "Debo priorizar vocales o consonantes?",
      answer: "Primero vocales, luego consonantes fuertes como R, N y L.",
    },
  ],
  10: [
    {
      question: "Por que conviene abrir con dos palabras?",
      answer: "Porque necesitas cubrir la mayoria de vocales antes del tercer intento.",
    },
    {
      question: "Que sufijos son mas frecuentes?",
      answer: "-CION, -MENTE y -ABLE aparecen con frecuencia en palabras largas.",
    },
    {
      question: "Es recomendable repetir letras?",
      answer: "Solo si ya tienes una pista verde. En general es mejor abrir nuevas letras.",
    },
  ],
  11: [
    {
      question: "Como reducir el numero de opciones?",
      answer: "Detecta raices como -FORM- o -INFO- y usa el buscador cuando tengas 4 letras fijas.",
    },
    {
      question: "Que hacer si el tablero se bloquea?",
      answer: "Cambia a una palabra de prueba con letras totalmente nuevas antes del quinto intento.",
    },
    {
      question: "Cuantas vocales deberia cubrir?",
      answer: "Al menos cuatro vocales en los dos primeros intentos para evitar sorpresas.",
    },
  ],
};

export const getLengthGuideContent = (length: WordLength): LengthGuideContent => {
  const lengthLabel = formatLengthLabel(length);
  return {
    title: `Guia estrategica para palabras de ${lengthLabel}`,
    description: `Guia practica con aperturas recomendadas, tecnicas de 6 intentos y consejos para ${lengthLabel}.`,
    openingTitle: "Aperturas recomendadas",
    openingIntro:
      "Elige una de estas combinaciones para cubrir vocales y consonantes comunes antes del tercer intento.",
    openingGroups: openingGroupsByLength[length],
    sections: sectionsByLength[length],
    faq: faqByLength[length],
    links: [
      {
        href: getGamePath(length, "plain"),
        label: "Jugar sin acentos",
        description: `Practica el modo diario e infinito con ${lengthLabel} sin acentos.`,
      },
      {
        href: getGamePath(length, "accented"),
        label: "Jugar con acentos",
        description: `Entrena con tildes y dieresis en ${lengthLabel}.`,
      },
      {
        href: getFinderPath(length),
        label: "Buscador de palabras",
        description: `Filtra letras y reduce opciones para ${lengthLabel}.`,
      },
      {
        href: "/guia-palabra",
        label: "Guia general",
        description: "Explora consejos generales, modos de juego y recursos adicionales.",
      },
    ],
  };
};
