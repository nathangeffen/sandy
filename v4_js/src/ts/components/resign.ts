import {
  TransmitMove, RESIGN
} from "../common.js";

import {
  GameUX
} from "../gameux.js";

export class Resign {
  gameUX: GameUX;
  button: HTMLButtonElement;

  constructor(gameUX: GameUX, button: HTMLButtonElement) {
    this.gameUX = gameUX;
    this.button = button;
  }

  addEvents(this: Resign) {
    const gameUX = this.gameUX;
    this.button.addEventListener('click', function(e) {
      e.preventDefault();
      const transmitMove: TransmitMove = {
        gameId: gameUX.gameId,
        transmitter: gameUX.options.thisSide,
        ply: RESIGN,
        move: null
      };
      gameUX.socket.emit("game", transmitMove);
    });
  }
}

