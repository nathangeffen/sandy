import {
  SOUTH, NORTH
} from "../game.js";

import {
  GameUX
} from "../gameux.js";

import {
  Board
} from "./board.js";

export class Specification {
  gameUX: GameUX;
  input: HTMLButtonElement;

  constructor(gameUX: GameUX, button: HTMLButtonElement) {
    this.gameUX = gameUX;
    this.input = button;
  }

  addEvents(this: Specification) {
    const gameUX = this.gameUX;
    this.input.addEventListener('change', function(e) {
      e.preventDefault();
    });
  }
}

