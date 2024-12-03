import {
  PoolEntry, GameDetails,
} from "../common.js";

import {
  GameUX
} from "../gameux.js";

import * as _ from "socket.io-client";

export class PlacePool {
  gameUX: GameUX;
  button: HTMLButtonElement;
  socket = io();
  specificationName = "DEFAULT";
  gameRequested = false;


  constructor(gameUX: GameUX, button: HTMLButtonElement) {
    this.gameUX = gameUX;
    this.button = button;
  }

  chooseOpponent = function(this: PlacePool, opponentId: string) {
    console.log("Choosing opponent");
    this.socket.emit('chooseopponent', [this.socket.id, opponentId]);
  }

  addEvents = function(this: PlacePool) {
    const placePool = this;
    this.button.addEventListener('click', function(e) {
      e.preventDefault();
      placePool.gameRequested = !placePool.gameRequested;
      const poolEntry: PoolEntry = {
        session: placePool.socket.id,
        name: placePool.specificationName,
        gameRequested: placePool.gameRequested
      };
      placePool.socket.emit("placePool", poolEntry);
      if (placePool.gameRequested === true) {
        placePool.button.textContent = "Leave playing pool";
      } else {
        placePool.button.textContent = "Enter playing pool";
      }
    });

    this.socket.on('placePool', (entries: PoolEntry[]) => {
      this.gameUX.components['pool'].setEntries(entries, this.socket.id);
    });

    this.socket.on(this.socket.id, (gameDetails: Object) => {
      if (gameDetails.action !== "startgame") {
        console.log("Action not understood:", gameDetails.action);
        return;
      }

    });
  }
}

