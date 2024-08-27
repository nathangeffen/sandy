import { expect, test } from "vitest";
import {
  fr,
  invFr,
  ROOK,
  DEFAULT_POSITION_STRING,
  loadPosition,
  positionToString,
  Game,
  getMoves,
} from "./game.ts";

test("fr calculates index correctly", () => {
  let index = 0;
  for (let rank = 0; rank < 9; rank++) {
    for (let file = 0; file < 9; file++) {
      expect(fr(9, file, rank)).toStrictEqual(index);
      ++index;
    }
  }
});

test("inverseFr calculates file and rank correctly", () => {
  let index = 0;
  for (let rank = 0; rank < 9; rank++) {
    for (let file = 0; file < 9; file++) {
      expect(invFr(9, index)).toStrictEqual([file, rank]);
      ++index;
    }
  }
});

test("loadPosition works correctly", () => {
  const pos = loadPosition();
  expect(pos.squares[0].piece).toStrictEqual([ROOK, 0]);
});

test("positionToString works correctly", () => {
  const pos = loadPosition();
  const str = positionToString(pos);
  expect(str).toStrictEqual(DEFAULT_POSITION_STRING);
});

test("Moves are correctly calculated", () => {
  const pos = loadPosition();
  const game = new Game(pos);
  const moves = getMoves(game);
  expect(moves.length).toStrictEqual(39);
});
