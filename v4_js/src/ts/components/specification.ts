import {
  positionToString
} from "../game.js";

import {
  GameUX
} from "../gameux.js";

// import {
//   Board
// } from "./board.js";

export class Specification {
  gameUX: GameUX;
  input: HTMLButtonElement;

  constructor(gameUX: GameUX, button: HTMLButtonElement) {
    this.gameUX = gameUX;
    this.input = button;
  }

  update(this: Specification) {
    console.log("Updating specification");
    this.input.value = positionToString(this.gameUX.game.position);
  }
}

