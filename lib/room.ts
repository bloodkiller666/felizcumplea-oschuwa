/*
  El cuarto: posiciones de cada aparato en el mundo 3D (px) y los textos de la PC y de la Switch.
  Eje x → derecha · y → abajo · z → hacia quien mira. La mesa tiene su superficie en y = 330.
  `ry` gira el aparato hacia el centro del cuarto; `fit` es qué tanto de la pantalla llena el aparato al enfocarlo.
*/
export type StationId = "pc" | "gba" | "tama" | "switch";

/* Medidas del cuarto (px del mundo): el piso, el techo, la pared del fondo y su ancho. */
export const FLOOR = 720;
export const CEIL = -1480; // borde de arriba de la pared: ya no hay techo visible, la pared cubre toda la pantalla
export const WALL_Z = -520;
export const WALL_W = 6000;

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

/*
  El chat del stream (simulación de Twitch). Los nombres son de cinco tipos: Pankoki#N y MotoPapu#N (el número cambia al azar
  cada vez), PankokiMod, PankokiVIP y PankokiSUB. Algunos mensajes traen una donación que sale en el panel de la izquierda.
*/
export type ChatKind = "pankoki" | "papu" | "mod" | "vip" | "sub";
export type Donation =
  | { type: "bits"; amount: number }
  | { type: "sub"; tier: 1 | 2 | 3; months: number; gift?: number }
  | { type: "kofi"; amount: number };

export const chatNames: Record<ChatKind, { base: string; numbered: boolean; color: string }> = {
  pankoki: { base: "Pankoki", numbered: true, color: "#ff8fb4" },
  papu: { base: "MotoPapu", numbered: true, color: "#ffb86b" },
  mod: { base: "PankokiMod", numbered: false, color: "#2fd46b" },
  vip: { base: "PankokiVIP", numbered: false, color: "#ff5fd0" },
  sub: { base: "PankokiSUB", numbered: false, color: "#b48cff" },
};

export const chat: { kind: ChatKind; text: string; donation?: Donation }[] = [
  { kind: "pankoki", text: "¡Holichiwa~, jefa! Entré primero para apartarte el mejor lugar del chat." },
  { kind: "papu", text: "¡FELIZ CUMPLE! ¡Shake! ¡Gang!", donation: { type: "bits", amount: 500 } },
  { kind: "papu", text: "Avisen al tomate que sigue exiliado. Orden de arriba." },
  { kind: "sub", text: "Hoy se duerme sin alarma. Es ley.", donation: { type: "sub", tier: 1, months: 14 } },
  { kind: "pankoki", text: "Todavía contamos cómo le ganaste a un Warden a puñetazos. Leyenda." },
  { kind: "vip", text: "Gracias por las risas de este año. Sé que este mes no fue fácil.", donation: { type: "kofi", amount: 5 } },
  { kind: "mod", text: "Si necesitas un hiatus, tómalo. Yo me quedo cuidando el chat… y hablando solo." },
  { kind: "papu", text: "Se nos hace un nudo en la garganta, pero lo entendemos.", donation: { type: "bits", amount: 1000 } },
  { kind: "sub", text: "Vuelve cuando quieras, aunque sea una vez al mes. Con que aparezcas, ya es fiesta.", donation: { type: "sub", tier: 1, months: 14, gift: 5 } },
  { kind: "vip", text: "(Y no, no vamos a dejar de pedirte un «Holichiwa~» en los comentarios, que lo sepas.)" },
  { kind: "pankoki", text: "Bueno, basta de llorar, que se me corre el rímel y ni maquillaje uso.", donation: { type: "bits", amount: 100 } },
  { kind: "mod", text: "¡Pide un deseo, jefa! Las velitas ya están prendidas.", donation: { type: "kofi", amount: 10 } },
];

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
  cta: "Apagar PC",
};

export const ending = {
  title: "Fin",
  text: "Hasta pronto, ShuraHiwa. El cuarto te esperará cuando quieras volver.",
  again: "Volver a entrar al cuarto",
};

/* ───────── La puerta: al entrar y al salir ───────── */
export const DOOR_Z = 3600; // la pared de la puerta, detrás de quien mira la vista general (el pasillo queda más allá)
export const DOOR_W = 360;
export const DOOR_TOP = 100; // la puerta va del piso (y = 720) hasta aquí

export const doorIntro = {
  text: "Esta es mi habitación y mi set-up, mi lugar feliz. O bueno solía serlo",
  cta: "Aceptar",
};

export const doorOutro = {
  title: "Antes de salir",
  body: [
    "Hubo un tiempo en que este cuarto lo era todo para mí: las risas, las siestas, las noches largas con el chat.",
    "Hoy cierro la puerta, no para olvidarlo, sino para cuidarme. Descansar también es una forma de seguir.",
    "Me llevo cada «Holichiwa~» conmigo. Gracias por haber estado aquí.",
  ],
  cta: "Aceptar",
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

/* ───────── Secretos del cuarto (se tocan desde la vista general) ───────── */
export type SecretFx = "wiggle" | "hop" | "twinkle";
export type SecretId = "teddy" | "bunny" | "star" | "basket" | "mirror" | "giant" | "plant" | "window";
export const secrets: { id: SecretId; label: string; text: string; fx: SecretFx; snd: "secret" | "squeak" | "hop" | "twinkle" }[] = [
  { id: "teddy", label: "Osito de peluche", text: "Se llama Señor Abrazos. Ha guardado más secretos míos que cualquier persona.", fx: "wiggle", snd: "secret" },
  { id: "bunny", label: "Conejito", text: "Dice que hoy toca sonreír, aunque sea un ratito.", fx: "hop", snd: "hop" },
  { id: "star", label: "Lámpara de estrella", text: "Se encendió una estrella. Pide un deseo, que este cuarto sí escucha.", fx: "twinkle", snd: "twinkle" },
  { id: "basket", label: "Canasta de juguetes", text: "¡Chirrido! Todavía queda un juguete que suena.", fx: "wiggle", snd: "squeak" },
  { id: "mirror", label: "Espejo del armario", text: "El espejo dice: hoy te ves feliz. (Y no miente.)", fx: "twinkle", snd: "twinkle" },
  { id: "giant", label: "Peluche gigante", text: "Reservado para los abrazos largos, de los que arreglan días enteros.", fx: "wiggle", snd: "secret" },
  { id: "plant", label: "Planta", text: "Creció un poquito esta semana. Como tú, sin hacer ruido.", fx: "wiggle", snd: "secret" },
  { id: "window", label: "Ventana", text: "La luna siempre se asoma por aquí. Sabe que este es tu lugar.", fx: "twinkle", snd: "twinkle" },
];
export const secretsDone = {
  title: "Los encontraste todos",
  text: "Los 8 secretos del cuarto. Siempre fue tuyo, y siempre vas a poder volver.",
};
