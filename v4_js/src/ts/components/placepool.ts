import {
  PoolEntry, GameDetails,
} from "../common.js";

import {
  GameUX
} from "../gameux.js";

export class PlacePool {
  gameUX: GameUX;
  button: HTMLButtonElement;
  specificationName = "DEFAULT";
  gameRequested = false;


  constructor(gameUX: GameUX, button: HTMLButtonElement) {
    this.gameUX = gameUX;
    this.button = button;
  }

  chooseOpponent = function(this: PlacePool, opponentId: string) {
    this.gameUX.socket.emit('chooseopponent', [this.gameUX.socket.id, opponentId]);
  }

  addEvents = function(this: PlacePool) {
    const placePool = this;
    this.button.addEventListener('click', function(e) {
      e.preventDefault();
      placePool.gameRequested = !placePool.gameRequested;
      const poolEntry: PoolEntry = {
        session: placePool.gameUX.socket.id,
        name: placePool.specificationName,
        gameRequested: placePool.gameRequested
      };
      placePool.gameUX.socket.emit("placePool", poolEntry);
      if (placePool.gameRequested === true) {
        placePool.button.textContent = "Leave playing pool";
      } else {
        placePool.button.textContent = "Enter playing pool";
      }
    });

    this.gameUX.socket.on('placePool', (entries: PoolEntry[]) => {
      this.gameUX.components['pool'].setEntries(entries, this.gameUX.socket.id);
    });

    this.gameUX.socket.on("connect", () => {
      this.gameUX.socket.on(this.gameUX.socket.id, (gameDetails: GameDetails) => {
        let url: string;
        const side = gameDetails.side;
        url = `/play?game=${String(gameDetails.id)}&side=${side}`;
        console.log("Url:", url);
        document.location.href = url;
      });
    });
  }
}

