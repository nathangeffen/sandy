import { move as gameMove, SOUTH, NORTH, GameStatus, GameOverReason } from "../game.js";
import { RESIGN } from "../common.js";
const isItMe = function (sideNum, sideString) {
    if (sideNum === SOUTH && sideString.toLowerCase() === "south")
        return true;
    if (sideNum === NORTH && sideString.toLowerCase() === "north")
        return true;
    return false;
};
export class ManageGame {
    constructor(gameUX) {
        this.plySync = 0;
        this.update = function () {
            if (!this.board)
                return;
            const gameUX = this.gameUX;
            const position = this.gameUX.game.position;
            if (gameUX.inplay === true) {
                if (this.plySync !== position.ply - 1)
                    return;
                ++this.plySync;
                const transmitMove = {
                    gameId: gameUX.gameId,
                    transmitter: gameUX.options.thisSide,
                    ply: position.ply,
                    move: position.move
                };
                gameUX.socket.emit("game", transmitMove);
                const message = gameUX.components['message'];
                if (message)
                    message.set(`
          You are ${gameUX.options.thisSide}.
          It's your opponent's turn to play.
        `);
            }
        };
        this.addEvents = function () {
            const manageGame = this;
            const gameUX = this.gameUX;
            // HandleEvent to receive move, then inc plySent and plyReceived
            gameUX.socket.on(`g-${this.gameUX.gameId}`, (moveDetails) => {
                const position = gameUX.game.position;
                if (moveDetails.move === null && moveDetails.ply === RESIGN) {
                    position.gameStatus = (moveDetails.transmitter.toLowerCase() === "south")
                        ? GameStatus.North : GameStatus.South;
                    position.gameOverReason = GameOverReason.Resignation;
                    const message = gameUX.components['message'];
                    if (message)
                        message.set("");
                    gameUX.gameUXState = 4 /* GameUXState.GameOver */;
                    gameUX.update();
                    return;
                }
                // TO DO: Handle draw offers and acceptance
                if (manageGame.plySync !== moveDetails.ply - 1 || moveDetails.move === null)
                    return;
                try {
                    gameMove(gameUX.game, moveDetails.move);
                    gameUX.gameUXState = 1 /* GameUXState.WaitingUser */;
                    ++manageGame.plySync;
                    const message = gameUX.components['message'];
                    if (message)
                        message.set(`
          You are ${gameUX.options.thisSide}.
          It's your turn to play.
        `);
                    gameUX.update();
                }
                catch (err) {
                    alert("Error receiving move");
                }
            });
        };
        this.gameUX = gameUX;
        this.board = gameUX.components["board"];
        const toPlay = isItMe(gameUX.game.position.side, gameUX.options.thisSide) ? "" : "opponent's";
        const message = gameUX.components['message'];
        if (message)
            message.set(`
          You are ${gameUX.options.thisSide}.
          It's your ${toPlay} turn to play.
        `);
    }
}
