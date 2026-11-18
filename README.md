# Feliz cumpleaños, ShuraHiwa

Un regalo en forma de habitación de juegos. Una cámara en primera persona viaja entre una PC gamer, una Game Boy Advance, un tamagochi y una Nintendo Switch, y termina con una despedida cálida al amanecer.
Next.js 15 (App Router) + React 19 + TypeScript + GSAP (con CSS 3D) + Web Audio. Sin APIs externas ni archivos de audio.

## Empezar (con pnpm)

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm typecheck    # revisa tipos
pnpm build && pnpm start
```

> El proyecto bloquea `npm` y `yarn` a propósito (`only-allow pnpm`). Si no tienes pnpm: `corepack enable`.

## El recorrido

| # | Dónde | Qué pasa |
| - | --- | --- |
| 1 | PC | Encender PC, arranque, mensaje nuevo (hiatus) que se abre con el mouse, "¡Probar!", tirada de tarot, "Salir de PC" (queda encendida) |
| 2 | Game Boy Advance | Encender y jugar *Motoperro Maze*: 3 laberintos, salmón de meta y tomates que esquivar |
| 3 | Tamagochi | Cuidar a Motoperro (croquetas, paseo, caricias, siesta); al probar los cuatro se pone gorro de fiesta |
| 4 | Nintendo Switch | *Pastelería Shake*: ingredientes, mezclar, hornear en el punto dorado y decorar |
| 5 | PC otra vez | La cámara entra sola. Mensaje de un desconocido con los 3 regalos (✓ ✓ ✗) y la pregunta de dólares/Ko-fi → chat del stream → soplar velitas y repartir el pastel → mensaje de cumpleaños y despedida → créditos → "Guardar partida" → se apagan las luces y amanece |

Controles: mouse o toque en todo; el laberinto también con flechas/WASD o deslizando el dedo. Botón de sonido abajo a la derecha.

## Cómo está hecho

- **Cámara** (`lib/camera.ts`): el mundo CSS 3D se mueve en sentido contrario. Los vuelos hacen un arco con balanceo y la cámara respira y mira hacia el mouse. Enfocar un aparato lo deja a escala 1 (texto nítido) y ajusta a la pantalla (`fit` en `lib/room.ts`).
- **Cuarto** (`components/room/Scene.tsx` + `app/world.css`): pared, piso, techo, cama con el tamagochi (izquierda), estante con la GBA y la Switch (centro), escritorio con PC, torre, silla y cajones (derecha). `Room.tsx` maneja la cámara, el orden de las estaciones y el final. La posición y escala de cada aparato están en `STATIONS` de `lib/room.ts`.
- **Aparatos**: `PcStation.tsx` + `TarotWindow.tsx` + `PcEnding.tsx` (PC), `Gba.tsx` + `MazeGame.tsx` (GBA), `Tama.tsx` (tamagochi), `Switch.tsx` (Switch), `Cake.tsx` (pastel).
- **Sonidos** (`lib/sfx.ts`): sintetizados con Web Audio; arrancan al pulsar "Entrar al cuarto" y se pueden silenciar.
- **Estilos**: `app/globals.css` (tokens y botones), `app/extras.css` (cielo y partículas), `app/cozy.css` (tamagochi y pastel), `app/room.css` (aparatos y pantallas), `app/world.css` (el decorado del cuarto).

## Qué personalizar

| Qué | Dónde |
| --- | --- |
| Mensaje del hiatus, mensaje del desconocido, chat del stream, despedida, créditos, textos de guardado y de la Switch | `lib/room.ts` |
| Nombres de los regalos, pregunta y opciones de dólares, enlace de Ko-fi | `lib/content.ts` (`gifts`, `donationQuestion`, `donationOptions`, `kofiUrl`) |
| Las 14 cartas del tarot | `lib/tarot.ts` |
| Dificultad del laberinto (tomates, velocidad, atajos) | `LEVELS` en `components/room/MazeGame.tsx` |
| Posición de cada aparato y cuánto llena la pantalla al enfocarlo | `STATIONS` en `lib/room.ts` |
| Colores y tipografías | variables al inicio de `app/globals.css`; fuentes en `app/layout.tsx` |

## Pruebas rápidas (solo en desarrollo)

`?station=pc|gba|tama|switch` salta a un aparato; `&pc=desktop|msg|tarot` fija el estado de la PC; `&chapter=2` empieza el capítulo final. En el laberinto, la tecla `9` gana el juego. Nada de esto existe en la versión de producción.

## Accesibilidad y rendimiento

- Todo es operable con teclado (botones reales; el tazón de la Switch responde a Enter), con `aria-live` en mensajes y medidores.
- `prefers-reduced-motion`: los vuelos de cámara son cortes y las animaciones largas se saltan.
- Solo se anima `transform` y `opacity`; el laberinto dibuja en un canvas de 240×160; las estrellas son dos capas de baldosa.
- Primera carga ≈ 204 kB de JS.
