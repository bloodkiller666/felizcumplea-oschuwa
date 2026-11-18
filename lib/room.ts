/*
  El cuarto: posiciones de cada aparato en el mundo 3D (px) y los textos de la PC y de la Switch.
  Eje x → derecha · y → abajo · z → hacia quien mira. La mesa tiene su superficie en y = 330.
  `ry` gira el aparato hacia el centro del cuarto; `fit` es qué tanto de la pantalla llena el aparato al enfocarlo.
*/
export type StationId = "pc" | "gba" | "tama" | "switch";

/* Medidas del cuarto (px del mundo): el piso, el techo, la pared del fondo y su ancho. */
export const FLOOR = 720;
export const CEIL = -780;
export const WALL_Z = -520;
export const WALL_W = 5600;

/*
  Dónde está cada aparato. `k` es la escala a la que se ve en el cuarto (una consola es pequeña sobre un estante);
  al enfocarla la cámara se acerca hasta llenar `fit` de la pantalla, así que el texto sigue nítido.
  PC a la derecha (sobre el escritorio), consolas en el estante del centro, tamagochi sobre la cama de la izquierda.
*/
export const STATIONS: Record<StationId, { x: number; y: number; z: number; ry: number; rx: number; k: number; fit: number; name: string }> = {
  pc: { x: 900, y: 114, z: -280, ry: -12, rx: 0, k: 0.62, fit: 0.86, name: "la PC" },
  gba: { x: -250, y: 178, z: -380, ry: 5, rx: 0, k: 0.42, fit: 0.92, name: "la Game Boy Advance" },
  switch: { x: -250, y: 401, z: -380, ry: 5, rx: 0, k: 0.34, fit: 0.94, name: "la Nintendo Switch" },
  tama: { x: -1150, y: 355, z: -250, ry: 14, rx: 0, k: 0.5, fit: 0.94, name: "el tamagochi" },
};

/** Después de salir de un aparato, la cámara va al siguiente (de la Switch se vuelve a la PC). */
export const NEXT: Record<StationId, StationId> = { pc: "gba", gba: "tama", tama: "switch", switch: "pc" };

/* ───────── PC · capítulo 1 ───────── */
export const pcCopy = {
  boot: [
    "SHAKE-BIOS v2.7 · Motoperro Systems",
    "CPU: Pantera X9 ................ OK",
    "RAM: mucha, la suficiente ...... OK",
    "GPU: Rosa-RTX ................. OK",
    "Buscando señal del stream ...... lista",
    "Cargando recuerdos ............. ok",
  ],
  sender: "Shake Gang",
  subject: "Sobre este mes…",
  body: [
    "Hola, jefa.",
    "Este no fue tu mejor mes, y no tienes que fingir que sí.",
    "Decidiste tomar un hiatus: un descanso largo, con la puerta abierta para volver algún día, aunque ya no tan seguido como antes.",
    "Descansar también es valentía. Y como hoy es tu cumpleaños, la casa invita una tirada de suerte. ¿Quieres probar?",
  ],
  cta: "¡Probar!",
};

/* ───────── PC · capítulo 2 ───────── */
export const stranger = {
  from: "Desconocido",
  addr: "???@???",
  subject: "Antes de que termine la noche",
  body: "No sé quién soy y no importa. Solo vine a preguntar algo: ¿ya recibiste tus regalos esta noche? Márcalos.",
};

export const chat = [
  { user: "Pankoki", text: "¡Holichiwa~, jefa! Entré primero para apartarte el mejor lugar del chat.", tone: "blue" },
  { user: "ShakeGang_01", text: "¡FELIZ CUMPLE! ¡Shake! ¡Gang!", tone: "rose" },
  { user: "Motoperro_fan", text: "Avisen al tomate que sigue exiliado. Orden de arriba.", tone: "amber" },
  { user: "Siesta_Oficial", text: "Hoy se duerme sin alarma. Es ley.", tone: "lilac" },
  { user: "Warden_Slayer", text: "Todavía contamos cómo le ganaste a un Warden a puñetazos. Leyenda.", tone: "rose" },
  { user: "Anónimo", text: "Gracias por las risas de este año. Sé que este mes no fue fácil.", tone: "lilac" },
  { user: "Pankoki", text: "Si necesitas un hiatus, tómalo. Yo me quedo cuidando el chat… y hablando solo.", tone: "blue" },
  { user: "Cuenta_Nueva_44", text: "Se nos hace un nudo en la garganta, pero lo entendemos.", tone: "amber" },
  { user: "ShakeGang_01", text: "Vuelve cuando quieras, aunque sea una vez al mes. Con que aparezcas, ya es fiesta.", tone: "rose" },
  { user: "Siesta_Oficial", text: "(Y no, no vamos a dejar de pedirte un «Holichiwa~» en los comentarios, que lo sepas.)", tone: "lilac" },
  { user: "Pankoki", text: "Bueno, basta de llorar, que se me corre el rímel y ni maquillaje uso.", tone: "blue" },
  { user: "Mod_Salmón", text: "¡Pide un deseo, jefa! Las velitas ya están prendidas.", tone: "amber" },
] as const;

export const farewell = {
  title: "Feliz cumpleaños… y hasta pronto",
  body: [
    "Feliz cumpleaños, jefa. Hoy cumples un año más y, aunque cueste decirlo, también nos toca despedirnos por un tiempo.",
    "Duele, no te lo vamos a esconder. El chat se siente raro sin tu «Holichiwa~», y ya estamos practicando eso de «no soy un gato» a oscuras, como terapia.",
    "Pero lo entendemos. Descansar no es abandonar: es cuidar lo que eres para poder volver, aunque sea más despacio. Tómate tu hiatus sin culpa; el stream no se apaga, solo espera.",
    "Dejamos tu silla calientita, la tele prendida en tu canal y a Motoperro de guardia. Si algún día pasas por aquí con ganas, la puerta no tiene llave… y el salmón ahumado sigue en el refri.",
    "Y no te hagas la interesante: sabemos que vas a volver al primer meme malo que veas.",
    "Gracias por cada risa, cada siesta transmitida sin querer y cada vez que defendiste la esperanza cuando costaba. Te queremos. Mucho más de lo que cabe en un chat.",
  ],
  sign: "— Shake Gang, con el corazón hecho nudo y un pastel a medias",
  cta: "Ver los créditos",
};

export const credits: { role: string; name: string }[] = [
  { role: "Dirección de cariño", name: "Shake Gang" },
  { role: "Estrella del stream", name: "ShuraHiwa" },
  { role: "Siestas y puñetazos a Wardens", name: "ShuraHiwa" },
  { role: "Mascota oficial y guardia de la silla", name: "Motoperro" },
  { role: "Jefe del exilio de tomates", name: "Pankoki" },
  { role: "Voz de «¡Shake!» y «¡Gang!»", name: "Todo el chat" },
  { role: "Postre", name: "Horneado por ti, en la Switch" },
  { role: "Salmón ahumado", name: "El proveedor de siempre" },
  { role: "Música de fondo", name: "Un «Holichiwa~» muy bajito" },
  { role: "Con todo el cariño de", name: "Quienes te queremos" },
];

export const save = {
  title: "Guardar partida",
  slot: "Archivo 1 · ShuraHiwa",
  stats: ["Nivel: un año más de camino", "Tiempo de juego: toda una noche", "Compañeros: Shake Gang, Pankoki y Motoperro"],
  cta: "Guardar",
  saved: "¡Partida guardada!",
  cont: "Continuar…",
  note: "Cuando quieras volver, aquí estaremos.",
};

export const ending = {
  title: "Hasta pronto, ShuraHiwa",
  text: "El stream no se apaga. Solo espera a que amanezca.",
  again: "Volver a entrar al cuarto",
};

/* ───────── Switch · hornear el postre ───────── */
export const bake = {
  game: "Pastelería Shake",
  logo: "SHAKE SWITCH",
  step1: { title: "1 · Ingredientes", hint: "Toca cada ingrediente para echarlo al tazón." },
  step2: { title: "2 · A mezclar", hint: "Gira el dedo (o el mouse) en círculos sobre el tazón. También puedes tocarlo." },
  step3: { title: "3 · Al horno", hint: "Mete el pastel y sácalo cuando esté dorado." },
  step4: { title: "4 · Decorar", hint: "Toca cada adorno para ponerlo sobre el pastel." },
  ingredients: ["Harina", "Huevos", "Azúcar"],
  toppings: ["Crema", "Fresas", "Chispas", "Velitas"],
  raw: "Todavía está crudo. ¡Espera un poco más!",
  burnt: "¡Casi se quema! Otra vez.",
  perfect: "¡Dorado perfecto!",
  done: "¡Pastel listo!",
  doneText: "Se lo llevamos a la fiesta de esta noche.",
  exit: "Salir de la Switch",
};
