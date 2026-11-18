"use client";

import Atmosphere from "./Atmosphere";
import Sprites from "./Sprites";
import Room from "./room/Room";

/* El regalo es una sola habitación de juegos: una cámara en primera persona viaja entre la PC, la GBA, el tamagochi y la Switch. */
export default function Experience() {
  return (
    <main>
      <Sprites />
      <Atmosphere />
      <Room />
    </main>
  );
}
