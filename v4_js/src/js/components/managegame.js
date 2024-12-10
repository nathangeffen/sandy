import { move as gameMove } from "../game.js";
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
                console.log("Received move", moveDetails, manageGame.plySync, moveDetails.ply);
                if (manageGame.plySync !== moveDetails.ply - 1)
                    return;
                console.log("Processing move");
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
        const toPlay = (gameUX.options.thisSide === "South") ? "" : "opponent's";
        const message = gameUX.components['message'];
        if (message)
            message.set(`
          You are ${gameUX.options.thisSide}.
          It's your ${toPlay} turn to play.
        `);
    }
}
