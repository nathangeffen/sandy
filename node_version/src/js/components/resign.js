import { RESIGN } from "../common.js";
export class Resign {
    constructor(gameUX, button) {
        this.gameUX = gameUX;
        this.button = button;
    }
    addEvents() {
        const gameUX = this.gameUX;
        this.button.addEventListener('click', function (e) {
            e.preventDefault();
            const transmitMove = {
                gameId: gameUX.gameId,
                transmitter: gameUX.options.thisSide,
                ply: RESIGN,
                move: null
            };
            gameUX.socket.emit("game", transmitMove);
        });
    }
}
