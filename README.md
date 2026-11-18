# Feliz cumpleaños, ShuraHiwa

Un regalo en forma de habitación de juegos. Una cámara en primera persona entra por una puerta a un cuarto, viaja entre una PC gamer, una Game Boy Advance, un tamagochi y una Nintendo Switch, y termina con una despedida: se apaga la PC, se sale por la puerta y se cierra.
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
| 0 | Puerta | La cámara se acerca a una puerta cerrada en el pasillo, se abre y aparece el mensaje «Esta es mi habitación y mi set-up…» con un botón Aceptar; luego entra al cuarto |
| 1 | PC | Encender PC, arranque, mensaje nuevo (hiatus) que se abre con el mouse, "¡Probar!", tirada de tarot, "Salir de PC" (queda encendida) |
| 2 | Game Boy Advance | Encender y jugar *Motoperro Maze*: 3 laberintos, salmón de meta y tomates que esquivar |
| 3 | Tamagochi | Cuidar a Motoperro (croquetas, paseo, caricias, siesta); al probar los cuatro se pone gorro de fiesta |
| 4 | Nintendo Switch | *Pastelería Shake*: ingredientes, mezclar, hornear en el punto dorado y decorar |
| 5 | PC otra vez | La cámara entra sola. Mensaje de un desconocido con los 3 regalos (✓ ✓ ✗) y la pregunta de dólares/Ko-fi → chat del stream → soplar velitas y repartir el pastel → mensaje de cumpleaños y despedida → botón «Apagar PC» |
| 6 | La puerta | La cámara retrocede, gira despacio hacia la puerta, camina hasta ella y muestra un cuadro de reflexión (Aceptar); sale, se da la vuelta, cierra la puerta y termina en «Fin» |

Controles: mouse o toque en todo; el laberinto también con flechas/WASD o deslizando el dedo. Botón de sonido abajo a la derecha.

## Cómo está hecho

- **Cámara** (`lib/camera.ts`): el mundo CSS 3D se mueve en sentido contrario. Al entrar a un aparato la cámara camina en línea recta (estilo Doom, con pasos); al salir retrocede y gira despacio sobre su eje, con la pantalla oscureciéndose (estilo FNaF 4), y camina recto al siguiente. Además respira y mira hacia el mouse. Enfocar un aparato lo deja a escala 1 (texto nítido) y ajusta a la pantalla (`fit` en `lib/room.ts`).
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

## Rendimiento (PCs sin gráfica)

`lib/perf.ts` elige un nivel al empezar y sube de nivel solo si los fps medidos bajan de ~40: **0** completo, **1** ligero (`html.lite`: sin grano ni parpadeos de neón, la cámara no "respira") y **2** mínimo (`html.ultra`: sin sombras del decorado, piso plano y animación a 30 fps). Se puede forzar con `?perf=0`, `?perf=1` o `?perf=2`. Además el cuarto solo dibuja lo que se ve en cada momento (`data-zone` en `.stage`: pasillo, cuarto o ambos). Los estilos están en `app/lite.css`.

## Música, secretos y hora real

- **Música por aparato** (`lib/music.ts`): se compone en el navegador con Web Audio, sin archivos. Cada aparato tiene su pista y hay crossfade al cambiar: cuarto y PC (lo-fi), GBA (chiptune), Switch (marimba), Tamagotchi (pitidos) y despedida (pad lento). Respeta el botón de silencio y se pausa con la pestaña oculta.
- **Intros de consola**: GBA (logo que baja, destello de colores y campanita) y Switch (Joy-Con azul y rojo que se juntan). Los sonidos están en `lib/sfx.ts` (`gbaBoot`, `switchBoot`).
- **Secretos**: el botón "Mirar el cuarto" (en cualquier aparato) abre una vista amplia con flechas. Hay 8 objetos que se tocan; se guardan en `localStorage` (`shurahiwa-secrets`). Los textos están en `secrets` de `lib/room.ts`.
- **Hora real**: de 6:00 a 18:00 es de día, de 18:00 a 20:00 tarde y el resto noche (ventana, luz, saludo, reloj de pared y reloj de la Switch). En desarrollo se fuerza con `?tod=day|dusk|night`.
