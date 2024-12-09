import {
  move as gameMove
} from "../game.js";

import {
  TransmitMove
} from "../common.js";

import {
  GameUX,
  GameUXState
} from "../gameux.js";

import {
  Board
} from "../components/board.js";

export class ManageGame {
  gameUX: GameUX;
  board: Board | null;
  plySync: number = -1;

  constructor(gameUX: GameUX) {
    this.gameUX = gameUX;
    this.board = gameUX.components["board"];
  }

  update = function(this: ManageGame) {
    if (!this.board) return;
    const gameUX = this.gameUX;
    const position = this.gameUX.game.position;
    if (gameUX.inplay === true) {
      if (this.plySync !== position.ply - 1) return;
      ++this.plySync;
      const transmitMove: TransmitMove = {
        gameId: gameUX.gameId,
        transmitter: gameUX.options.thisSide,
        ply: position.ply,
        move: position.move
      };
      gameUX.socket.emit("game", transmitMove);
    }
  }

  addEvents = function(this: ManageGame) {
    const manageGame = this;
    const gameUX = this.gameUX;
    // HandleEvent to receive move, then inc plySent and plyReceived
    gameUX.socket.on(`g-${this.gameUX.gameId}`, (moveDetails: any) => {
      console.log("Received move", moveDetails, manageGame.plySync, moveDetails.ply);
      if (manageGame.plySync !== moveDetails.ply - 1) return;
      console.log("Processing move");
      try {
        gameMove(gameUX.game, moveDetails.move);
        gameUX.gameUXState = GameUXState.WaitingUser;
        ++manageGame.plySync;
        gameUX.update();
      } catch (err) {
        alert("Error receiving move");
      }
    });
  }
}
