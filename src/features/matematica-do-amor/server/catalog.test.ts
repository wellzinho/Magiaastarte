import { describe, expect, it } from "vitest";
import { COUPLE, LIFE_PATHS, POSITIONS, lifePathRow, positionFit } from "./catalog";

describe("catálogo direto de 1 a 9 e caminhos", () => {
  it("tem quatro posições por número e 45 pares de caminho", () => {
    expect(Object.keys(POSITIONS)).toHaveLength(9);
    expect(Object.keys(COUPLE)).toHaveLength(9);
    for (let number = 1; number <= 9; number += 1) {
      const entry = POSITIONS[number];
      expect(entry?.motivation).toBeTruthy();
      expect(entry?.impression).toBeTruthy();
      expect(entry?.expression).toBeTruthy();
      expect(entry?.path).toBeTruthy();
      expect(new Set([entry?.motivation, entry?.impression, entry?.expression, entry?.path]).size).toBe(4);
    }
    expect(LIFE_PATHS).toHaveLength(45);
    expect(new Set(LIFE_PATHS.map((row) => `${row.a}-${row.b}`)).size).toBe(45);
  });

  it("não trata 5 com 6 como o mesmo que 6 com 5 na frase de quem é quem", () => {
    expect(positionFit(5, 6)).toBe("tension");
    expect(lifePathRow(5, 6).fit).toBe("adjustment");
    expect(lifePathRow(6, 5).text).toBe(lifePathRow(5, 6).text);
    expect(lifePathRow(2, 5).fit).toBe("tension");
    expect(lifePathRow(1, 3).fit).toBe("natural");
  });
});
