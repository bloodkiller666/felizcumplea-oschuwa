// ✏️ Todo el texto de la web vive aquí. Edítalo con libertad.

export const person = {
  name: "ShuraHiwa",
  meaning: "Defensora de la esperanza",
  // Pon su avatar en /public/shurahiwa.png y se mostrará en vez del dibujo de la pantera.
  avatar: "/shurahiwa.png",
  signature: "Con todo el cariño de quienes te queremos",
};

export const letter = [
  "Hoy no tienes que ser fuerte, ni resolver nada, ni demostrar nada. Hoy solo toca que te celebremos.",
  "Sabemos que el camino no siempre fue amable. Hubo decepciones que no merecías, personas que no supieron cuidarte y días en los que el cansancio pesaba más que las ganas. Nada de eso fue por algo que hicieras mal.",
  "Y aun así, aquí estás: protegiendo a otros, riendo cuando se puede y volviendo a empezar cuando hace falta. Tu nombre lo dice y tú lo cumples: defensora de la esperanza.",
  "Esta página es un lugar para descansar. No hay prisa ni juicios, y todo lo que encuentres fue hecho para que te sientas querida.",
];

export const stops = [
  { title: "Seguiste", text: "Hubo días sin ganas y los cruzaste igual. Eso también cuenta como avanzar." },
  { title: "Protegiste", text: "Cuidaste a otros con el bate en alto y el corazón abierto." },
  { title: "Soltaste", text: "Dejaste atrás lo que pesaba. Nunca fue tuyo para cargar." },
  { title: "Te reíste", text: "Encontraste motivos para reír aun cuando costaba. Esa risa es resistencia." },
  { title: "Llegaste", text: "Hoy cumples un año más de camino y sigues aquí. Bienvenida al amanecer." },
];

export const worries = [
  { worry: "Las dudas", antidote: "Tu valor no se negocia.", x: 4, y: 8 },
  { worry: "Ese mal recuerdo", antidote: "Ya pasó. Hoy estás a salvo.", x: 34, y: 3 },
  { worry: "El cansancio", antidote: "Descansar también es avanzar.", x: 64, y: 10 },
  { worry: "Promesas rotas", antidote: "Mereces gente que se quede.", x: 12, y: 40 },
  { worry: "La voz que te critica", antidote: "Hablarte con ternura también es valentía.", x: 44, y: 36 },
  { worry: "El miedo a confiar", antidote: "Confiar de nuevo, a tu ritmo, es válido.", x: 72, y: 42 },
  { worry: "La culpa ajena", antidote: "Lo que hicieron otros no es tuyo.", x: 20, y: 70 },
  { worry: "Los «¿y si…?»", antidote: "Hoy basta con este momento.", x: 58, y: 72 },
];

// ✏️ Cambia estos mensajes por los de verdad (de amigos, comunidad, etc.)
export const notes = [
  { text: "Eres de las personas más valientes que conocemos.", from: "Tu comunidad", x: 4, y: 6, r: -5, tone: "amber" },
  { text: "Gracias por cuidar a todos. Hoy nos toca cuidarte a ti.", from: "Un amigo", x: 34, y: 4, r: 3, tone: "rose" },
  { text: "Tu risa le cambia el día a cualquiera.", from: "Alguien que te admira", x: 66, y: 8, r: -2, tone: "teal" },
  { text: "No estás sola. Nunca más tienes que cargar sola.", from: "Tu gente", x: 12, y: 38, r: 4, tone: "lilac" },
  { text: "Mereces todo lo bonito que le deseas a los demás.", from: "Con cariño", x: 46, y: 36, r: -4, tone: "amber" },
  { text: "Eres suficiente, tal cual eres, hoy y siempre.", from: "Un abrazo grande", x: 72, y: 44, r: 3, tone: "rose" },
  { text: "Feliz cumpleaños, pantera. Gracias por existir.", from: "Tu equipo", x: 28, y: 66, r: -3, tone: "teal" },
];

export const finale = {
  title: "Feliz cumpleaños, ShuraHiwa",
  text: "Gracias por defender la esperanza incluso cuando costaba, y por ser tú. Que este año venga con menos peso y mucha más luz.",
  note: "Pero esta noche todavía queda algo más…",
};

// ✏️ Libro animado: portada y pie de cada ilustración (una por página de la carta)
export const bookInfo = {
  coverTitle: "Para ShuraHiwa",
  coverSub: "Un libro para leer con calma",
  captions: [
    "Esta noche, sin prisa.",
    "Las tormentas también pasan.",
    "Cada huella cuenta.",
    "Un lugar para descansar.",
  ],
};

// ✏️ Sección "Último regalo"
export const gifts = ["Carta de Cumpleaños", "Dinámica virtual Pankoki", "???"];
export const giftFinalLabel = "Despedida donativa";
export const bitOptions = ["15K de bits", "20K de bits", "25K de bits"];

// ✏️ Despedida final (la fecha de la cuenta regresiva está en components/Epilogue.tsx)
export const epilogue = {
  title: "Gracias por esta noche",
  text: "Gracias por dejarnos acompañarte en tu cumpleaños, ShuraHiwa. Gracias por tu valentía, por tu risa y por seguir aquí. Todo esto se hizo con mucho cariño para ti.",
  end: "El programa ha finalizado.",
  caption: "Cuenta regresiva hasta el 18 de diciembre de 2027",
};

// ✏️ Los cuatro actos: separadores a pantalla completa entre las secciones
export const acts = [
  {
    n: 1, roman: "I", title: "Dolor", id: "act-1",
    sub: "Antes de celebrar, miramos de frente lo que costó. Sin esconderlo y sin adornarlo.",
    marquee: "DOLOR · LO QUE PESÓ · LO QUE CALLASTE · LO QUE DOLIÓ ·",
  },
  {
    n: 2, roman: "II", title: "Reflexión", id: "act-2",
    sub: "Quedarse quieta a mirar el camino también es avanzar. ¿Qué te sostuvo? ¿Qué aprendiste?",
    marquee: "REFLEXIÓN · RESPIRA · MIRA ATRÁS · TODO TIENE SENTIDO ·",
  },
  {
    n: 3, roman: "III", title: "Resurrección", id: "act-3",
    sub: "Lo que se rompió no desapareció: se volvió luz. Aquí te levantas, a tu manera y a tu ritmo.",
    marquee: "RESURRECCIÓN · VUELVES MÁS FUERTE · LEVÁNTATE · BRILLA ·",
  },
  {
    n: 4, roman: "IV", title: "Futuro", id: "act-4",
    sub: "Lo mejor de tu historia todavía no está escrito. Hoy se abre la puerta.",
    marquee: "FUTURO · LO MEJOR VIENE · TU AMANECER · TU TURNO ·",
  },
];
