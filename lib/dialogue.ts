// ✏️ La mini plática. Pankoki pregunta y consuela; ShuraHiwa (la jugadora) elige qué responder.

export type Tone = "abrir" | "fuerza" | "ligera";
export type EndingKey = Tone | "mix";

export const characters = {
  pankoki: { name: "Pankoki", src: "/personajes/pankoki.png", color: "#5b7cff" },
  shura: { name: "ShuraHiwa", src: "/personajes/shurahiwa.png", color: "#ff4fa3" },
} as const;

export const intro = [
  "Ey, ShuraHiwa. Siéntate un ratito conmigo, ¿sí? No hay stream, no hay prisa.",
  "Quería decirte algo: vi todo lo que cargaste este tiempo. Y no quería que lo siguieras cargando sola.",
];

export type Option = { tone: Tone; say: string; reply: string };
export type Beat = { ask: string; options: Option[] };

export const beats: Beat[] = [
  {
    ask: "¿Cómo te sientes de verdad? Y no vale decir «bien» solo por cuidarme a mí.",
    options: [
      { tone: "abrir", say: "La verdad, cansada. Pesó más de lo que dije.", reply: "Gracias por decirlo. Cansarse después de tanto es lo más humano que existe." },
      { tone: "fuerza", say: "Sigo de pie. Eso ya es bastante.", reply: "Y se nota. Pero estar de pie no siempre es estar bien, ¿verdad? Igual te cuidamos." },
      { tone: "ligera", say: "Mezcla rara: la mitad quiere llorar y la otra mitad un helado.", reply: "Jaja, aprobadas las dos mitades. Pedimos helado y lo demás también cabe." },
    ],
  },
  {
    ask: "Cuando las cosas se pusieron feas con gente en quien confiabas, ¿qué fue lo que más te dolió?",
    options: [
      { tone: "abrir", say: "Sentir que di todo y no fue suficiente para esa persona.", reply: "Eso no habla de ti. Tu corazón estaba bien puesto; esa persona no supo recibirlo." },
      { tone: "fuerza", say: "Que me hicieran dudar de quién soy.", reply: "Y aun así aquí estás, siendo tú. Esa es tu mejor respuesta." },
      { tone: "ligera", say: "Perder tiempo y energía… y hasta unos buenos memes que compartíamos.", reply: "Los memes se quedan; la gente que no suma se va. Buen intercambio, aunque doliera." },
    ],
  },
  {
    ask: "Si pudieras decirle algo a la ShuraHiwa de hace unos meses, ¿qué le dirías?",
    options: [
      { tone: "abrir", say: "Que no tenía que aguantarlo todo sola.", reply: "Eso. Pedir ayuda no te quita fuerza: te la multiplica." },
      { tone: "fuerza", say: "Que va a salir de esta, y más fuerte de lo que imagina.", reply: "Se lo diría igual. Y mira: ya lo estás cumpliendo." },
      { tone: "ligera", say: "Que apague el celular y se tome un té.", reply: "Consejo de oro. La de ahora lo agradecería muchísimo." },
    ],
  },
  {
    ask: "¿Y qué necesitas hoy, en tu cumpleaños? Lo que sea. En serio.",
    options: [
      { tone: "abrir", say: "Un abrazo largo y que me recuerden que estoy a salvo.", reply: "Abrazo largo reservado. Y estás a salvo aquí, con nosotros. Siempre." },
      { tone: "fuerza", say: "Seguir avanzando, pero con gente a mi lado.", reply: "Ahí vamos, juntos. Tú pones el rumbo y el resto va contigo." },
      { tone: "ligera", say: "Reírme sin pensar en nada. Y tarta, mucha tarta.", reply: "Eso sí es un plan de cumpleaños. Reír sin culpa también es sanar." },
    ],
  },
];

export const endings: Record<EndingKey, { title: string; lines: string[]; reflection: string }> = {
  abrir: {
    title: "Final · La puerta abierta",
    lines: ["Gracias por abrirte conmigo, de verdad.", "Que hoy lo hayas dicho en voz alta ya es una forma de soltar peso."],
    reflection:
      "Mostrar lo que sientes no te hace débil: te hace real. Quien se queda cuando te ve así es quien merece estar. Hoy no tienes que cargar sola; puedes apoyarte, y la gente que te quiere sostiene con gusto.",
  },
  fuerza: {
    title: "Final · La pantera tranquila",
    lines: ["Siempre tan firme… y aun así aquí, conversando conmigo.", "Que sepas que puedes ser fuerte y también descansar."],
    reflection:
      "Tu fuerza no necesita demostrarse ante nadie. Su versión más grande es la que también se deja acompañar. Puedes seguir de pie y, cuando haga falta, sentarte: la fuerza no se va por descansar.",
  },
  ligera: {
    title: "Final · La risa que sana",
    lines: ["Jaja, contigo hasta lo difícil se vuelve más ligero.", "Y si algún día pesa, aquí estoy para escucharte."],
    reflection:
      "Reír en medio de lo difícil no es negar el dolor: es recordarle que no manda sobre ti. Tu ligereza ilumina a los demás, y también se vale llorar cuando toque. Ambas cosas son tú.",
  },
  mix: {
    title: "Final · Un poco de todo",
    lines: ["Eres un poco de todo: abrazo, fuerza y risa.", "Y todo eso cabe en ti sin pelearse."],
    reflection:
      "Hay días para abrirte, días para sostenerte y días para reírte. Ninguna versión de ti sobra. Quien te quiere te quiere completa, con todas ellas.",
  },
};

/** El tono que más se repitió gana; si hay empate arriba, sale el final "mix". */
export function pickEnding(tones: Tone[]): EndingKey {
  const count: Record<Tone, number> = { abrir: 0, fuerza: 0, ligera: 0 };
  tones.forEach((t) => (count[t] += 1));
  const sorted = (Object.entries(count) as [Tone, number][]).sort((a, b) => b[1] - a[1]);
  return sorted[0][1] > sorted[1][1] ? sorted[0][0] : "mix";
}
