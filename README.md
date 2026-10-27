# Feliz cumpleaños, ShuraHiwa

Una noche en carretera que termina en amanecer. Next.js 15 (App Router) + React 19 + TypeScript + GSAP 3.15 (ScrollTrigger, SplitText, DrawSVG, MorphSVG, Physics2D, CustomEase…) + Lenis (scroll suave) + canvas-confetti.

## Empezar (con pnpm)

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm typecheck    # revisa tipos
pnpm build && pnpm start
```

> El proyecto bloquea `npm` y `yarn` a propósito (`only-allow pnpm`).
> Si no tienes pnpm: `corepack enable` y listo.

## Cómo avanza la experiencia

Las secciones nuevas **no existen** hasta que se desbloquean, así que no se puede hacer scroll hacia ellas:

1. **Portada** → botón "Empezar el recorrido": las letras salen disparadas, zarpazos de pantera y un iris que se abre como un faro.
2. **Libro** → botón "Seguir al Tarot": el libro se aleja y caen tiras de papel que cubren y descubren la pantalla.
3. **Tarot, ruta, batazo, muro, plática y "Feliz cumpleaños"** se recorren con scroll libre.
4. **"Último regalo"** (único botón de la sección de cumpleaños): temblor creciente, latido rojo y destello.
5. **Regalos** → al marcar los dos primeros, el tercero se marca solo con una X roja; aparece el modal de bits; al aceptar pasa a "Despedida donativa" con check verde y un amanecer lleva a la despedida.
6. **Despedida**: cuenta regresiva al 18 de diciembre de 2027. Ya no hay vuelta atrás.

## Los cuatro actos

Dolor → Reflexión → Resurrección → Futuro. Cada acto tiene un separador a pantalla completa (`components/ActBreak.tsx`, textos en `acts` de `lib/content.ts`) y cambia el cielo, la aurora y las brasas del fondo (`ACTS` en `components/Atmosphere.tsx`).

## Qué personalizar

| Qué | Dónde |
| --- | --- |
| Textos del libro, muro, burbujas, ruta, cumpleaños, regalos y despedida | `lib/content.ts` |
| La plática (preguntas, respuestas, finales reflexivos) | `lib/dialogue.ts` |
| PNG de los personajes de la plática | `public/personajes/pankoki.png` y `public/personajes/shurahiwa.png` |
| Opciones de bits y nombres de los regalos | `lib/content.ts` (`gifts`, `bitOptions`) |
| Fecha de la cuenta regresiva | `components/Epilogue.tsx` (`TARGET`) |
| Las 14 cartas del tarot | `lib/tarot.ts` |
| Ilustraciones del libro | `components/BookArt.tsx` |
| Avatar de la portada | `public/shurahiwa.png` (si no existe se dibuja la pantera) |
| Colores y tipografías | variables al inicio de `app/globals.css` (paleta rosa/azul del cabello) y `app/extras.css` |
| Colores de cada acto en el fondo | `ACTS` en `components/Atmosphere.tsx` |

Todas las secciones respetan `prefers-reduced-motion`.
