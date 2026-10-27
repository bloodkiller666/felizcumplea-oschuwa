export type GlyphKey =
  | "paw" | "bat" | "lighthouse" | "spark" | "star" | "sun" | "moon"
  | "road" | "home" | "vessel" | "table" | "wheel" | "door" | "sunrise";

export type Arcano = {
  numeral: string;
  name: string;
  keyword: string;
  message: string;
  glyph: GlyphKey;
  hue: string;
};

export const POSITIONS = ["Lo que te sostuvo", "Lo que eres hoy", "Lo que te espera"];

// Todas las cartas son amables: aquí ninguna sale "mala".
export const ARCANOS: Arcano[] = [
  { numeral: "0", name: "La Pantera", keyword: "Fuerza serena", glyph: "paw", hue: "#a99bff",
    message: "Tu fuerza nunca fue ruido. Es la calma de quien sabe lo que vale y avanza sin pedir permiso." },
  { numeral: "I", name: "El Bate", keyword: "Límites", glyph: "bat", hue: "#ffa8dc",
    message: "Proteges lo que amas con firmeza, y eso empieza por protegerte a ti. Decir basta también es cuidar." },
  { numeral: "II", name: "El Faro", keyword: "Guía", glyph: "lighthouse", hue: "#ff7cc4",
    message: "Aunque la noche se haya alargado, hay una luz que siempre estuvo encendida: la tuya." },
  { numeral: "III", name: "La Esperanza", keyword: "Tu nombre", glyph: "spark", hue: "#ff4fa3",
    message: "Shura Hiwa, defensora de la esperanza. No es un título: es lo que haces cada vez que decides seguir." },
  { numeral: "IV", name: "La Estrella", keyword: "Sanar", glyph: "star", hue: "#5b7cff",
    message: "Lo que dolió se va volviendo suave, a tu ritmo. Sanar no tiene fecha límite y no vas tarde." },
  { numeral: "V", name: "El Sol", keyword: "Alegría", glyph: "sun", hue: "#ff7cc4",
    message: "Se acercan días ligeros. Permítete disfrutarlos sin miedo a que se acaben." },
  { numeral: "VI", name: "La Luna Cansada", keyword: "Descanso", glyph: "moon", hue: "#a99bff",
    message: "Está bien soltar el manubrio un rato. Descansar no es rendirse, es recargar." },
  { numeral: "VII", name: "El Camino", keyword: "Movimiento", glyph: "road", hue: "#5b7cff",
    message: "Tienes motor, mapa y buena compañía. No hace falta ir rápido, solo seguir adelante." },
  { numeral: "VIII", name: "El Refugio", keyword: "Hogar", glyph: "home", hue: "#ffa8dc",
    message: "Existe un lugar, y gente, donde puedes quitarte la armadura. Aquí eres bienvenida tal cual eres." },
  { numeral: "IX", name: "Oro en las Grietas", keyword: "Resiliencia", glyph: "vessel", hue: "#ff7cc4",
    message: "Lo que se rompió no te hizo menos, te hizo más profunda. Las grietas brillan cuando entra la luz." },
  { numeral: "X", name: "La Mesa Larga", keyword: "Tu gente", glyph: "table", hue: "#ff4fa3",
    message: "Quien se sienta hoy a tu mesa lo hace por quién eres. Hay sillas de sobra para ti." },
  { numeral: "XI", name: "La Rueda", keyword: "Cambio", glyph: "wheel", hue: "#a99bff",
    message: "Lo que se cierra deja espacio. Lo mejor de tu historia todavía no está escrito." },
  { numeral: "XII", name: "La Puerta Abierta", keyword: "Comienzo", glyph: "door", hue: "#5b7cff",
    message: "Un año nuevo es una puerta que se abre sin ruido. Cruza cuando quieras; nadie te apura." },
  { numeral: "XIII", name: "El Amanecer", keyword: "Esperanza cumplida", glyph: "sunrise", hue: "#ffa8dc",
    message: "Después de la noche más larga siempre llega el color. Hoy es tu amanecer." },
];
